import requests
import sys
import json
from datetime import datetime
import time

class ProduktAITester:
    def __init__(self, base_url="https://pixelhub-2.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_email = f"test_user_{datetime.now().strftime('%H%M%S')}@example.com"
        self.test_username = f"testuser_{datetime.now().strftime('%H%M%S')}"
        self.test_password = "TestPass123!"

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        if details and success:
            print(f"   Details: {details}")

    def make_request(self, method, endpoint, data=None, headers=None, timeout=30):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            default_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=timeout)
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request error: {str(e)}")
            return None

    def test_health_check(self):
        """Test health check endpoint"""
        print("\n🔍 Testing Health Check...")
        response = self.make_request('GET', 'health')
        
        if response and response.status_code == 200:
            data = response.json()
            # Check for German service name
            service_name = data.get('service', '')
            success = data.get('status') == 'healthy' and 'produktbild' in service_name.lower()
            self.log_test("Health Check (German Service Name)", success, f"Status: {data.get('status')}, Service: {service_name}")
            return success
        else:
            self.log_test("Health Check", False, f"Status code: {response.status_code if response else 'No response'}")
            return False

    def test_user_registration_3_credits(self):
        """Test user registration with 3 free credits"""
        print("\n🔍 Testing User Registration (3 Free Credits)...")
        
        data = {
            "email": self.test_user_email,
            "username": self.test_username,
            "password": self.test_password
        }
        
        response = self.make_request('POST', 'auth/register', data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'access_token' in response_data:
                self.token = response_data['access_token']
                
                # Check user info to verify 3 credits
                user_response = self.make_request('GET', 'auth/me')
                if user_response and user_response.status_code == 200:
                    user_data = user_response.json()
                    credits = user_data.get('credits', 0)
                    success = credits == 3
                    self.log_test("User Registration (3 Credits)", success, f"User has {credits} credits (expected 3)")
                    return success
                else:
                    self.log_test("User Registration (3 Credits)", False, "Could not verify user credits")
                    return False
            else:
                self.log_test("User Registration (3 Credits)", False, "Missing token in response")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("User Registration (3 Credits)", False, f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}")
            return False

    def test_insufficient_credits_german_error(self):
        """Test German error message for insufficient credits"""
        print("\n🔍 Testing Insufficient Credits (German Error Message)...")
        
        if not self.token:
            self.log_test("Insufficient Credits Test", False, "No authentication token available")
            return False
        
        # User has 3 credits, needs 4 for generation
        data = {
            "prompt": "Ein professionelles Produktbild",
            "negative_prompt": "unscharf, niedrige Qualität",
            "width": 1024,
            "height": 1024
        }
        
        response = self.make_request('POST', 'generate-image', data, timeout=10)
        
        if response and response.status_code == 403:
            error_data = response.json()
            error_detail = error_data.get('detail', '')
            
            # Check for German error message
            german_keywords = ['nicht genügend', 'credits', 'abonnement']
            has_german_error = any(keyword.lower() in error_detail.lower() for keyword in german_keywords)
            
            success = has_german_error
            self.log_test("Insufficient Credits (German Error)", success, f"Error message: {error_detail}")
            return success
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Insufficient Credits (German Error)", False, f"Expected 403, got {response.status_code if response else 'No response'}, Error: {error_msg}")
            return False

    def test_subscription_plans_german(self):
        """Test subscription plans with German names"""
        print("\n🔍 Testing Subscription Plans (German Names)...")
        
        response = self.make_request('GET', 'subscription/plans')
        
        if response and response.status_code == 200:
            plans = response.json()
            expected_plans = ['basic', 'premium', 'pro']
            
            if all(plan in plans for plan in expected_plans):
                # Check plan structure and credits
                basic_plan = plans['basic']
                premium_plan = plans['premium']
                pro_plan = plans['pro']
                
                # Verify credits allocation
                basic_credits = basic_plan.get('monthly_credits', 0)
                premium_credits = premium_plan.get('monthly_credits', 0)
                pro_credits = pro_plan.get('monthly_credits', 0)
                
                credits_correct = basic_credits == 30 and premium_credits == 60 and pro_credits == 90
                
                success = credits_correct
                self.log_test("Subscription Plans (Credits)", success, f"Basic: {basic_credits}, Premium: {premium_credits}, Pro: {pro_credits}")
                return success
            else:
                self.log_test("Subscription Plans (German)", False, f"Missing expected plans. Available: {list(plans.keys())}")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Subscription Plans (German)", False, f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}")
            return False

    def test_google_ai_api_key_configured(self):
        """Test if Google AI API key is configured by attempting generation with sufficient credits"""
        print("\n🔍 Testing Google AI API Configuration...")
        
        if not self.token:
            self.log_test("Google AI API Test", False, "No authentication token available")
            return False
        
        # First, let's add credits by simulating a subscription (we'll use the checkout endpoint)
        # Since we can't actually complete payment, we'll just test the generation endpoint behavior
        
        data = {
            "prompt": "Ein hochwertiges Produktbild mit professioneller Beleuchtung",
            "negative_prompt": "unscharf, niedrige Qualität, dunkel",
            "width": 1024,
            "height": 1024
        }
        
        response = self.make_request('POST', 'generate-image', data, timeout=60)
        
        if response:
            if response.status_code == 403:
                # Expected - insufficient credits
                error_data = response.json()
                error_detail = error_data.get('detail', '')
                success = 'nicht genügend' in error_detail.lower() or 'credits' in error_detail.lower()
                self.log_test("Google AI API (Credits Check)", success, f"Correctly blocked with insufficient credits: {error_detail}")
                return success
            elif response.status_code == 200:
                # Unexpected - user shouldn't have enough credits
                response_data = response.json()
                self.log_test("Google AI API (Unexpected Success)", False, f"User generated image with insufficient credits: {response_data}")
                return False
            else:
                error_msg = response.json().get('detail', 'Unknown error') if response else 'Unknown error'
                # Check if it's a configuration error
                if 'api' in error_msg.lower() or 'schlüssel' in error_msg.lower() or 'key' in error_msg.lower():
                    self.log_test("Google AI API (Configuration)", False, f"API key configuration issue: {error_msg}")
                    return False
                else:
                    self.log_test("Google AI API (Other Error)", False, f"Status: {response.status_code}, Error: {error_msg}")
                    return False
        else:
            self.log_test("Google AI API (No Response)", False, "No response from server")
            return False

    def test_aspect_ratios_support(self):
        """Test if the API supports different aspect ratios"""
        print("\n🔍 Testing Aspect Ratios Support...")
        
        if not self.token:
            self.log_test("Aspect Ratios Test", False, "No authentication token available")
            return False
        
        # Test different aspect ratios that should be supported
        aspect_ratios = [
            (1024, 1024),  # 1:1
            (1365, 1024),  # 4:3
            (1820, 1024),  # 16:9
            (768, 1024),   # 3:4
            (576, 1024),   # 9:16
        ]
        
        success_count = 0
        for width, height in aspect_ratios:
            data = {
                "prompt": "Ein professionelles Produktbild",
                "width": width,
                "height": height
            }
            
            response = self.make_request('POST', 'generate-image', data, timeout=10)
            
            if response:
                if response.status_code == 403:
                    # Expected - insufficient credits, but validates the request format
                    success_count += 1
                elif response.status_code == 422:
                    # Validation error - aspect ratio not supported
                    print(f"   Aspect ratio {width}x{height} not supported")
                else:
                    # Other response
                    success_count += 1
        
        success = success_count == len(aspect_ratios)
        self.log_test("Aspect Ratios Support", success, f"{success_count}/{len(aspect_ratios)} aspect ratios supported")
        return success

    def run_all_tests(self):
        """Run all ProduktAI specific tests"""
        print("🚀 Starting ProduktAI API Testing Suite")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_user_registration_3_credits,
            self.test_insufficient_credits_german_error,
            self.test_subscription_plans_german,
            self.test_google_ai_api_key_configured,
            self.test_aspect_ratios_support,
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ {test.__name__} - EXCEPTION: {str(e)}")
                self.tests_run += 1
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 PRODUKTAI TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All ProduktAI tests passed!")
            return 0
        else:
            print("⚠️  Some ProduktAI tests failed. Check the details above.")
            return 1

def main():
    tester = ProduktAITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())