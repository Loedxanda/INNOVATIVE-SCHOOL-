# MVP Testing Guide

This document provides comprehensive testing procedures for the Innovative School Platform MVP.

## Overview

The MVP testing covers all core functionality including:
- User authentication and authorization
- Student, teacher, and parent management
- Class and subject management
- Attendance tracking
- Grade management
- Parent portal
- Multilingual support
- Performance optimization
- Security features

## Testing Environment Setup

### Prerequisites

1. **Docker and Docker Compose** installed
2. **Node.js** (v16 or higher) for frontend testing
3. **Python** (v3.8 or higher) for backend testing
4. **PostgreSQL** database
5. **Redis** for caching

### Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd innovative-school-platform

# Start all services
docker-compose up -d

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

## Test Categories

### 1. Unit Tests

#### Backend Unit Tests

```bash
# Run all backend unit tests
cd backend
pytest

# Run specific test modules
pytest tests/test_auth.py
pytest tests/test_students.py
pytest tests/test_teachers.py
pytest tests/test_classes.py
pytest tests/test_attendance.py
pytest tests/test_grades.py

# Run with coverage
pytest --cov=. --cov-report=html
```

#### Frontend Unit Tests

```bash
# Run all frontend unit tests
cd frontend
npm test

# Run with coverage
npm run test:coverage

# Run specific test files
npm test -- --testPathPattern=StudentForm.test.tsx
npm test -- --testPathPattern=authService.test.ts
```

### 2. Integration Tests

#### API Integration Tests

```bash
# Test API endpoints
cd backend
pytest tests/test_api_integration.py

# Test specific API groups
pytest tests/test_api_integration.py::TestAuthAPI
pytest tests/test_api_integration.py::TestStudentAPI
pytest tests/test_api_integration.py::TestAttendanceAPI
```

#### Database Integration Tests

```bash
# Test database operations
pytest tests/test_database_integration.py

# Test migrations
pytest tests/test_migrations.py
```

### 3. End-to-End Tests

#### Cypress E2E Tests

```bash
# Run E2E tests in headless mode
cd frontend
npm run cypress:run

# Run E2E tests with UI
npm run cypress:open

# Run specific test suites
npm run cypress:run -- --spec "cypress/e2e/login.cy.ts"
npm run cypress:run -- --spec "cypress/e2e/student-management.cy.ts"
```

## Test Scenarios

### 1. Authentication & Authorization

#### Test Cases

1. **User Registration**
   - [ ] Valid user registration
   - [ ] Duplicate email handling
   - [ ] Password validation
   - [ ] Role assignment

2. **User Login**
   - [ ] Valid credentials login
   - [ ] Invalid credentials handling
   - [ ] JWT token generation
   - [ ] Token expiration handling

3. **Role-Based Access Control**
   - [ ] Admin access to all features
   - [ ] Teacher access to assigned classes
   - [ ] Student access to own data
   - [ ] Parent access to child data
   - [ ] Unauthorized access prevention

#### Test Commands

```bash
# Backend tests
pytest tests/test_auth.py -v

# Frontend tests
npm test -- --testPathPattern=authService.test.ts

# E2E tests
npm run cypress:run -- --spec "cypress/e2e/login.cy.ts"
```

### 2. Student Management

#### Test Cases

1. **Student CRUD Operations**
   - [ ] Create new student
   - [ ] Read student information
   - [ ] Update student details
   - [ ] Delete student
   - [ ] List all students

2. **Student Enrollment**
   - [ ] Enroll student in class
   - [ ] Transfer student between classes
   - [ ] Handle enrollment conflicts
   - [ ] Validate enrollment dates

3. **Student Search & Filtering**
   - [ ] Search by name
   - [ ] Filter by class
   - [ ] Filter by grade level
   - [ ] Sort by various criteria

#### Test Commands

```bash
# Backend tests
pytest tests/test_students.py -v

# Frontend tests
npm test -- --testPathPattern=StudentForm.test.tsx

# E2E tests
npm run cypress:run -- --spec "cypress/e2e/student-management.cy.ts"
```

### 3. Teacher Management

#### Test Cases

1. **Teacher CRUD Operations**
   - [ ] Create new teacher
   - [ ] Read teacher information
   - [ ] Update teacher details
   - [ ] Delete teacher
   - [ ] List all teachers

2. **Teacher-Class Assignment**
   - [ ] Assign teacher to class
   - [ ] Remove teacher from class
   - [ ] Handle multiple class assignments
   - [ ] Validate assignment conflicts

3. **Teacher Subject Assignment**
   - [ ] Assign subjects to teacher
   - [ ] Remove subject assignments
   - [ ] Handle subject conflicts

#### Test Commands

```bash
# Backend tests
pytest tests/test_teachers.py -v

# Frontend tests
npm test -- --testPathPattern=TeacherForm.test.tsx
```

### 4. Class Management

#### Test Cases

1. **Class CRUD Operations**
   - [ ] Create new class
   - [ ] Read class information
   - [ ] Update class details
   - [ ] Delete class
   - [ ] List all classes

2. **Class-Student Management**
   - [ ] Add students to class
   - [ ] Remove students from class
   - [ ] Handle class capacity limits
   - [ ] Validate student eligibility

3. **Class-Subject Management**
   - [ ] Assign subjects to class
   - [ ] Remove subject assignments
   - [ ] Handle subject conflicts

#### Test Commands

```bash
# Backend tests
pytest tests/test_classes.py -v

# Frontend tests
npm test -- --testPathPattern=ClassForm.test.tsx
```

### 5. Attendance Tracking

#### Test Cases

1. **Attendance Marking**
   - [ ] Mark student attendance
   - [ ] Bulk attendance marking
   - [ ] Attendance status validation
   - [ ] Date validation

2. **Attendance Reports**
   - [ ] Generate class attendance reports
   - [ ] Generate student attendance reports
   - [ ] Filter by date range
   - [ ] Export attendance data

3. **Attendance Analytics**
   - [ ] Calculate attendance percentages
   - [ ] Identify attendance patterns
   - [ ] Generate attendance summaries

#### Test Commands

```bash
# Backend tests
pytest tests/test_attendance.py -v

# Frontend tests
npm test -- --testPathPattern=AttendanceMarking.test.tsx
```

### 6. Grade Management

#### Test Cases

1. **Grade Entry**
   - [ ] Enter student grades
   - [ ] Validate grade values
   - [ ] Handle different grade types
   - [ ] Calculate averages

2. **Gradebook Management**
   - [ ] View class gradebook
   - [ ] Edit existing grades
   - [ ] Delete grades
   - [ ] Generate grade reports

3. **Report Card Generation**
   - [ ] Generate student report cards
   - [ ] Calculate overall averages
   - [ ] Include comments
   - [ ] Export report cards

#### Test Commands

```bash
# Backend tests
pytest tests/test_grades.py -v

# Frontend tests
npm test -- --testPathPattern=GradeForm.test.tsx
```

### 7. Parent Portal

#### Test Cases

1. **Child Information Access**
   - [ ] View child's basic information
   - [ ] Access child's classes
   - [ ] View child's attendance
   - [ ] View child's grades

2. **Communication Features**
   - [ ] Send messages to teachers
   - [ ] Receive notifications
   - [ ] View communication history
   - [ ] Handle message status

3. **Progress Tracking**
   - [ ] View child's progress reports
   - [ ] Track attendance trends
   - [ ] Monitor grade improvements
   - [ ] Generate progress summaries

#### Test Commands

```bash
# Backend tests
pytest tests/test_parents.py -v

# Frontend tests
npm test -- --testPathPattern=ParentDashboard.test.tsx
```

### 8. Multilingual Support

#### Test Cases

1. **Language Switching**
   - [ ] Switch between English and French
   - [ ] Persist language preference
   - [ ] Update UI text dynamically
   - [ ] Handle missing translations

2. **Localization Features**
   - [ ] Date and time formatting
   - [ ] Number formatting
   - [ ] Currency formatting
   - [ ] Text direction support

#### Test Commands

```bash
# Frontend tests
npm test -- --testPathPattern=LanguageSwitcher.test.tsx
```

### 9. Performance Testing

#### Test Cases

1. **Database Performance**
   - [ ] Query execution time
   - [ ] Connection pool management
   - [ ] Index effectiveness
   - [ ] Cache hit rates

2. **API Performance**
   - [ ] Response time measurement
   - [ ] Concurrent request handling
   - [ ] Memory usage monitoring
   - [ ] Error rate tracking

3. **Frontend Performance**
   - [ ] Page load times
   - [ ] Component rendering speed
   - [ ] Memory usage
   - [ ] Bundle size optimization

#### Test Commands

```bash
# Backend performance tests
pytest tests/test_performance.py -v

# Frontend performance tests
npm run test:performance

# Load testing
npm run test:load
```

### 10. Security Testing

#### Test Cases

1. **Authentication Security**
   - [ ] Password strength validation
   - [ ] JWT token security
   - [ ] Session management
   - [ ] Brute force protection

2. **Authorization Security**
   - [ ] Role-based access control
   - [ ] Permission validation
   - [ ] Data access restrictions
   - [ ] API endpoint protection

3. **Input Validation**
   - [ ] SQL injection prevention
   - [ ] XSS protection
   - [ ] CSRF protection
   - [ ] Input sanitization

#### Test Commands

```bash
# Backend security tests
pytest tests/test_security.py -v

# Frontend security tests
npm test -- --testPathPattern=security.test.tsx
```

## Test Data Setup

### Database Seeding

```bash
# Seed test data
cd backend
python scripts/seed_test_data.py

# Reset test database
python scripts/reset_test_db.py
```

### Test User Accounts

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@school.cm | admin123 | Full system access |
| Teacher | teacher@school.cm | teacher123 | Class management access |
| Student | student@school.cm | student123 | Student portal access |
| Parent | parent@school.cm | parent123 | Parent portal access |

## Test Execution

### Automated Testing

```bash
# Run all tests
npm run test:all

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run E2E tests only
npm run test:e2e
```

### Manual Testing

1. **Smoke Testing**
   - [ ] Login with each user role
   - [ ] Navigate to main dashboard
   - [ ] Access key features
   - [ ] Verify basic functionality

2. **Regression Testing**
   - [ ] Test all previously fixed bugs
   - [ ] Verify feature stability
   - [ ] Check for new issues
   - [ ] Validate performance

3. **User Acceptance Testing**
   - [ ] Test with real user scenarios
   - [ ] Validate user experience
   - [ ] Check accessibility
   - [ ] Verify mobile responsiveness

## Test Reporting

### Coverage Reports

```bash
# Generate coverage reports
npm run test:coverage

# View coverage in browser
open coverage/index.html
```

### Test Results

```bash
# Generate test reports
npm run test:report

# View test results
open test-results/index.html
```

## Bug Tracking

### Bug Report Template

```
**Bug Title:** [Brief description]

**Severity:** [Critical/High/Medium/Low]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:** [What should happen]

**Actual Result:** [What actually happens]

**Environment:**
- Browser: [Browser and version]
- OS: [Operating system]
- Device: [Desktop/Mobile/Tablet]

**Screenshots:** [If applicable]

**Additional Notes:** [Any other relevant information]
```

### Bug Severity Levels

- **Critical:** System crashes, data loss, security vulnerabilities
- **High:** Major functionality broken, significant user impact
- **Medium:** Minor functionality issues, workarounds available
- **Low:** Cosmetic issues, minor improvements

## Test Environment Cleanup

```bash
# Stop all services
docker-compose down

# Remove test data
docker-compose down -v

# Clean up test files
npm run test:cleanup
```

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm run test:all
```

## Test Maintenance

### Regular Tasks

1. **Weekly**
   - [ ] Run full test suite
   - [ ] Review test coverage
   - [ ] Update test data
   - [ ] Check test performance

2. **Monthly**
   - [ ] Review test cases
   - [ ] Update test documentation
   - [ ] Analyze test results
   - [ ] Optimize test execution

3. **Quarterly**
   - [ ] Comprehensive test review
   - [ ] Test strategy updates
   - [ ] Tool evaluation
   - [ ] Training updates

## Troubleshooting

### Common Issues

1. **Test Failures**
   - Check test data setup
   - Verify environment configuration
   - Review test logs
   - Check dependencies

2. **Performance Issues**
   - Monitor resource usage
   - Check database connections
   - Review query performance
   - Optimize test execution

3. **Environment Issues**
   - Verify Docker setup
   - Check service dependencies
   - Review configuration files
   - Check network connectivity

### Support

For testing issues and questions:
- Check test documentation
- Review test logs
- Contact development team
- Submit bug reports

## Conclusion

This testing guide provides comprehensive coverage of all MVP features. Regular execution of these tests ensures the platform's reliability, performance, and security. Follow the testing procedures outlined in this guide to maintain high-quality standards throughout the development lifecycle.

