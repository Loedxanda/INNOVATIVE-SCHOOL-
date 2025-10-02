#!/usr/bin/env python3
"""
Simple test script to verify that all services are working correctly
"""

import requests
import time

def test_service(url, name):
    """Test a service endpoint"""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"✓ {name}: OK (Status 200)")
            return True
        else:
            print(f"✗ {name}: FAILED (Status {response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ {name}: FAILED ({str(e)})")
        return False

def main():
    """Main test function"""
    print("=== Innovative School Platform - Service Health Check ===")
    print()
    
    # Wait a moment for services to start
    print("Waiting for services to initialize...")
    time.sleep(5)
    
    # Test all services
    services = [
        ("http://localhost:8000/health", "Main API"),
        ("http://localhost:8001/api/ai/health", "AI Service"),
        ("http://localhost:3000", "Frontend")
    ]
    
    results = []
    for url, name in services:
        result = test_service(url, name)
        results.append(result)
    
    # Summary
    print()
    print("=== Test Summary ===")
    passed = sum(results)
    total = len(results)
    print(f"Services OK: {passed}/{total}")
    
    if passed == total:
        print("🎉 All services are running correctly!")
        return 0
    else:
        print("❌ Some services are not responding.")
        return 1

if __name__ == "__main__":
    exit(main())