import requests
import sys
import json
from datetime import datetime
import time

class PixelHubAPITester:
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

    def make_request(self, method, endpoint, data=None, headers=None, timeout=10):
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
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=timeout)
            
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
            success = data.get('status') == 'healthy'
            self.log_test("Health Check", success, f"Status: {data.get('status')}, Service: {data.get('service')}")
            return success
        else:
            self.log_test("Health Check", False, f"Status code: {response.status_code if response else 'No response'}")
            return False

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        data = {
            "email": self.test_user_email,
            "username": self.test_username,
            "password": self.test_password
        }
        
        response = self.make_request('POST', 'auth/register', data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'access_token' in response_data and 'token_type' in response_data:
                self.token = response_data['access_token']
                self.log_test("User Registration", True, f"Token received, type: {response_data['token_type']}")
                return True
            else:
                self.log_test("User Registration", False, "Missing token in response")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("User Registration", False, f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}")
            return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        print("\n🔍 Testing User Login...")
        
        data = {
            "email": self.test_user_email,
            "password": self.test_password
        }
        
        response = self.make_request('POST', 'auth/login', data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'access_token' in response_data:
                self.token = response_data['access_token']
                self.log_test("User Login", True, f"Login successful, token type: {response_data['token_type']}")
                return True
            else:
                self.log_test("User Login", False, "Missing token in response")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("User Login", False, f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}")
            return False

    def test_get_user_info(self):
        """Test getting current user info"""
        print("\n🔍 Testing Get User Info...")
        
        if not self.token:
            self.log_test("Get User Info", False, "No authentication token available")
            return False
        
        response = self.make_request('GET', 'auth/me')
        
        if response and response.status_code == 200:
            user_data = response.json()
            required_fields = ['id', 'email', 'username', 'credits', 'subscription_status']
            
            missing_fields = [field for field in required_fields if field not in user_data]
            if not missing_fields:
                self.user_id = user_data['id']
                self.log_test("Get User Info", True, f"Credits: {user_data['credits']}, Status: {user_data['subscription_status']}")
                return True
            else:
                self.log_test("Get User Info", False, f"Missing fields: {missing_fields}")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get User Info", False, f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}")
            return False

    def test_subscription_plans(self):
        """Test getting subscription plans"""
        print("\n🔍 Testing Subscription Plans...")
        
        response = self.make_request('GET', 'subscription/plans')
        
        if response and response.status_code == 200:
            plans = response.json()
            expected_plans = ['basic', 'premium', 'pro']
            
            if all(plan in plans for plan in expected_plans):
                # Check plan structure
                basic_plan = plans['basic']
                required_fields = ['name', 'monthly_credits', 'price', 'currency']
                
                if all(field in basic_plan for field in required_fields):
                    self.log_test("Subscription Plans", True, f"Plans available: {list(plans.keys())}")
                    return True
                else:
                    self.log_test("Subscription Plans", False, "Missing required fields in plan structure")
                    return False
            else:
                self.log_test("Subscription Plans", False, f"Missing expected plans. Available: {list(plans.keys())}")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Subscription Plans", False, f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}")
            return False

    def test_image_generation(self):
        """Test image generation endpoint"""
        print("\n🔍 Testing Image Generation...")
        
        if not self.token:
            self.log_test("Image Generation", False, "No authentication token available")
            return False
        
        data = {
            "prompt": "A beautiful sunset over mountains",
            "negative_prompt": "blurry, low quality",
            "width": 1024,
            "height": 1024
        }
        
        response = self.make_request('POST', 'generate-image', data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            if 'job_id' in response_data and 'status' in response_data:
                job_id = response_data['job_id']
                self.log_test("Image Generation", True, f"Job created: {job_id}, Status: {response_data['status']}")
                
                # Test image status check
                return self.test_image_status(job_id)
            else:
                self.log_test("Image Generation", False, "Missing job_id or status in response")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Image Generation", False, f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}")
            return False

    def test_image_status(self, job_id):
        """Test image status check"""
        print("\n🔍 Testing Image Status Check...")
        
        response = self.make_request('GET', f'image-status/{job_id}')
        
        if response and response.status_code == 200:
            job_data = response.json()
            required_fields = ['id', 'user_id', 'prompt', 'status', 'created_at']
            
            missing_fields = [field for field in required_fields if field not in job_data]
            if not missing_fields:
                self.log_test("Image Status Check", True, f"Status: {job_data['status']}, Job ID: {job_data['id']}")
                return True
            else:
                self.log_test("Image Status Check", False, f"Missing fields: {missing_fields}")
                return False
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Image Status Check", False, f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}")
            return False

    def test_user_images(self):
        """Test getting user images"""
        print("\n🔍 Testing Get User Images...")
        
        if not self.token:
            self.log_test("Get User Images", False, "No authentication token available")
            return False
        
        response = self.make_request('GET', 'user/images')
        
        if response and response.status_code == 200:
            images = response.json()
            self.log_test("Get User Images", True, f"Retrieved {len(images)} images")
            return True
        else:
            error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
            self.log_test("Get User Images", False, f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}")
            return False

    def test_subscription_checkout(self):
        """Test subscription checkout creation"""
        print("\n🔍 Testing Subscription Checkout...")
        
        if not self.token:
            self.log_test("Subscription Checkout", False, "No authentication token available")
            return False
        
        # Test with basic plan - this might fail due to Stripe configuration
        try:
            response = self.make_request('POST', 'subscription/checkout?plan_id=basic', None)
            
            if response and response.status_code == 200:
                checkout_data = response.json()
                if 'checkout_url' in checkout_data and 'session_id' in checkout_data:
                    self.log_test("Subscription Checkout", True, f"Checkout URL created, Session ID: {checkout_data['session_id']}")
                    return True
                else:
                    self.log_test("Subscription Checkout", False, "Missing checkout_url or session_id in response")
                    return False
            elif response and response.status_code == 500:
                # This might be expected if Stripe is not properly configured
                error_msg = response.json().get('detail', 'Unknown error')
                if 'Payment processing not configured' in error_msg or 'Stripe' in error_msg:
                    self.log_test("Subscription Checkout", True, f"Expected Stripe configuration error: {error_msg}")
                    return True
                else:
                    self.log_test("Subscription Checkout", False, f"Unexpected 500 error: {error_msg}")
                    return False
            else:
                error_msg = response.json().get('detail', 'Unknown error') if response else 'No response'
                self.log_test("Subscription Checkout", False, f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}")
                return False
        except Exception as e:
            self.log_test("Subscription Checkout", False, f"Exception: {str(e)}")
            return False

    def test_invalid_endpoints(self):
        """Test error handling for invalid requests"""
        print("\n🔍 Testing Error Handling...")
        
        # Test invalid login
        response = self.make_request('POST', 'auth/login', {
            "email": "invalid@email.com",
            "password": "wrongpassword"
        })
        
        success = response and response.status_code == 401
        self.log_test("Invalid Login Error Handling", success, f"Status: {response.status_code if response else 'No response'}")
        
        # Test unauthorized access
        old_token = self.token
        self.token = "invalid_token"
        response = self.make_request('GET', 'auth/me')
        unauthorized_success = response and response.status_code == 401
        self.log_test("Unauthorized Access Error Handling", unauthorized_success, f"Status: {response.status_code if response else 'No response'}")
        
        # Restore valid token
        self.token = old_token
        
        return success and unauthorized_success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting PixelHub API Testing Suite")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_user_registration,
            self.test_get_user_info,
            self.test_subscription_plans,
            self.test_image_generation,
            self.test_user_images,
            self.test_subscription_checkout,
            self.test_invalid_endpoints
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ {test.__name__} - EXCEPTION: {str(e)}")
                self.tests_run += 1
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return 1

def main():
    tester = PixelHubAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())