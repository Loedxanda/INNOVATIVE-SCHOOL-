"""
Pytest configuration and fixtures for backend tests
"""
import pytest
import asyncio
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import get_db, Base
from models import User, Student, Teacher, Parent, Class, Subject


# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Create test engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Drop tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database dependency override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = User(
        email="test@example.com",
        hashed_password="hashed_password",
        full_name="Test User",
        role="admin"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_student(db_session, test_user):
    """Create a test student."""
    student = Student(
        student_id="STU001",
        user_id=test_user.id,
        date_of_birth="2010-01-01",
        gender="male",
        address="123 Test Street",
        phone_number="+237123456789",
        emergency_contact="Emergency Contact",
        emergency_phone="+237987654321",
        enrollment_date="2023-09-01"
    )
    db_session.add(student)
    db_session.commit()
    db_session.refresh(student)
    return student


@pytest.fixture
def test_teacher(db_session, test_user):
    """Create a test teacher."""
    teacher = Teacher(
        employee_id="EMP001",
        user_id=test_user.id,
        qualification="Bachelor's Degree",
        specialization="Mathematics",
        hire_date="2023-01-01"
    )
    db_session.add(teacher)
    db_session.commit()
    db_session.refresh(teacher)
    return teacher


@pytest.fixture
def test_class(db_session):
    """Create a test class."""
    class_obj = Class(
        name="Grade 10A",
        grade_level="grade_10",
        academic_year="2023-2024",
        capacity=30,
        description="Grade 10 Class A"
    )
    db_session.add(class_obj)
    db_session.commit()
    db_session.refresh(class_obj)
    return class_obj


@pytest.fixture
def test_subject(db_session):
    """Create a test subject."""
    subject = Subject(
        name="Mathematics",
        code="MATH101",
        description="Basic Mathematics",
        grade_levels=["grade_10"],
        credits=4
    )
    db_session.add(subject)
    db_session.commit()
    db_session.refresh(subject)
    return subject


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for test user."""
    # This would normally involve getting a JWT token
    # For now, we'll return empty headers
    return {"Authorization": "Bearer test_token"}


@pytest.fixture
def sample_student_data():
    """Sample student data for testing."""
    return {
        "student_id": "STU002",
        "email": "student@example.com",
        "password": "password123",
        "full_name": "Test Student",
        "date_of_birth": "2010-01-01",
        "gender": "female",
        "address": "456 Student Street",
        "phone_number": "+237123456789",
        "emergency_contact": "Parent Contact",
        "emergency_phone": "+237987654321",
        "enrollment_date": "2023-09-01"
    }


@pytest.fixture
def sample_teacher_data():
    """Sample teacher data for testing."""
    return {
        "employee_id": "EMP002",
        "email": "teacher@example.com",
        "password": "password123",
        "full_name": "Test Teacher",
        "qualification": "Master's Degree",
        "specialization": "Science",
        "hire_date": "2023-01-01"
    }


@pytest.fixture
def sample_class_data():
    """Sample class data for testing."""
    return {
        "name": "Grade 11B",
        "grade_level": "grade_11",
        "academic_year": "2023-2024",
        "capacity": 25,
        "description": "Grade 11 Class B"
    }


@pytest.fixture
def sample_subject_data():
    """Sample subject data for testing."""
    return {
        "name": "Physics",
        "code": "PHYS101",
        "description": "Basic Physics",
        "grade_levels": ["grade_11"],
        "credits": 3
    }

