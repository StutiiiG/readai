#!/usr/bin/env python3

import requests
import sys
import json
import os
from datetime import datetime
import tempfile

class DeepTutorAPITester:
    def __init__(self, base_url="https://airesearchhub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.session_id = None
        self.file_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    # Remove Content-Type for multipart/form-data
                    headers.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    self.log_test(name, True)
                    return True, response_data
                except:
                    self.log_test(name, True, "No JSON response")
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    error_msg = f"Expected {expected_status}, got {response.status_code}: {error_data}"
                except:
                    error_msg = f"Expected {expected_status}, got {response.status_code}: {response.text}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            self.log_test(name, False, error_msg)
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n" + "="*50)
        print("TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        self.run_test("API Root", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_auth_flow(self):
        """Test complete authentication flow"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION FLOW")
        print("="*50)
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"test_user_{timestamp}@deeptutor.test"
        test_password = "TestPass123!"
        test_name = f"Test User {timestamp}"

        # Test registration
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": test_password,
                "name": test_name
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
        
        # Test login with same credentials
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": test_email,
                "password": test_password
            }
        )
        
        # Test get current user
        if self.token:
            self.run_test("Get Current User", "GET", "auth/me", 200)
        
        # Test invalid login
        self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={
                "email": test_email,
                "password": "wrongpassword"
            }
        )

    def test_session_management(self):
        """Test session CRUD operations"""
        print("\n" + "="*50)
        print("TESTING SESSION MANAGEMENT")
        print("="*50)
        
        if not self.token:
            print("❌ Skipping session tests - no auth token")
            return
        
        # Create session
        success, response = self.run_test(
            "Create Session",
            "POST",
            "sessions",
            200,
            data={"title": "Test Research Session"}
        )
        
        if success and 'id' in response:
            self.session_id = response['id']
            print(f"   Session ID: {self.session_id}")
        
        # Get sessions list
        self.run_test("Get Sessions List", "GET", "sessions", 200)
        
        # Get specific session
        if self.session_id:
            self.run_test(
                "Get Specific Session",
                "GET",
                f"sessions/{self.session_id}",
                200
            )
            
            # Update session
            self.run_test(
                "Update Session",
                "PATCH",
                f"sessions/{self.session_id}",
                200,
                data={"title": "Updated Research Session"}
            )

    def test_file_upload(self):
        """Test file upload functionality"""
        print("\n" + "="*50)
        print("TESTING FILE UPLOAD")
        print("="*50)
        
        if not self.token or not self.session_id:
            print("❌ Skipping file tests - no auth token or session")
            return
        
        # Create a test text file
        test_content = """This is a test document for DeepTutor.
        
        Key findings:
        1. AI-powered research assistance improves productivity
        2. Document analysis with citations enhances accuracy
        3. Integration with Claude AI provides high-quality responses
        
        Conclusion: DeepTutor represents a significant advancement in research tools."""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(test_content)
            temp_file_path = f.name
        
        try:
            # Upload file
            with open(temp_file_path, 'rb') as f:
                files = {'file': ('test_document.txt', f, 'text/plain')}
                data = {'session_id': self.session_id}
                
                success, response = self.run_test(
                    "Upload Text File",
                    "POST",
                    "files/upload",
                    200,
                    data=data,
                    files=files
                )
                
                if success and 'id' in response:
                    self.file_id = response['id']
                    print(f"   File ID: {self.file_id}")
        
        finally:
            # Clean up temp file
            os.unlink(temp_file_path)
        
        # Get session files
        if self.session_id:
            self.run_test(
                "Get Session Files",
                "GET",
                f"files/session/{self.session_id}",
                200
            )

    def test_chat_functionality(self):
        """Test chat/AI functionality"""
        print("\n" + "="*50)
        print("TESTING CHAT FUNCTIONALITY")
        print("="*50)
        
        if not self.token or not self.session_id:
            print("❌ Skipping chat tests - no auth token or session")
            return
        
        # Get messages (should be empty initially)
        self.run_test(
            "Get Messages (Empty)",
            "GET",
            f"messages/{self.session_id}",
            200
        )
        
        # Send a chat message
        success, response = self.run_test(
            "Send Chat Message",
            "POST",
            "chat",
            200,
            data={
                "content": "What are the key findings mentioned in the uploaded document?",
                "session_id": self.session_id
            }
        )
        
        if success:
            print("   AI Response received successfully")
            if 'content' in response:
                print(f"   Response preview: {response['content'][:100]}...")
        
        # Get messages again (should have user message and AI response)
        self.run_test(
            "Get Messages (With Content)",
            "GET",
            f"messages/{self.session_id}",
            200
        )

    def test_cleanup(self):
        """Test cleanup operations"""
        print("\n" + "="*50)
        print("TESTING CLEANUP OPERATIONS")
        print("="*50)
        
        if not self.token:
            print("❌ Skipping cleanup tests - no auth token")
            return
        
        # Delete file
        if self.file_id:
            self.run_test(
                "Delete File",
                "DELETE",
                f"files/{self.file_id}",
                200
            )
        
        # Delete session
        if self.session_id:
            self.run_test(
                "Delete Session",
                "DELETE",
                f"sessions/{self.session_id}",
                200
            )

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting DeepTutor API Test Suite")
        print(f"📍 Base URL: {self.base_url}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            self.test_health_endpoints()
            self.test_auth_flow()
            self.test_session_management()
            self.test_file_upload()
            self.test_chat_functionality()
            self.test_cleanup()
            
        except KeyboardInterrupt:
            print("\n⚠️ Tests interrupted by user")
        except Exception as e:
            print(f"\n💥 Unexpected error: {e}")
        
        # Print summary
        print("\n" + "="*50)
        print("TEST SUMMARY")
        print("="*50)
        print(f"📊 Tests run: {self.tests_run}")
        print(f"✅ Tests passed: {self.tests_passed}")
        print(f"❌ Tests failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "No tests run")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = DeepTutorAPITester()
    success = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())