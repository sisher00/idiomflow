#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for IdiomFlow
Tests all endpoints and functionality
"""

import requests
import sys
import json
from datetime import datetime

class IdiomFlowAPITester:
    def __init__(self, base_url="https://hey-chat-22.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            self.failed_tests.append(f"{name}: {details}")

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                expected_message = "Welcome to IdiomFlow API"
                success = expected_message in data.get("message", "")
            self.log_test("API Root Endpoint", success, 
                         f"Status: {response.status_code}, Response: {response.text[:100]}")
            return success
        except Exception as e:
            self.log_test("API Root Endpoint", False, str(e))
            return False

    def test_get_all_idioms(self):
        """Test getting all idioms"""
        try:
            response = requests.get(f"{self.api_url}/idioms", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = isinstance(data, list) and len(data) >= 76
                if success:
                    # Check structure of first idiom
                    first_idiom = data[0]
                    required_fields = ['id', 'idiom', 'meaning', 'example', 'related_idiom', 'difficulty_level', 'category', 'origin']
                    success = all(field in first_idiom for field in required_fields)
            self.log_test("Get All Idioms", success, 
                         f"Status: {response.status_code}, Count: {len(data) if success else 'N/A'}")
            return data if success else []
        except Exception as e:
            self.log_test("Get All Idioms", False, str(e))
            return []

    def test_search_idioms(self):
        """Test search functionality"""
        test_cases = [
            {"q": "break the ice", "expected_min": 1},
            {"q": "education", "expected_min": 0},
            {"category": "Popular", "expected_min": 1},
            {"difficulty": "Easy", "expected_min": 1},
            {"q": "nonexistent", "expected_min": 0}
        ]
        
        all_passed = True
        for case in test_cases:
            try:
                params = {k: v for k, v in case.items() if k != "expected_min"}
                response = requests.get(f"{self.api_url}/idioms/search", params=params, timeout=10)
                success = response.status_code == 200
                if success:
                    data = response.json()
                    success = isinstance(data, list) and len(data) >= case["expected_min"]
                
                test_name = f"Search Idioms ({', '.join(f'{k}={v}' for k, v in params.items())})"
                self.log_test(test_name, success, 
                             f"Status: {response.status_code}, Results: {len(data) if success else 'N/A'}")
                if not success:
                    all_passed = False
            except Exception as e:
                self.log_test(f"Search Idioms ({case})", False, str(e))
                all_passed = False
        
        return all_passed

    def test_get_categories(self):
        """Test getting categories"""
        try:
            response = requests.get(f"{self.api_url}/categories", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "categories" in data and isinstance(data["categories"], list) and len(data["categories"]) > 0
            self.log_test("Get Categories", success, 
                         f"Status: {response.status_code}, Categories: {data.get('categories', []) if success else 'N/A'}")
            return success
        except Exception as e:
            self.log_test("Get Categories", False, str(e))
            return False

    def test_get_difficulties(self):
        """Test getting difficulty levels"""
        try:
            response = requests.get(f"{self.api_url}/difficulties", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "difficulties" in data and isinstance(data["difficulties"], list) and len(data["difficulties"]) > 0
                if success:
                    expected_difficulties = ["Easy", "Medium", "Hard"]
                    success = any(diff in data["difficulties"] for diff in expected_difficulties)
            self.log_test("Get Difficulties", success, 
                         f"Status: {response.status_code}, Difficulties: {data.get('difficulties', []) if success else 'N/A'}")
            return success
        except Exception as e:
            self.log_test("Get Difficulties", False, str(e))
            return False

    def test_get_stats(self):
        """Test getting statistics"""
        try:
            response = requests.get(f"{self.api_url}/stats", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                required_fields = ["total_idioms", "categories", "difficulty_levels"]
                success = all(field in data for field in required_fields)
                if success:
                    success = data["total_idioms"] >= 76  # Should have at least 76 idioms
            self.log_test("Get Stats", success, 
                         f"Status: {response.status_code}, Stats: {data if success else 'N/A'}")
            return success
        except Exception as e:
            self.log_test("Get Stats", False, str(e))
            return False

    def test_status_endpoints(self):
        """Test status check endpoints"""
        try:
            # Test creating a status check
            test_data = {"client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"}
            response = requests.post(f"{self.api_url}/status", json=test_data, timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "id" in data and "client_name" in data and "timestamp" in data
            
            self.log_test("Create Status Check", success, 
                         f"Status: {response.status_code}")
            
            # Test getting status checks
            response = requests.get(f"{self.api_url}/status", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = isinstance(data, list)
            
            self.log_test("Get Status Checks", success, 
                         f"Status: {response.status_code}, Count: {len(data) if success else 'N/A'}")
            
            return success
        except Exception as e:
            self.log_test("Status Endpoints", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting IdiomFlow Backend API Tests")
        print("=" * 50)
        
        # Test basic connectivity first
        if not self.test_api_root():
            print("❌ API Root failed - stopping tests")
            return False
        
        # Test core idiom functionality
        idioms = self.test_get_all_idioms()
        if not idioms:
            print("❌ Failed to load idioms - stopping tests")
            return False
        
        # Test all other endpoints
        self.test_search_idioms()
        self.test_get_categories()
        self.test_get_difficulties()
        self.test_get_stats()
        self.test_status_endpoints()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"  - {failure}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n✨ Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ as passing

def main():
    """Main test execution"""
    tester = IdiomFlowAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())