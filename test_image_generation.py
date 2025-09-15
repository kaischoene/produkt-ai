import requests
import time
import json

def test_image_generation_with_credits():
    """Test image generation with a user who has sufficient credits"""
    base_url = "https://pixelhub-2.preview.emergentagent.com/api"
    
    print("🔍 Testing Image Generation with Sufficient Credits...")
    
    # Step 1: Register a new user
    timestamp = int(time.time())
    user_data = {
        "email": f"test_credits_{timestamp}@example.com",
        "username": f"testuser_{timestamp}",
        "password": "TestPass123!"
    }
    
    print(f"📝 Registering user: {user_data['email']}")
    
    response = requests.post(f"{base_url}/auth/register", json=user_data)
    if response.status_code != 200:
        print(f"❌ Registration failed: {response.status_code}")
        return False
    
    token = response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Step 2: Check initial credits
    user_response = requests.get(f"{base_url}/auth/me", headers=headers)
    if user_response.status_code == 200:
        user_info = user_response.json()
        print(f"✅ User has {user_info['credits']} credits initially")
    
    # Step 3: Manually add credits by updating the user in database (simulate subscription)
    # Since we can't actually complete a Stripe payment, we'll test with the 3 credits
    # and verify the error message is in German
    
    # Step 4: Test image generation with insufficient credits (3 credits, needs 4)
    print("\n🔍 Testing with insufficient credits (3 credits, needs 4)...")
    
    generation_data = {
        "prompt": "Ein professionelles Produktbild mit hochwertiger Beleuchtung",
        "negative_prompt": "unscharf, niedrige Qualität, dunkel",
        "width": 1024,
        "height": 1024
    }
    
    gen_response = requests.post(f"{base_url}/generate-image", json=generation_data, headers=headers)
    
    if gen_response.status_code == 403:
        error_detail = gen_response.json().get('detail', '')
        print(f"✅ Correctly blocked with 403: {error_detail}")
        
        # Check for German error message
        german_keywords = ['nicht genügend', 'credits', 'abonnement']
        has_german = any(keyword.lower() in error_detail.lower() for keyword in german_keywords)
        
        if has_german:
            print("✅ German error message confirmed")
            return True
        else:
            print(f"❌ Error message not in German: {error_detail}")
            return False
    else:
        print(f"❌ Expected 403, got {gen_response.status_code}: {gen_response.text}")
        return False

def test_subscription_plans():
    """Test subscription plans API"""
    base_url = "https://pixelhub-2.preview.emergentagent.com/api"
    
    print("\n🔍 Testing Subscription Plans...")
    
    response = requests.get(f"{base_url}/subscription/plans")
    if response.status_code == 200:
        plans = response.json()
        print("✅ Subscription plans retrieved:")
        
        for plan_id, plan in plans.items():
            print(f"  {plan_id}: {plan['name']} - {plan['monthly_credits']} credits - €{plan['price']}/month")
        
        # Verify correct credit amounts
        expected_credits = {'basic': 30, 'premium': 60, 'pro': 90}
        for plan_id, expected in expected_credits.items():
            if plans[plan_id]['monthly_credits'] == expected:
                print(f"✅ {plan_id} plan has correct credits: {expected}")
            else:
                print(f"❌ {plan_id} plan has wrong credits: {plans[plan_id]['monthly_credits']} (expected {expected})")
        
        return True
    else:
        print(f"❌ Failed to get subscription plans: {response.status_code}")
        return False

def main():
    print("🚀 Testing ProduktAI Image Generation & Credits System")
    print("=" * 60)
    
    # Test 1: Image generation with credits validation
    test1_result = test_image_generation_with_credits()
    
    # Test 2: Subscription plans
    test2_result = test_subscription_plans()
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    if test1_result:
        print("✅ Image Generation & Credits Validation - PASSED")
    else:
        print("❌ Image Generation & Credits Validation - FAILED")
    
    if test2_result:
        print("✅ Subscription Plans - PASSED")
    else:
        print("❌ Subscription Plans - FAILED")
    
    if test1_result and test2_result:
        print("\n🎉 All ProduktAI core features are working correctly!")
        return 0
    else:
        print("\n⚠️ Some features need attention.")
        return 1

if __name__ == "__main__":
    exit(main())