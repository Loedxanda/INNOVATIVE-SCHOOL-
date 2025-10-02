#!/usr/bin/env python3
"""
Simple script to check if the web services are accessible
"""

import requests
import time

def check_service(url, name):
    """Check if a service is accessible"""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"✓ {name}: Accessible (Status 200)")
            return True
        else:
            print(f"⚠ {name}: Returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ {name}: Not accessible ({str(e)})")
        return False

def main():
    """Main check function"""
    print("=== Innovative School Platform - Web Access Check ===")
    print()
    
    # Services to check
    services = [
        ("http://localhost:3000", "Frontend"),
        ("http://localhost:8000/docs", "Backend API Documentation"),
        ("http://localhost:8001/docs", "AI Service Documentation")
    ]
    
    print("Checking web services accessibility...")
    print()
    
    results = []
    for url, name in services:
        result = check_service(url, name)
        results.append(result)
        # Small delay between requests
        time.sleep(1)
    
    print()
    print("=== Summary ===")
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print("🎉 All web services are accessible!")
        print()
        print("You can now use the Innovative School Platform:")
        print("  Frontend: http://localhost:3000")
        print("  Backend API: http://localhost:8000")
        print("  AI Service: http://localhost:8001")
        print()
        print("Default admin credentials:")
        print("  Email: admin@school.cm")
        print("  Password: admin123")
        return 0
    elif passed > 0:
        print(f"⚠ {passed}/{total} services are accessible")
        print("Some services may still be starting up or encountered issues")
        return 1
    else:
        print("✗ No services are accessible")
        print()
        print("Troubleshooting steps:")
        print("1. Check if Docker Desktop is running")
        print("2. Run '.\\deploy_local.bat' to start the deployment")
        print("3. Wait for the deployment to complete (10-20 minutes)")
        print("4. Check service logs with 'docker-compose logs'")
        return 1

if __name__ == "__main__":
    exit(main())