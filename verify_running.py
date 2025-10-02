#!/usr/bin/env python3
"""
Verification script to check if the Innovative School Platform is running
"""

import subprocess
import time

def check_docker_compose_services():
    """Check if Docker Compose services are running"""
    try:
        result = subprocess.run(
            ["docker-compose", "ps"], 
            capture_output=True, 
            text=True,
            cwd=r"c:\Users\LORD XANDA\Desktop\INNOVATIVE-SCHOOL-"
        )
        if result.returncode == 0:
            output = result.stdout.strip()
            if "running" in output.lower() or "up" in output.lower():
                print("✓ Docker Compose services are running")
                print("Service details:")
                print(output)
                return True
            else:
                print("⚠ Docker Compose services are not running")
                print("Service status:")
                print(output)
                return False
        else:
            print(f"✗ Failed to check Docker Compose services: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Error checking Docker Compose services: {str(e)}")
        return False

def check_docker_containers():
    """Check if Docker containers are running"""
    try:
        result = subprocess.run(
            ["docker", "ps"], 
            capture_output=True, 
            text=True,
            cwd=r"c:\Users\LORD XANDA\Desktop\INNOVATIVE-SCHOOL-"
        )
        if result.returncode == 0:
            output = result.stdout.strip()
            if output and "CONTAINER" not in output:
                print("✓ Docker containers are running")
                print("Container details:")
                print(output)
                return True
            elif output:
                print("ℹ Docker is running but no containers are active")
                print("Container list:")
                print(output)
                return False
            else:
                print("⚠ No Docker containers are running")
                return False
        else:
            print(f"✗ Failed to check Docker containers: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Error checking Docker containers: {str(e)}")
        return False

def main():
    """Main verification function"""
    print("=== Innovative School Platform - Running Status Check ===")
    print()
    
    print("1. Checking Docker Compose services...")
    compose_status = check_docker_compose_services()
    
    print()
    print("2. Checking Docker containers...")
    container_status = check_docker_containers()
    
    print()
    print("=== Summary ===")
    if compose_status and container_status:
        print("🎉 The Innovative School Platform appears to be running!")
        print()
        print("You can access the application at:")
        print("  Frontend: http://localhost:3000")
        print("  Backend API: http://localhost:8000")
        print("  AI Service: http://localhost:8001")
        print()
        print("Default admin credentials:")
        print("  Email: admin@school.cm")
        print("  Password: admin123")
        return 0
    else:
        print("⚠ The Innovative School Platform may not be fully running yet.")
        print()
        print("Troubleshooting steps:")
        print("1. Check if the deployment script completed successfully")
        print("2. Run '.\\deploy_local.bat' to start the deployment process")
        print("3. Check Docker Desktop is running")
        print("4. Check the logs with 'docker-compose logs'")
        return 1

if __name__ == "__main__":
    exit(main())