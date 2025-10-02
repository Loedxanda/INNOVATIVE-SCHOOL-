#!/usr/bin/env python3
"""
Simplified FastAPI application for Innovative School Platform
This version removes Redis dependencies for easier setup
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from routes_users import router as users_router
from routes_auth import router as auth_router
from routes_students import router as students_router
from routes_teachers import router as teachers_router
from routes_classes import router as classes_router
from routes_subjects import router as subjects_router
from routes_parents import router as parents_router
from routes_attendance import router as attendance_router
from routes_grades import router as grades_router
from routes_performance import router as performance_router
from database import engine, Base, test_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Innovative School Platform API (Simple Mode)...")
    
    # Test database connection
    if test_connection():
        print("✅ Database connection successful")
    else:
        print("❌ Database connection failed")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")
    
    # Create default admin user if it doesn't exist
    try:
        from database_service import DatabaseService
        from models import UserCreate, UserRole
        from sqlalchemy.orm import Session
        
        db = Session(bind=engine)
        db_service = DatabaseService(db)
        
        # Check if admin exists
        admin_user = db_service.get_user_by_email("admin@school.cm")
        if not admin_user:
            print("🔧 Creating default admin user...")
            admin_data = UserCreate(
                email="admin@school.cm",
                full_name="System Administrator",
                password="admin123",
                role=UserRole.admin
            )
            admin_user = db_service.create_user(admin_data)
            print("✅ Admin user created successfully!")
            print(f"   Email: admin@school.cm")
            print(f"   Password: admin123")
        else:
            print("✅ Admin user already exists")
        
        db.close()
    except Exception as e:
        print(f"⚠️ Could not create admin user: {e}")
    
    print("🎉 API is ready!")
    yield
    
    # Shutdown
    print("🛑 Shutting down API...")

# Create FastAPI app
app = FastAPI(
    title="Innovative School Platform API",
    description="AI-powered, multilingual school management platform for Cameroon",
    version="0.1.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(teachers_router)
app.include_router(classes_router)
app.include_router(subjects_router)
app.include_router(parents_router)
app.include_router(attendance_router)
app.include_router(grades_router)
app.include_router(performance_router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Innovative School Platform API!",
        "version": "0.1.0",
        "docs": "/docs",
        "status": "running",
        "admin_credentials": {
            "email": "admin@school.cm",
            "password": "admin123"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_status = "healthy" if test_connection() else "unhealthy"
    return {
        "status": "running",
        "database": db_status,
        "version": "0.1.0"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting server...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔑 Admin Login: admin@school.cm / admin123")
    uvicorn.run(app, host="0.0.0.0", port=8000)