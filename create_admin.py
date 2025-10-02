#!/usr/bin/env python3
"""
Script to create the default admin user for Innovative School Platform
"""

import sys
import os
sys.path.append('backend')

from backend.database import get_db
from backend.database_service import DatabaseService
from backend.models import UserCreate, UserRole
from sqlalchemy.orm import Session

def create_admin_user():
    """Create the default admin user"""
    print("🔧 Creating default admin user...")
    
    # Get database session
    db = next(get_db())
    db_service = DatabaseService(db)
    
    # Check if admin already exists
    existing_admin = db_service.get_user_by_email("admin@school.cm")
    if existing_admin:
        print("✅ Admin user already exists!")
        print(f"   Email: admin@school.cm")
        print(f"   Role: {existing_admin.role}")
        return True
    
    # Create admin user
    admin_data = UserCreate(
        email="admin@school.cm",
        full_name="System Administrator",
        password="admin123",
        role=UserRole.admin
    )
    
    try:
        admin_user = db_service.create_user(admin_data)
        print("✅ Admin user created successfully!")
        print(f"   Email: {admin_user.email}")
        print(f"   Name: {admin_user.full_name}")
        print(f"   Role: {admin_user.role}")
        print(f"   ID: {admin_user.id}")
        return True
    except Exception as e:
        print(f"❌ Failed to create admin user: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = create_admin_user()
    if success:
        print("\n🎉 You can now login with:")
        print("   Email: admin@school.cm")
        print("   Password: admin123")
    else:
        print("\n❌ Failed to create admin user")
        sys.exit(1)