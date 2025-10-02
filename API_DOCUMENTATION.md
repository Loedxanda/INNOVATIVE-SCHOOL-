# Innovative School Platform - API Documentation

## Overview

The Innovative School Platform API provides comprehensive endpoints for managing a school management system with support for students, teachers, parents, classes, subjects, attendance, and grades.

## Base URL

- **Development**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`
- **Alternative Docs**: `http://localhost:8000/redoc`

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## User Roles

- **admin**: Full access to all endpoints
- **teacher**: Access to teaching-related endpoints
- **student**: Access to own profile and academic data
- **parent**: Access to children's academic data

## API Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### User Management

#### POST /users/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "student",
  "full_name": "John Doe"
}
```

#### GET /users/me
Get current user profile.

#### PATCH /users/me
Update current user profile.

#### GET /users/
List all users (admin only).

### Student Management

#### POST /students/
Create a new student profile (admin only).

**Request Body:**
```json
{
  "user_id": 1,
  "student_id": "STU001",
  "date_of_birth": "2010-05-15",
  "gender": "male",
  "address": "123 Main St",
  "phone_number": "+237123456789",
  "emergency_contact": "Jane Doe",
  "emergency_phone": "+237987654321"
}
```

#### GET /students/
List all students (admin/teacher only).

#### GET /students/{student_id}
Get specific student by ID.

#### GET /students/me/profile
Get current user's student profile.

#### GET /students/{student_id}/enrollments
Get all enrollments for a student.

#### GET /students/{student_id}/attendance
Get attendance records for a student.

#### GET /students/{student_id}/grades
Get grades for a student.

### Teacher Management

#### POST /teachers/
Create a new teacher profile (admin only).

**Request Body:**
```json
{
  "user_id": 2,
  "teacher_id": "TCH001",
  "employee_id": "EMP001",
  "date_of_birth": "1985-03-20",
  "gender": "female",
  "address": "456 Oak Ave",
  "phone_number": "+237123456789",
  "qualification": "M.Ed Mathematics",
  "specialization": "Mathematics"
}
```

#### GET /teachers/
List all teachers (admin only).

#### GET /teachers/{teacher_id}
Get specific teacher by ID.

#### GET /teachers/me/profile
Get current user's teacher profile.

#### GET /teachers/{teacher_id}/classes
Get all classes assigned to a teacher.

#### GET /teachers/{teacher_id}/students
Get all students taught by a teacher.

#### POST /teachers/{teacher_id}/attendance/mark
Mark attendance for a student.

#### POST /teachers/{teacher_id}/grades/add
Add a grade for a student.

### Class Management

#### POST /classes/
Create a new class (admin only).

**Request Body:**
```json
{
  "name": "Grade 5A",
  "grade_level": "primary_5",
  "academic_year": "2024-2025",
  "capacity": 30
}
```

#### GET /classes/
List all classes with optional filtering.

**Query Parameters:**
- `academic_year`: Filter by academic year
- `grade_level`: Filter by grade level
- `skip`: Pagination offset
- `limit`: Number of results per page

#### GET /classes/{class_id}
Get specific class by ID.

#### GET /classes/{class_id}/students
Get all students enrolled in a class.

#### GET /classes/{class_id}/teachers
Get all teachers assigned to a class.

#### POST /classes/{class_id}/enroll
Enroll a student in a class (admin only).

#### DELETE /classes/{class_id}/enroll/{enrollment_id}
Unenroll a student from a class (admin only).

#### GET /classes/{class_id}/attendance
Get attendance records for a class on a specific date.

#### GET /classes/{class_id}/grades
Get all grades for a class.

### Subject Management

#### POST /subjects/
Create a new subject (admin only).

**Request Body:**
```json
{
  "name": "Mathematics",
  "code": "MATH",
  "description": "Core mathematics curriculum"
}
```

#### GET /subjects/
List all subjects with optional filtering.

#### GET /subjects/{subject_id}
Get specific subject by ID.

#### PUT /subjects/{subject_id}
Update a subject (admin only).

#### DELETE /subjects/{subject_id}
Deactivate a subject (admin only).

#### GET /subjects/{subject_id}/classes
Get all classes that teach this subject.

#### GET /subjects/{subject_id}/teachers
Get all teachers who teach this subject.

#### GET /subjects/{subject_id}/grades
Get all grades for a subject.

### Parent Management

#### POST /parents/
Create a new parent profile (admin only).

**Request Body:**
```json
{
  "user_id": 3,
  "parent_id": "PAR001",
  "phone_number": "+237123456789",
  "address": "789 Pine St",
  "occupation": "Engineer"
}
```

#### GET /parents/
List all parents (admin only).

#### GET /parents/{parent_id}
Get specific parent by ID.

#### GET /parents/me/profile
Get current user's parent profile.

#### GET /parents/{parent_id}/children
Get all children of a parent.

#### POST /parents/{parent_id}/link-child
Link a parent to a child (admin only).

#### GET /parents/{parent_id}/children/{student_id}/attendance
Get attendance records for a parent's child.

#### GET /parents/{parent_id}/children/{student_id}/grades
Get grades for a parent's child.

#### GET /parents/{parent_id}/children/{student_id}/summary
Get a summary of a child's academic performance.

### Attendance Management

#### POST /attendance/mark
Mark attendance for a student (teacher only).

**Request Body:**
```json
{
  "student_id": 1,
  "class_id": 1,
  "date": "2024-01-15",
  "status": "present",
  "notes": "On time"
}
```

#### POST /attendance/mark-bulk
Mark attendance for multiple students at once (teacher only).

#### GET /attendance/class/{class_id}
Get attendance records for a class on a specific date.

#### GET /attendance/student/{student_id}
Get attendance records for a student.

#### GET /attendance/reports/summary
Get attendance summary report (teacher/admin only).

#### GET /attendance/reports/daily
Get daily attendance report (teacher/admin only).

## Error Handling

The API returns appropriate HTTP status codes:

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **500**: Internal Server Error

Error responses include a JSON object with error details:

```json
{
  "detail": "Error message describing what went wrong"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. This will be added in future versions.

## Pagination

List endpoints support pagination using query parameters:

- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100, max: 1000)

## Filtering and Sorting

Many endpoints support filtering and sorting:

- Use query parameters to filter results
- Results are typically sorted by creation date (newest first)
- Some endpoints support custom sorting

## Data Models

### User
- `id`: Integer (primary key)
- `email`: String (unique)
- `full_name`: String (optional)
- `role`: Enum (student, teacher, parent, admin)
- `is_active`: Boolean
- `created_at`: DateTime
- `updated_at`: DateTime

### Student
- `id`: Integer (primary key)
- `user_id`: Integer (foreign key to users)
- `student_id`: String (unique school ID)
- `date_of_birth`: Date (optional)
- `gender`: Enum (male, female, other)
- `address`: String (optional)
- `phone_number`: String (optional)
- `emergency_contact`: String (optional)
- `emergency_phone`: String (optional)
- `enrollment_date`: Date
- `is_active`: Boolean

### Teacher
- `id`: Integer (primary key)
- `user_id`: Integer (foreign key to users)
- `teacher_id`: String (unique school ID)
- `employee_id`: String (unique employee ID)
- `date_of_birth`: Date (optional)
- `gender`: Enum (male, female, other)
- `address`: String (optional)
- `phone_number`: String (optional)
- `qualification`: String (optional)
- `specialization`: String (optional)
- `hire_date`: Date
- `is_active`: Boolean

### Parent
- `id`: Integer (primary key)
- `user_id`: Integer (foreign key to users)
- `parent_id`: String (unique school ID)
- `phone_number`: String (optional)
- `address`: String (optional)
- `occupation`: String (optional)

### Class
- `id`: Integer (primary key)
- `name`: String (e.g., "Grade 5A")
- `grade_level`: Enum (primary_1 through secondary_5)
- `academic_year`: String (e.g., "2024-2025")
- `capacity`: Integer (default: 30)
- `is_active`: Boolean

### Subject
- `id`: Integer (primary key)
- `name`: String (e.g., "Mathematics")
- `code`: String (unique, e.g., "MATH")
- `description`: String (optional)
- `is_active`: Boolean

### Attendance
- `id`: Integer (primary key)
- `student_id`: Integer (foreign key to students)
- `class_id`: Integer (foreign key to classes)
- `date`: Date
- `status`: Enum (present, absent, late, excused)
- `notes`: String (optional)
- `marked_by`: Integer (foreign key to teachers)

### Grade
- `id`: Integer (primary key)
- `student_id`: Integer (foreign key to students)
- `teacher_id`: Integer (foreign key to teachers)
- `subject_id`: Integer (foreign key to subjects)
- `class_id`: Integer (foreign key to classes)
- `grade_value`: Float
- `max_grade`: Float (default: 100.0)
- `grade_type`: String (optional, e.g., "quiz", "exam")
- `description`: String (optional)
- `date_given`: Date

## Examples

### Complete Workflow Example

1. **Register a user:**
```bash
curl -X POST "http://localhost:8000/users/register" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@school.com", "password": "password123", "role": "admin", "full_name": "Admin User"}'
```

2. **Login:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin@school.com&password=password123"
```

3. **Create a student:**
```bash
curl -X POST "http://localhost:8000/students/" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"user_id": 1, "student_id": "STU001", "full_name": "John Doe"}'
```

4. **Create a class:**
```bash
curl -X POST "http://localhost:8000/classes/" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"name": "Grade 5A", "grade_level": "primary_5", "academic_year": "2024-2025", "capacity": 30}'
```

5. **Enroll student in class:**
```bash
curl -X POST "http://localhost:8000/classes/1/enroll" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"student_id": 1}'
```

## Support

For API support and questions:
1. Check the interactive documentation at `/docs`
2. Review the error messages for specific issues
3. Ensure proper authentication headers are included
4. Verify user permissions for restricted endpoints

