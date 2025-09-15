from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import logging
import uuid
import base64
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Import Emergent Integrations
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI(title="ProduktAI - White Label Produktbild-Generierungsplattform")
api_router = APIRouter(prefix="/api")

# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    hashed_password: str
    credits: int = 3  # 3 free images
    subscription_plan: Optional[str] = None  # basic/premium/pro
    subscription_status: str = "free"  # free/active/cancelled
    subscription_period_start: Optional[datetime] = None
    subscription_period_end: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    monthly_credits_used: int = 0
    monthly_reset_date: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ImageGenerationRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = ""
    width: int = Field(default=1024, ge=512, le=2048)
    height: int = Field(default=1024, ge=512, le=2048)

class ImageGenerationJob(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    prompt: str
    negative_prompt: Optional[str] = ""
    width: int
    height: int
    status: str = "pending"  # pending/processing/completed/failed
    image_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    amount: float
    currency: str = "eur"
    status: str = "pending"  # pending/completed/failed/cancelled
    payment_status: str = "unpaid"  # unpaid/paid/failed
    subscription_plan: str  # basic/premium/pro
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

class SubscriptionPlan(BaseModel):
    name: str
    monthly_credits: int
    price: float
    currency: str = "eur"

# Subscription Plans
SUBSCRIPTION_PLANS = {
    "basic": SubscriptionPlan(name="Basic", monthly_credits=30, price=9.99, currency="eur"),
    "premium": SubscriptionPlan(name="Premium", monthly_credits=60, price=19.99, currency="eur"),
    "pro": SubscriptionPlan(name="Pro", monthly_credits=90, price=29.99, currency="eur")
}

# Password utilities
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# JWT utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return User(**user)

# Image Engine Abstraction Layer (White-Label)
class ImageEngine:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("IMAGE_ENGINE_API_KEY not configured")
    
    async def generate_image(self, params: ImageGenerationRequest, user_id: str) -> str:
        """Generate image using abstracted engine - no vendor specifics exposed"""
        try:
            # Create job record
            job = ImageGenerationJob(
                user_id=user_id,
                prompt=params.prompt,
                negative_prompt=params.negative_prompt,
                width=params.width,
                height=params.height,
                status="processing"
            )
            
            # Store job in database
            await db.image_jobs.insert_one(job.model_dump())
            
            # Initialize LLM Chat with Gemini model for image generation
            chat = LlmChat(
                api_key=self.api_key, 
                session_id=f"img_gen_{job.id}",
                system_message="You are an advanced image generation engine. Create high-quality images based on user prompts."
            )
            chat.with_model("gemini", "gemini-2.5-flash-image-preview").with_params(modalities=["image", "text"])
            
            # Create optimized prompt for image generation
            image_prompt = f"Create a high-quality image: {params.prompt}"
            if params.negative_prompt:
                image_prompt += f". Avoid: {params.negative_prompt}"
            
            msg = UserMessage(text=image_prompt)
            
            # Generate image
            text_response, images = await chat.send_message_multimodal_response(msg)
            
            if images and len(images) > 0:
                # Save the first generated image
                image_data = images[0]
                image_bytes = base64.b64decode(image_data['data'])
                
                # Create neutral filename (no vendor strings)
                filename = f"img_{job.id}.png"
                image_path = f"/tmp/{filename}"
                
                with open(image_path, "wb") as f:
                    f.write(image_bytes)
                
                # For now, we'll use a placeholder URL - in production, upload to S3/CDN
                image_url = f"/api/images/{job.id}"
                
                # Update job as completed
                await db.image_jobs.update_one(
                    {"id": job.id},
                    {
                        "$set": {
                            "status": "completed",
                            "image_url": image_url,
                            "completed_at": datetime.now(timezone.utc)
                        }
                    }
                )
                
                return job.id
            else:
                raise Exception("ENGINE_ERROR: No image generated")
                
        except Exception as e:
            # Generic error handling - no vendor-specific errors exposed
            await db.image_jobs.update_one(
                {"id": job.id},
                {
                    "$set": {
                        "status": "failed",
                        "error_message": "Image generation engine is currently unavailable. Please try again later.",
                        "completed_at": datetime.now(timezone.utc)
                    }
                }
            )
            raise HTTPException(status_code=500, detail="Image generation engine is currently unavailable. Please try again later.")

# Initialize Image Engine
image_engine = ImageEngine()

# User Management Endpoints
@api_router.post("/auth/register", response_model=Token)
async def register_user(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        credits=3,  # 3 free images
        monthly_reset_date=datetime.now(timezone.utc) + timedelta(days=30)
    )
    
    await db.users.insert_one(user.model_dump())
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login_user(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "credits": current_user.credits,
        "subscription_plan": current_user.subscription_plan,
        "subscription_status": current_user.subscription_status,
        "monthly_credits_used": current_user.monthly_credits_used
    }

# Image Generation Endpoints
@api_router.post("/generate-image")
async def generate_image(
    request: ImageGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    # Check if user has credits
    if current_user.credits <= 0:
        raise HTTPException(
            status_code=403, 
            detail="Insufficient credits. Please purchase a subscription to continue generating images."
        )
    
    # Generate image
    job_id = await image_engine.generate_image(request, current_user.id)
    
    # Deduct credit
    await db.users.update_one(
        {"id": current_user.id},
        {
            "$inc": {"credits": -1, "monthly_credits_used": 1}
        }
    )
    
    return {"job_id": job_id, "status": "processing"}

@api_router.get("/image-status/{job_id}")
async def get_image_status(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    job = await db.image_jobs.find_one({"id": job_id, "user_id": current_user.id})
    if not job:
        raise HTTPException(status_code=404, detail="Image generation job not found")
    
    return ImageGenerationJob(**job)

@api_router.get("/user/images")
async def get_user_images(current_user: User = Depends(get_current_user)):
    images = await db.image_jobs.find(
        {"user_id": current_user.id, "status": "completed"}
    ).sort("created_at", -1).to_list(50)
    
    return [ImageGenerationJob(**img) for img in images]

# Subscription Management
@api_router.get("/subscription/plans")
async def get_subscription_plans():
    return SUBSCRIPTION_PLANS

@api_router.post("/subscription/checkout")
async def create_subscription_checkout(
    plan_id: str,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    if plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail="Invalid subscription plan")
    
    plan = SUBSCRIPTION_PLANS[plan_id]
    
    # Get host URL for success/cancel URLs
    host_url = str(request.base_url).rstrip('/')
    success_url = f"{host_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/subscription/cancel"
    
    # Initialize Stripe checkout
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment processing not configured")
    
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=plan.price,
        currency=plan.currency,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user.id,
            "plan_id": plan_id,
            "source": "subscription_checkout"
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = PaymentTransaction(
        user_id=current_user.id,
        session_id=session.session_id,
        amount=plan.price,
        currency=plan.currency,
        subscription_plan=plan_id,
        metadata=checkout_request.metadata
    )
    
    await db.payment_transactions.insert_one(transaction.model_dump())
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@api_router.get("/subscription/status/{session_id}")
async def get_subscription_status(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    # Get transaction from database
    transaction = await db.payment_transactions.find_one({
        "session_id": session_id,
        "user_id": current_user.id
    })
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Payment session not found")
    
    # Check with Stripe
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    webhook_url = f"dummy-webhook-url"  # Not needed for status check
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    stripe_status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction status if changed
    if stripe_status.payment_status == "paid" and transaction["payment_status"] != "paid":
        # Activate subscription
        plan = SUBSCRIPTION_PLANS[transaction["subscription_plan"]]
        
        await db.users.update_one(
            {"id": current_user.id},
            {
                "$set": {
                    "subscription_plan": transaction["subscription_plan"],
                    "subscription_status": "active",
                    "credits": plan.monthly_credits,
                    "subscription_period_start": datetime.now(timezone.utc),
                    "subscription_period_end": datetime.now(timezone.utc) + timedelta(days=30),
                    "monthly_credits_used": 0,
                    "monthly_reset_date": datetime.now(timezone.utc) + timedelta(days=30)
                }
            }
        )
        
        # Update transaction
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "status": "completed",
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
    
    return {
        "payment_status": stripe_status.payment_status,
        "status": stripe_status.status,
        "amount": stripe_status.amount_total / 100,  # Convert from cents
        "currency": stripe_status.currency
    }

# Stripe Webhook
@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        stripe_api_key = os.environ.get('STRIPE_API_KEY')
        webhook_url = "dummy-webhook-url"  # Not needed for webhook handling
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.event_type == "checkout.session.completed":
            session_id = webhook_response.session_id
            
            # Find transaction
            transaction = await db.payment_transactions.find_one({"session_id": session_id})
            if transaction:
                # Activate subscription
                plan = SUBSCRIPTION_PLANS[transaction["subscription_plan"]]
                
                await db.users.update_one(
                    {"id": transaction["user_id"]},
                    {
                        "$set": {
                            "subscription_plan": transaction["subscription_plan"],
                            "subscription_status": "active",
                            "credits": plan.monthly_credits,
                            "subscription_period_start": datetime.now(timezone.utc),
                            "subscription_period_end": datetime.now(timezone.utc) + timedelta(days=30),
                            "monthly_credits_used": 0,
                            "monthly_reset_date": datetime.now(timezone.utc) + timedelta(days=30)
                        }
                    }
                )
                
                # Update transaction
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "status": "completed",
                            "payment_status": "paid",
                            "updated_at": datetime.now(timezone.utc)
                        }
                    }
                )
        
        return {"status": "success"}
        
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail="Webhook processing failed")

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "image-generation-platform"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()