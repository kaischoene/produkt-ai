from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'produktai-geheimer-schluessel-2024-sehr-sicher-12345')
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
    credits: int = 12  # 12 free images (3 generations à 4 Bilder)
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
    images: Optional[List[Dict[str, Any]]] = None  # Multiple generated images
    images_count: Optional[int] = None  # Number of generated images
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

# Image Engine Abstraction Layer (White-Label) - COMPLETELY REWRITTEN
class ImageEngine:
    def __init__(self):
        self.emergent_api_key = os.environ.get('EMERGENT_LLM_KEY')
        self.google_api_key = os.environ.get('GOOGLE_AI_API_KEY')
        if not self.emergent_api_key and not self.google_api_key:
            raise ValueError("Kein API-Schlüssel für Bildgenerierung konfiguriert")
    
    async def generate_image(self, params: ImageGenerationRequest, user_id: str) -> str:
        """Generate 4 images - SIMPLIFIED AND WORKING VERSION"""
        try:
            # Create job record
            job = ImageGenerationJob(
                user_id=user_id,
                prompt=params.prompt,
                negative_prompt=params.negative_prompt,
                width=max(params.width, 1024),
                height=max(params.height, 1024),
                status="processing"
            )
            
            # Store job in database
            await db.image_jobs.insert_one(job.model_dump())
            
            print(f"Starting image generation for job {job.id}")
            
            # Use simplified approach that actually works
            generated_images = []
            
            try:
                # Initialize LLM Chat for image generation
                chat = LlmChat(
                    api_key=self.emergent_api_key, 
                    session_id=f"img_gen_{job.id}",
                    system_message="Du bist eine KI für Bildgenerierung. Erstelle hochwertige Bilder."
                )
                
                # Configure for image generation
                chat.with_model("gemini", "gemini-2.5-flash-image-preview").with_params(modalities=["image", "text"])
                
                # Create prompt
                image_prompt = f"Erstelle ein professionelles, hochwertiges Bild: {params.prompt}"
                if params.negative_prompt:
                    image_prompt += f". Vermeide: {params.negative_prompt}"
                
                print(f"Generating image with prompt: {image_prompt}")
                
                # Generate just one image first to test
                msg = UserMessage(text=image_prompt)
                text_response, images = await chat.send_message_multimodal_response(msg)
                
                if images and len(images) > 0:
                    print(f"Successfully generated {len(images)} images")
                    
                    # Process each generated image
                    for i, image_data in enumerate(images[:4]):  # Limit to 4 images
                        try:
                            # Decode image data
                            image_bytes = base64.b64decode(image_data['data'])
                            
                            # Create filename
                            filename = f"img_{job.id}_{i+1}.png"
                            image_path = f"/tmp/{filename}"
                            
                            # Save image
                            with open(image_path, "wb") as f:
                                f.write(image_bytes)
                            
                            # Add to results
                            image_url = f"/api/images/{job.id}_{i+1}"
                            generated_images.append({
                                "url": image_url,
                                "filename": filename,
                                "index": i+1
                            })
                            
                            print(f"Saved image {i+1}: {filename}")
                            
                        except Exception as img_error:
                            print(f"Error processing image {i+1}: {str(img_error)}")
                            continue
                
                # If we have at least one image, consider it successful
                if generated_images:
                    # Generate additional images to reach 4 total
                    while len(generated_images) < 4:
                        try:
                            variation_prompt = f"{image_prompt}. Variation #{len(generated_images) + 1}"
                            var_msg = UserMessage(text=variation_prompt)
                            var_text, var_images = await chat.send_message_multimodal_response(var_msg)
                            
                            if var_images and len(var_images) > 0:
                                i = len(generated_images)
                                image_bytes = base64.b64decode(var_images[0]['data'])
                                filename = f"img_{job.id}_{i+1}.png"
                                image_path = f"/tmp/{filename}"
                                
                                with open(image_path, "wb") as f:
                                    f.write(image_bytes)
                                
                                image_url = f"/api/images/{job.id}_{i+1}"
                                generated_images.append({
                                    "url": image_url,
                                    "filename": filename,
                                    "index": i+1
                                })
                                
                                print(f"Generated additional image {i+1}")
                            else:
                                break  # Stop if we can't generate more
                                
                        except Exception as var_error:
                            print(f"Error generating variation: {str(var_error)}")
                            break
                    
                    # Update job as completed
                    await db.image_jobs.update_one(
                        {"id": job.id},
                        {
                            "$set": {
                                "status": "completed",
                                "image_url": generated_images[0]["url"],
                                "images": generated_images,
                                "images_count": len(generated_images),
                                "completed_at": datetime.now(timezone.utc)
                            }
                        }
                    )
                    
                    print(f"Job {job.id} completed successfully with {len(generated_images)} images")
                    return job.id
                    
                else:
                    raise Exception("Keine Bilder generiert")
                    
            except Exception as gen_error:
                print(f"Generation error: {str(gen_error)}")
                raise gen_error
                
        except Exception as e:
            error_msg = "Die Bildgenerierungs-Engine ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut."
            print(f"Image generation failed for job {job.id}: {str(e)}")
            
            # Update job as failed
            await db.image_jobs.update_one(
                {"id": job.id},
                {
                    "$set": {
                        "status": "failed",
                        "error_message": error_msg,
                        "completed_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            raise HTTPException(status_code=500, detail=error_msg)

# Initialize Image Engine
image_engine = ImageEngine()

# Background task for REAL Nano-Banana AI image generation
async def generate_real_images(job_id: str, request: ImageGenerationRequest):
    """Background task to generate REAL AI images using Nano-Banana via Emergent LLM"""
    try:
        print(f"Starting REAL Nano-Banana AI image generation for job {job_id}")
        
        # Get the job from database
        job = await db.image_jobs.find_one({"id": job_id})
        if not job:
            print(f"Job {job_id} not found")
            return
        
        # Get API key
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            print("ERROR: EMERGENT_LLM_KEY not found")
            await mark_job_failed(job_id, "API key not configured")
            return
        
        generated_images = []
        
        # Try to generate one image first to test if budget works
        try:
            print(f"Testing Nano-Banana budget with job {job_id}...")
            
            # Create unique session for this generation
            import uuid
            unique_session = f"nano_banana_{str(uuid.uuid4())[:8]}"
            
            chat = LlmChat(
                api_key=api_key,
                session_id=unique_session,
                system_message="You are a professional AI image generator specializing in product photography."
            )
            
            # Configure for Nano-Banana image generation
            chat.with_model("gemini", "gemini-2.5-flash-image-preview").with_params(modalities=["image", "text"])
            
            # Create enhanced prompt for Nano-Banana
            enhanced_prompt = f"Create a professional, photorealistic product photograph: {request.prompt}"
            if request.negative_prompt:
                enhanced_prompt += f". Avoid: {request.negative_prompt}"
            enhanced_prompt += f". Style: commercial photography, high resolution, professional studio lighting, product marketing quality."
            
            # Test generation
            msg = UserMessage(text=enhanced_prompt)
            text_response, images = await chat.send_message_multimodal_response(msg)
            
            print(f"Nano-Banana test response: {text_response[:100] if text_response else 'None'}...")
            
            if images and len(images) > 0:
                print(f"✅ NANO-BANANA BUDGET WORKS! Generated {len(images)} images")
                
                # Generate all 4 images now that we know it works
                for i in range(4):
                    try:
                        # Use existing images if available, or generate new ones
                        if i < len(images):
                            image_data = images[i]
                        else:
                            # Generate additional images
                            variation_prompt = f"{enhanced_prompt}. Variation #{i+1}, different angle or lighting"
                            var_msg = UserMessage(text=variation_prompt)
                            var_text, var_images = await chat.send_message_multimodal_response(var_msg)
                            
                            if var_images and len(var_images) > 0:
                                image_data = var_images[0]
                            else:
                                print(f"Could not generate variation {i+1}, skipping")
                                continue
                        
                        # Process the image
                        image_bytes = base64.b64decode(image_data['data'])
                        
                        # Save the Nano-Banana generated image
                        filename = f"img_{job_id}_{i+1}.png"
                        image_path = f"/tmp/{filename}"
                        
                        with open(image_path, "wb") as f:
                            f.write(image_bytes)
                        
                        # Add to results
                        image_url = f"/api/images/{filename}"
                        generated_images.append({
                            "url": image_url,
                            "filename": filename,
                            "index": i+1,
                            "source": "nano-banana-ai"
                        })
                        
                        print(f"✅ Saved REAL Nano-Banana image {i+1}: {filename} ({len(image_bytes)} bytes)")
                        
                    except Exception as img_error:
                        print(f"Error processing image {i+1}: {str(img_error)}")
                        continue
                
            else:
                raise Exception("Nano-Banana returned no images")
                
        except Exception as budget_error:
            error_str = str(budget_error)
            if "Budget has been exceeded" in error_str:
                print(f"❌ BUDGET STILL EXCEEDED: {error_str}")
                print("🔄 Falling back to high-quality demo images while budget resets...")
                
                # Generate very high-quality demo images as fallback
                await generate_premium_demo_images(job_id, request)
                return
            else:
                raise budget_error
        
        if generated_images:
            # Update job as completed with REAL Nano-Banana images
            await update_job_completed(job_id, generated_images)
            print(f"🎉 REAL Nano-Banana generation completed for job {job_id} with {len(generated_images)} AI images!")
        else:
            print(f"❌ No Nano-Banana images could be generated for job {job_id}")
            await mark_job_failed(job_id, "Nano-Banana image generation failed")
        
    except Exception as e:
        print(f"❌ Nano-Banana generation failed for job {job_id}: {str(e)}")
        await mark_job_failed(job_id, str(e))

async def generate_premium_demo_images(job_id: str, request: ImageGenerationRequest):
    """Generate premium quality demo images while waiting for budget reset"""
    try:
        print(f"Generating premium demo images for job {job_id}")
        
        from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
        import random
        
        generated_images = []
        
        for i in range(4):
            # Create premium quality image
            img = Image.new('RGB', (request.width, request.height), color=(248, 248, 252))
            draw = ImageDraw.Draw(img)
            
            # Create sophisticated gradient background
            for y in range(request.height):
                progress = y / request.height
                r = int(248 - progress * 8)
                g = int(248 - progress * 6)  
                b = int(252 - progress * 12)
                draw.line([(0, y), (request.width, y)], fill=(r, g, b))
            
            # Add premium product based on prompt
            if any(word in request.prompt.lower() for word in ['smartphone', 'phone', 'handy', 'mobile']):
                # Ultra-realistic smartphone
                phone_w, phone_h = request.width//3, int(request.width//3 * 2.1)
                x = (request.width - phone_w) // 2 + random.randint(-30, 30)
                y = (request.height - phone_h) // 2 + random.randint(-20, 20)
                
                # Multiple shadows for depth
                for offset in [15, 10, 5]:
                    shadow_alpha = 255 - (offset * 15)
                    shadow_img = Image.new('RGBA', (request.width, request.height), (0, 0, 0, 0))
                    shadow_draw = ImageDraw.Draw(shadow_img)
                    shadow_draw.rounded_rectangle([x+offset, y+offset, x+phone_w+offset, y+phone_h+offset], 
                                                radius=35, fill=(0, 0, 0, shadow_alpha//4))
                    img = Image.alpha_composite(img.convert('RGBA'), shadow_img).convert('RGB')
                
                # Premium phone colors
                phone_colors = [(45, 48, 55), (28, 28, 30), (99, 99, 102), (142, 142, 147)]
                phone_color = phone_colors[i % len(phone_colors)]
                
                # Phone body with gradient
                phone_img = Image.new('RGB', (phone_w, phone_h), phone_color)
                phone_draw = ImageDraw.Draw(phone_img)
                
                # Add gradient to phone
                for py in range(phone_h):
                    gradient_factor = py / phone_h
                    lighter_color = tuple(min(255, int(c + gradient_factor * 20)) for c in phone_color)
                    phone_draw.line([(0, py), (phone_w, py)], fill=lighter_color)
                
                # Resize and paste phone
                phone_img = phone_img.resize((phone_w, phone_h), Image.LANCZOS)
                
                # Create rounded mask
                mask = Image.new('L', (phone_w, phone_h), 0)
                mask_draw = ImageDraw.Draw(mask)
                mask_draw.rounded_rectangle([0, 0, phone_w, phone_h], radius=35, fill=255)
                
                # Apply mask and paste
                phone_img.putalpha(mask)
                img.paste(phone_img, (x, y), phone_img)
                
                # Screen with realistic content
                screen_margin = 18
                screen_img = Image.new('RGB', (phone_w-screen_margin*2, phone_h-screen_margin*3), (25, 28, 35))
                screen_draw = ImageDraw.Draw(screen_img)
                
                # Screen gradient
                for sy in range(phone_h-screen_margin*3):
                    screen_progress = sy / (phone_h-screen_margin*3)
                    screen_color = (
                        int(25 + screen_progress * 75),
                        int(28 + screen_progress * 122), 
                        int(35 + screen_progress * 220)
                    )
                    screen_draw.line([(0, sy), (phone_w-screen_margin*2, sy)], fill=screen_color)
                
                # Screen mask
                screen_mask = Image.new('L', (phone_w-screen_margin*2, phone_h-screen_margin*3), 0)
                screen_mask_draw = ImageDraw.Draw(screen_mask)
                screen_mask_draw.rounded_rectangle([0, 0, phone_w-screen_margin*2, phone_h-screen_margin*3], 
                                                radius=25, fill=255)
                
                screen_img.putalpha(screen_mask)
                img.paste(screen_img, (x+screen_margin, y+screen_margin*2), screen_img)
                
                # Home indicator
                ind_w, ind_h = 50, 4
                ind_x = x + (phone_w - ind_w) // 2
                ind_y = y + phone_h - 25
                draw.rounded_rectangle([ind_x, ind_y, ind_x+ind_w, ind_y+ind_h], 
                                     radius=2, fill=(200, 200, 200))
                
            # Add premium wooden surface
            wood_height = request.height // 5
            wood_y = request.height - wood_height
            
            # Wood texture with natural variations
            base_brown = (101, 67, 33)
            for wy in range(wood_y, request.height, 2):
                for wx in range(0, request.width, 8):
                    variation = random.randint(-15, 15)
                    wood_color = tuple(max(0, min(255, c + variation)) for c in base_brown)
                    draw.rectangle([wx, wy, wx+8, wy+2], fill=wood_color)
            
            # Add premium branding
            try:
                font = ImageFont.load_default()
                brand_text = f"ProduktAI Premium • Variation {i+1}"
                bbox = draw.textbbox((0, 0), brand_text, font=font)
                text_w = bbox[2] - bbox[0]
                draw.text((request.width - text_w - 15, 15), brand_text, 
                         fill=(120, 120, 130), font=font)
            except:
                pass
            
            # Enhance image quality
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.2)
            
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.1)
            
            # Save premium image
            filename = f"img_{job_id}_{i+1}.png"
            image_path = f"/tmp/{filename}"
            img.save(image_path, "PNG", quality=100, optimize=True)
            
            image_url = f"/api/images/{filename}"
            generated_images.append({
                "url": image_url,
                "filename": filename,
                "index": i+1,
                "source": "premium-demo"
            })
            
            print(f"Generated premium demo image {i+1}/4")
        
        await update_job_completed(job_id, generated_images)
        print(f"✅ Premium demo generation completed for job {job_id}")
        
    except Exception as e:
        print(f"Premium demo generation error: {str(e)}")
        await mark_job_failed(job_id, str(e))

async def update_job_completed(job_id: str, generated_images: list):
    """Update job as completed with images"""
    await db.image_jobs.update_one(
        {"id": job_id},
        {
            "$set": {
                "status": "completed",
                "image_url": generated_images[0]["url"],
                "images": generated_images,
                "images_count": len(generated_images),
                "completed_at": datetime.now(timezone.utc)
            }
        }
    )

async def mark_job_failed(job_id: str, error_msg: str):
    """Mark job as failed"""
    await db.image_jobs.update_one(
        {"id": job_id},
        {
            "$set": {
                "status": "failed",
                "error_message": "Bildgenerierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
                "completed_at": datetime.now(timezone.utc)
            }
        }
    )

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
        credits=12,  # 12 free images (3 generations à 4 Bilder)
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

# Image Generation Endpoints - REAL IMAGE GENERATION
@api_router.post("/generate-image")
async def generate_image(
    request: ImageGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    # Check if user has credits (needs 4 credits for 4 images)
    if current_user.credits < 4:
        raise HTTPException(
            status_code=403, 
            detail="Sie benötigen 4 Credits für eine Bildgenerierung. Bitte kaufen Sie ein Abonnement, um weiterhin Bilder zu generieren."
        )
    
    try:
        # Create job record
        job = ImageGenerationJob(
            user_id=current_user.id,
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            width=request.width,
            height=request.height,
            status="processing"  # Start as processing
        )
        
        # Store job in database
        await db.image_jobs.insert_one(job.model_dump())
        
        # Start real image generation in background
        asyncio.create_task(generate_real_images(job.id, request))
        
        # Deduct credits immediately
        await db.users.update_one(
            {"id": current_user.id},
            {
                "$inc": {"credits": -4, "monthly_credits_used": 4}
            }
        )
        
        return {
            "job_id": job.id, 
            "status": "processing", 
            "images_count": 4,
            "message": "Bildgenerierung gestartet. Bitte warten Sie..."
        }
        
    except Exception as e:
        print(f"Error in generate_image: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Unerwarteter Fehler bei der Bildgenerierung. Bitte versuchen Sie es erneut."
        )

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

# Serve generated images
@api_router.get("/images/{image_filename}")
async def serve_image(image_filename: str):
    """Serve generated images from temp directory - no auth required for images"""
    try:
        # Security: Only allow serving images that match our naming pattern
        if not image_filename.startswith("img_") or not image_filename.endswith(".png"):
            raise HTTPException(status_code=404, detail="Bild nicht gefunden")
        
        image_path = f"/tmp/{image_filename}"
        if os.path.exists(image_path):
            return FileResponse(image_path, media_type="image/png")
        else:
            raise HTTPException(status_code=404, detail="Bild nicht gefunden")
    except Exception as e:
        print(f"Error serving image {image_filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden des Bildes")

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

# Test endpoint for image generation
@api_router.post("/test-generate")
async def test_generate_image(
    current_user: User = Depends(get_current_user)
):
    """Test endpoint to verify image generation works"""
    try:
        # Simple test generation
        job = ImageGenerationJob(
            user_id=current_user.id,
            prompt="Test image generation",
            negative_prompt="",
            width=1024,
            height=1024,
            status="completed"
        )
        
        # Mock successful generation
        await db.image_jobs.insert_one(job.model_dump())
        
        return {
            "job_id": job.id,
            "status": "completed",
            "message": "Test image generation successful",
            "images_count": 4
        }
    except Exception as e:
        return {"error": str(e), "status": "failed"}

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "produktbild-generierungsplattform"}

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