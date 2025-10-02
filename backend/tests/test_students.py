"""
Tests for student management endpoints
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


def test_create_student(client: TestClient, db_session: Session, sample_student_data):
    """Test creating a new student."""
    response = client.post("/students/", json=sample_student_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["student_id"] == sample_student_data["student_id"]
    assert data["full_name"] == sample_student_data["full_name"]
    assert data["email"] == sample_student_data["email"]
    assert "id" in data


def test_create_student_duplicate_id(client: TestClient, test_student, sample_student_data):
    """Test creating student with duplicate student ID."""
    sample_student_data["student_id"] = test_student.student_id
    
    response = client.post("/students/", json=sample_student_data)
    
    assert response.status_code == 400
    assert "student_id already exists" in response.json()["detail"]


def test_create_student_invalid_data(client: TestClient):
    """Test creating student with invalid data."""
    invalid_data = {
        "student_id": "STU003",
        "email": "invalid-email",
        "full_name": "Test Student"
        # Missing required fields
    }
    
    response = client.post("/students/", json=invalid_data)
    
    assert response.status_code == 422


def test_get_student(client: TestClient, test_student):
    """Test getting a student by ID."""
    response = client.get(f"/students/{test_student.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_student.id
    assert data["student_id"] == test_student.student_id


def test_get_student_not_found(client: TestClient):
    """Test getting a non-existent student."""
    response = client.get("/students/99999")
    
    assert response.status_code == 404
    assert "Student not found" in response.json()["detail"]


def test_list_students(client: TestClient, test_student):
    """Test listing students."""
    response = client.get("/students/")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(student["id"] == test_student.id for student in data)


def test_list_students_pagination(client: TestClient, test_student):
    """Test listing students with pagination."""
    response = client.get("/students/?skip=0&limit=10")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 10


def test_update_student(client: TestClient, test_student):
    """Test updating a student."""
    update_data = {
        "full_name": "Updated Student Name",
        "phone_number": "+237999999999"
    }
    
    response = client.patch(f"/students/{test_student.id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == update_data["full_name"]
    assert data["phone_number"] == update_data["phone_number"]


def test_update_student_not_found(client: TestClient):
    """Test updating a non-existent student."""
    update_data = {
        "full_name": "Updated Name"
    }
    
    response = client.patch("/students/99999", json=update_data)
    
    assert response.status_code == 404
    assert "Student not found" in response.json()["detail"]


def test_delete_student(client: TestClient, test_student):
    """Test deleting a student."""
    response = client.delete(f"/students/{test_student.id}")
    
    assert response.status_code == 200
    assert response.json()["message"] == "Student deleted successfully"


def test_delete_student_not_found(client: TestClient):
    """Test deleting a non-existent student."""
    response = client.delete("/students/99999")
    
    assert response.status_code == 404
    assert "Student not found" in response.json()["detail"]


def test_get_student_by_student_id(client: TestClient, test_student):
    """Test getting a student by student ID."""
    response = client.get(f"/students/by-student-id/{test_student.student_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["student_id"] == test_student.student_id


def test_get_student_by_student_id_not_found(client: TestClient):
    """Test getting a student by non-existent student ID."""
    response = client.get("/students/by-student-id/NONEXISTENT")
    
    assert response.status_code == 404
    assert "Student not found" in response.json()["detail"]


def test_list_students_by_class(client: TestClient, test_student, test_class):
    """Test listing students by class."""
    # This would require setting up class enrollment
    response = client.get(f"/students/by-class/{test_class.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_list_students_by_class_not_found(client: TestClient):
    """Test listing students by non-existent class."""
    response = client.get("/students/by-class/99999")
    
    assert response.status_code == 404
    assert "Class not found" in response.json()["detail"]

