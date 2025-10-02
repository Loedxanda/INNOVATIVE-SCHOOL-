#!/usr/bin/env python3
"""
Verification script to check if all components of the Innovative School Platform are properly installed
"""

import os
import sys
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists and print status"""
    if os.path.exists(filepath):
        print(f"✓ {description}: FOUND")
        return True
    else:
        print(f"✗ {description}: NOT FOUND")
        return False

def check_directory_exists(dirpath, description):
    """Check if a directory exists and print status"""
    if os.path.exists(dirpath) and os.path.isdir(dirpath):
        print(f"✓ {description}: FOUND")
        return True
    else:
        print(f"✗ {description}: NOT FOUND")
        return False

def main():
    """Main verification function"""
    print("=== Innovative School Platform - Installation Verification ===")
    print()
    
    # Define paths to check
    checks = [
        # Core directories
        (lambda: check_directory_exists("backend", "Backend directory")),
        (lambda: check_directory_exists("frontend", "Frontend directory")),
        (lambda: check_directory_exists("ai_services", "AI Services directory")),
        (lambda: check_directory_exists("ai_services/pedagogic_ai", "Pedagogic AI directory")),
        
        # Configuration files
        (lambda: check_file_exists(".env", "Main environment file")),
        (lambda: check_file_exists("backend/.env", "Backend environment file")),
        (lambda: check_file_exists("frontend/.env", "Frontend environment file")),
        (lambda: check_file_exists("docker-compose.yml", "Docker Compose file")),
        
        # Backend components
        (lambda: check_file_exists("backend/main.py", "Backend main application")),
        (lambda: check_file_exists("backend/models.py", "Backend models")),
        (lambda: check_file_exists("backend/database_service.py", "Database service")),
        (lambda: check_file_exists("backend/routes_resources.py", "Resources routes")),
        (lambda: check_file_exists("backend/routes_messaging.py", "Messaging routes")),
        (lambda: check_file_exists("backend/routes_inquiries.py", "Inquiries routes")),
        (lambda: check_file_exists("backend/routes_accounting.py", "Accounting routes")),
        
        # AI service components
        (lambda: check_file_exists("ai_services/pedagogic_ai/main.py", "AI service main application")),
        (lambda: check_file_exists("ai_services/pedagogic_ai/Dockerfile", "AI service Dockerfile")),
        (lambda: check_file_exists("ai_services/pedagogic_ai/requirements.txt", "AI service requirements")),
        
        # Frontend components
        (lambda: check_file_exists("frontend/package.json", "Frontend package.json")),
        (lambda: check_file_exists("frontend/Dockerfile", "Frontend Dockerfile")),
        
        # Documentation
        (lambda: check_file_exists("README.md", "README documentation")),
        (lambda: check_file_exists("AWS_DEPLOYMENT_GUIDE.md", "AWS deployment guide")),
        (lambda: check_file_exists("MOBILE_APP_DEVELOPMENT_GUIDE.md", "Mobile app development guide")),
        (lambda: check_file_exists("UI_UX_DESIGN_SPECIFICATION.md", "UI/UX design specification")),
        
        # Scripts
        (lambda: check_file_exists("scripts/install.bat", "Windows installation script")),
        (lambda: check_file_exists("scripts/install.sh", "Linux/Mac installation script")),
    ]
    
    # Run all checks
    results = []
    for check in checks:
        result = check()
        results.append(result)
    
    # Summary
    print()
    print("=== Verification Summary ===")
    passed = sum(results)
    total = len(results)
    print(f"Components verified: {passed}/{total}")
    
    if passed == total:
        print("🎉 All components are properly installed!")
        print()
        print("Next steps:")
        print("1. Run the installation script:")
        print("   Windows: scripts\\install.bat")
        print("   Linux/Mac: chmod +x scripts/install.sh && ./scripts/install.sh")
        print()
        print("2. Access the application at http://localhost:3000")
        return 0
    else:
        print("❌ Some components are missing. Please check the installation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())