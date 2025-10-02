#!/usr/bin/env python3
"""
Docker diagnostic script to check Docker and Docker Compose status
"""

import subprocess
import sys
import time

def run_command(command, description, timeout=30):
    """Run a command and return the result"""
    print(f"Checking {description}...")
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=r"c:\Users\LORD XANDA\Desktop\INNOVATIVE-SCHOOL-"
        )
        return result
    except subprocess.TimeoutExpired:
        print(f"⚠ Timeout while checking {description}")
        return None
    except Exception as e:
        print(f"✗ Error checking {description}: {str(e)}")
        return None

def main():
    """Main diagnostic function"""
    print("=== Docker Diagnostic Tool ===")
    print()
    
    # Check Docker version
    result = run_command("docker --version", "Docker version")
    if result and result.returncode == 0:
        print(f"✓ Docker version: {result.stdout.strip()}")
    elif result:
        print(f"✗ Docker version check failed: {result.stderr.strip()}")
    else:
        print("✗ Docker version check timed out")
    
    print()
    
    # Check Docker Compose version
    result = run_command("docker-compose --version", "Docker Compose version")
    if result and result.returncode == 0:
        print(f"✓ Docker Compose version: {result.stdout.strip()}")
    elif result:
        print(f"✗ Docker Compose version check failed: {result.stderr.strip()}")
    else:
        print("✗ Docker Compose version check timed out")
    
    print()
    
    # Check Docker info
    result = run_command("docker info", "Docker info", timeout=60)
    if result and result.returncode == 0:
        print("✓ Docker is running properly")
        # Check if we're using Docker Desktop
        if "Docker Desktop" in result.stdout:
            print("  Using Docker Desktop")
    elif result:
        print(f"✗ Docker is not running properly: {result.stderr.strip()}")
        print("  Please start Docker Desktop and try again")
        return 1
    else:
        print("✗ Docker info check timed out")
        print("  Docker may not be responding")
        return 1
    
    print()
    
    # Check Docker Compose services
    result = run_command("docker-compose ps", "Docker Compose services")
    if result and result.returncode == 0:
        if result.stdout.strip() and "Name" in result.stdout:
            print("✓ Docker Compose services found:")
            print(result.stdout)
        else:
            print("ℹ No Docker Compose services are currently running")
    elif result:
        print(f"⚠ Docker Compose services check returned: {result.stderr.strip()}")
    else:
        print("⚠ Docker Compose services check timed out")
    
    print()
    
    # Check running containers
    result = run_command("docker ps", "running containers")
    if result and result.returncode == 0:
        if result.stdout.strip() and "CONTAINER" in result.stdout:
            lines = result.stdout.strip().split('\n')
            if len(lines) > 1:
                print(f"✓ {len(lines)-1} container(s) running:")
                print(result.stdout)
            else:
                print("ℹ No containers are currently running")
        else:
            print("ℹ No containers are currently running")
    elif result:
        print(f"⚠ Running containers check returned: {result.stderr.strip()}")
    else:
        print("⚠ Running containers check timed out")
    
    print()
    print("=== Diagnostic Summary ===")
    print("If Docker is running but services aren't starting:")
    print("1. Try running '.\\deploy_local.bat' to start the deployment")
    print("2. Check if Docker has enough resources (4GB+ memory)")
    print("3. Check Windows Firewall settings")
    print("4. Restart Docker Desktop")
    
    return 0

if __name__ == "__main__":
    exit(main())