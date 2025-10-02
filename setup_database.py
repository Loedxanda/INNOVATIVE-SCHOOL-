#!/usr/bin/env python3
"""
Database setup script for Innovative School Platform
This script helps set up the PostgreSQL database with PostGIS extension
"""

import os
import sys
import subprocess
from dotenv import load_dotenv

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def check_docker():
    """Check if Docker is installed and running"""
    print("🔍 Checking Docker installation...")
    try:
        subprocess.run("docker --version", shell=True, check=True, capture_output=True)
        subprocess.run("docker-compose --version", shell=True, check=True, capture_output=True)
        print("✅ Docker and Docker Compose are installed")
        return True
    except subprocess.CalledProcessError:
        print("❌ Docker or Docker Compose not found. Please install Docker Desktop.")
        return False

def setup_environment():
    """Set up environment variables"""
    print("🔧 Setting up environment variables...")
    
    if not os.path.exists('.env'):
        if os.path.exists('env.example'):
            print("📋 Creating .env file from env.example...")
            with open('env.example', 'r') as f:
                content = f.read()
            with open('.env', 'w') as f:
                content = content.replace('your_secure_password', 'innovative_school_password')
                content = content.replace('your_super_secret_key_here_change_in_production', 'dev_secret_key_change_in_production')
                f.write(content)
            print("✅ .env file created")
        else:
            print("❌ env.example file not found")
            return False
    else:
        print("✅ .env file already exists")
    
    return True

def start_database():
    """Start PostgreSQL database with Docker Compose"""
    print("🐘 Starting PostgreSQL database...")
    return run_command("docker-compose up -d postgres", "Starting PostgreSQL container")

def wait_for_database():
    """Wait for database to be ready"""
    print("⏳ Waiting for database to be ready...")
    import time
    time.sleep(10)  # Wait 10 seconds for database to start

def run_migrations():
    """Run database migrations"""
    print("🔄 Running database migrations...")
    
    # Change to backend directory
    os.chdir('backend')
    
    # Initialize Alembic if not already done
    if not os.path.exists('alembic/versions'):
        run_command("alembic init alembic", "Initializing Alembic")
    
    # Create initial migration
    run_command("alembic revision --autogenerate -m 'Initial migration'", "Creating initial migration")
    
    # Run migrations
    success = run_command("alembic upgrade head", "Running migrations")
    
    # Change back to root directory
    os.chdir('..')
    
    return success

def test_connection():
    """Test database connection"""
    print("🧪 Testing database connection...")
    try:
        from backend.database import test_connection
        return test_connection()
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up Innovative School Platform Database")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv()
    
    # Check prerequisites
    if not check_docker():
        return False
    
    # Setup environment
    if not setup_environment():
        return False
    
    # Start database
    if not start_database():
        return False
    
    # Wait for database
    wait_for_database()
    
    # Test connection
    if not test_connection():
        print("❌ Database setup failed - connection test failed")
        return False
    
    print("\n🎉 Database setup completed successfully!")
    print("\nNext steps:")
    print("1. Run 'python setup_database.py' to create database tables")
    print("2. Start the backend: 'cd backend && uvicorn main:app --reload'")
    print("3. Visit http://localhost:8000/docs to see the API documentation")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

