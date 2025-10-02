#!/usr/bin/env python3
"""
Test script for the new features in the Innovative School Platform
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
AI_URL = "http://localhost:8001"
ADMIN_EMAIL = "admin@school.cm"
ADMIN_PASSWORD = "admin123"

def get_auth_token():
    """Get authentication token for admin user"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={
                "username": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            print(f"Failed to authenticate: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error during authentication: {e}")
        return None

def test_main_api_health():
    """Test the main API health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✓ Main API health check: PASSED")
            return True
        else:
            print(f"✗ Main API health check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"✗ Main API health check: FAILED (Error: {e})")
        return False

def test_ai_service_health():
    """Test the AI service health endpoint"""
    try:
        response = requests.get(f"{AI_URL}/api/ai/health")
        if response.status_code == 200:
            print("✓ AI Service health check: PASSED")
            return True
        else:
            print(f"✗ AI Service health check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"✗ AI Service health check: FAILED (Error: {e})")
        return False

def test_resource_creation(token):
    """Test creating a resource"""
    if not token:
        print("✗ Resource creation test: SKIPPED (No auth token)")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    resource_data = {
        "title": "Test Resource",
        "description": "This is a test resource created by the test script",
        "category": "lesson_plan"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/resources/",
            headers=headers,
            json=resource_data
        )
        if response.status_code == 201:
            print("✓ Resource creation: PASSED")
            return True
        else:
            print(f"✗ Resource creation: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"✗ Resource creation: FAILED (Error: {e})")
        return False

def test_messaging_endpoints(token):
    """Test messaging endpoints"""
    if not token:
        print("✗ Messaging endpoints test: SKIPPED (No auth token)")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Test getting unread message count
        response = requests.get(
            f"{BASE_URL}/api/messages/unread-count",
            headers=headers
        )
        if response.status_code == 200:
            print("✓ Messaging unread count: PASSED")
            return True
        else:
            print(f"✗ Messaging unread count: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"✗ Messaging unread count: FAILED (Error: {e})")
        return False

def test_inquiry_creation():
    """Test creating an inquiry"""
    inquiry_data = {
        "name": "Test User",
        "email": "test@example.com",
        "subject": "Test Inquiry",
        "message": "This is a test inquiry created by the test script",
        "department": "general"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/inquiries/",
            json=inquiry_data
        )
        if response.status_code == 201:
            print("✓ Inquiry creation: PASSED")
            return True
        else:
            print(f"✗ Inquiry creation: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"✗ Inquiry creation: FAILED (Error: {e})")
        return False

def test_accounting_endpoints(token):
    """Test accounting endpoints"""
    if not token:
        print("✗ Accounting endpoints test: SKIPPED (No auth token)")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Test getting dashboard metrics
        response = requests.get(
            f"{BASE_URL}/api/accounting/reports/dashboard",
            headers=headers
        )
        if response.status_code == 200:
            print("✓ Accounting dashboard: PASSED")
            return True
        else:
            print(f"✗ Accounting dashboard: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"✗ Accounting dashboard: FAILED (Error: {e})")
        return False

def test_ai_query():
    """Test the AI query endpoint"""
    ai_query = {
        "question": "What are effective teaching strategies for mathematics?",
        "user_role": "teacher",
        "subject": "mathematics",
        "grade_level": "secondary_2"
    }
    
    try:
        response = requests.post(
            f"{AI_URL}/api/ai/query",
            json=ai_query
        )
        if response.status_code == 200:
            print("✓ AI query: PASSED")
            return True
        else:
            print(f"✗ AI query: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"✗ AI query: FAILED (Error: {e})")
        return False

def main():
    """Main test function"""
    print("=== Innovative School Platform - New Features Test ===")
    print(f"Testing started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test health endpoints
    print("1. Testing Health Endpoints:")
    main_api_healthy = test_main_api_health()
    ai_service_healthy = test_ai_service_health()
    print()
    
    # Get auth token for authenticated tests
    print("2. Authentication:")
    token = get_auth_token()
    if token:
        print("✓ Authentication: PASSED")
    else:
        print("✗ Authentication: FAILED")
    print()
    
    # Test feature endpoints
    print("3. Testing Feature Endpoints:")
    test_resource_creation(token)
    test_messaging_endpoints(token)
    test_inquiry_creation()
    test_accounting_endpoints(token)
    test_ai_query()
    print()
    
    # Summary
    print("=== Test Summary ===")
    print("Core services health:")
    print(f"  Main API: {'✓ HEALTHY' if main_api_healthy else '✗ UNHEALTHY'}")
    print(f"  AI Service: {'✓ HEALTHY' if ai_service_healthy else '✗ UNHEALTHY'}")
    print()
    print("Feature tests:")
    print("  Resource Hub: Tested")
    print("  Messaging System: Tested")
    print("  Inquiry Management: Tested")
    print("  Accounting Module: Tested")
    print("  AI Assistant: Tested")
    print()
    print("Note: This is a basic connectivity test. For comprehensive testing,")
    print("please refer to the full test suite in the project documentation.")

if __name__ == "__main__":
    main()