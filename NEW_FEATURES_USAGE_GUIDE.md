# New Features Usage Guide

This guide explains how to use the newly implemented features in the Innovative School Platform.

## Prerequisites

1. Ensure all services are running:
   ```bash
   docker-compose up -d
   ```

2. The new features require the following services to be operational:
   - Main backend API (port 8000)
   - Pedagogic AI service (port 8001)
   - PostgreSQL database
   - Redis cache

## Feature 1: Teacher Resource Hub

### API Endpoints

#### Upload a Resource (Teachers Only)
```
POST /api/resources/
Headers: Authorization: Bearer <token>
Body: {
  "title": "Math Lesson Plan",
  "description": "Algebra basics for secondary 2",
  "subject_id": 1,
  "grade_level": "secondary_2",
  "category": "lesson_plan",
  "tags": "algebra, equations"
}
```

#### List Resources
```
GET /api/resources/?skip=0&limit=20&subject_id=1&grade_level=secondary_2
Headers: Authorization: Bearer <token>
```

#### Rate a Resource
```
POST /api/resources/{resource_id}/ratings
Headers: Authorization: Bearer <token>
Body: {
  "resource_id": 123,
  "rating": 5
}
```

#### Comment on a Resource
```
POST /api/resources/{resource_id}/comments
Headers: Authorization: Bearer <token>
Body: {
  "resource_id": 123,
  "comment": "This resource was very helpful for my class!"
}
```

## Feature 2: In-App Messaging System

### API Endpoints

#### Send a Direct Message
```
POST /api/messages/
Headers: Authorization: Bearer <token>
Body: {
  "recipient_id": 456,
  "subject": "Meeting Tomorrow",
  "content": "Let's meet at 10am tomorrow.",
  "message_type": "direct"
}
```

#### Create a Message Group (Admins Only)
```
POST /api/messages/groups
Headers: Authorization: Bearer <token>
Body: {
  "name": "Math Teachers",
  "description": "Group for all math teachers",
  "group_type": "academic"
}
```

#### Get Unread Message Count
```
GET /api/messages/unread-count
Headers: Authorization: Bearer <token>
```

## Feature 3: Pedagogic AI Assistant

### API Endpoints

The AI service runs on a separate port (8001).

#### Ask the AI a Question
```
POST /api/ai/query
Headers: Authorization: Bearer <token>
Body: {
  "question": "What are effective classroom management strategies for 5th grade science?",
  "user_role": "teacher",
  "subject": "science",
  "grade_level": "primary_5",
  "save_conversation": true
}
```

#### Health Check
```
GET /api/ai/health
```

## Feature 4: School Inquiry Management System

### API Endpoints

#### Submit an Inquiry
```
POST /api/inquiries/
Body: {
  "name": "John Parent",
  "email": "john.parent@email.com",
  "subject": "Admissions Question",
  "message": "What are the admission requirements for secondary school?",
  "department": "admissions",
  "priority": "medium"
}
```

#### List Inquiries (Admins/Teachers)
```
GET /api/inquiries/?status=new&department=admissions
Headers: Authorization: Bearer <token>
```

#### Update Inquiry Status
```
POST /api/inquiries/{inquiry_id}/status
Headers: Authorization: Bearer <token>
Body: {
  "status": "in_progress"
}
```

## Feature 5: Comprehensive Accounting and Reporting Module

### API Endpoints

#### Create a Financial Transaction (Admins Only)
```
POST /api/accounting/transactions
Headers: Authorization: Bearer <token>
Body: {
  "transaction_type": "income",
  "amount": 5000.00,
  "description": "Tuition fees - September",
  "category": "tuition",
  "reference_number": "INV-2023-001"
}
```

#### Create an Inventory Item (Admins Only)
```
POST /api/accounting/inventory
Headers: Authorization: Bearer <token>
Body: {
  "name": "Science Lab Equipment",
  "description": "Microscopes and related equipment",
  "category": "lab_equipment",
  "quantity": 10,
  "unit_price": 250.00,
  "location": "Lab Room 201"
}
```

#### Get Weekly Reports (Admins Only)
```
GET /api/accounting/reports/weekly-activity
Headers: Authorization: Bearer <token>
```

```
GET /api/accounting/reports/weekly-financial
Headers: Authorization: Bearer <token>
```

```
GET /api/accounting/reports/weekly-inventory
Headers: Authorization: Bearer <token>
```

#### Get Dashboard Metrics (Admins Only)
```
GET /api/accounting/reports/dashboard
Headers: Authorization: Bearer <token>
```

## Testing the Features

### Using cURL

1. **Test Teacher Resource Hub**:
   ```bash
   # Get auth token first
   curl -X POST "http://localhost:8000/api/auth/login" \
        -d "username=admin@school.cm&password=admin123" \
        -H "Content-Type: application/x-www-form-urlencoded"
   
   # Use token to create a resource
   curl -X POST "http://localhost:8000/api/resources/" \
        -H "Authorization: Bearer <your_token>" \
        -H "Content-Type: application/json" \
        -d '{"title":"Test Resource","description":"A test resource"}'
   ```

2. **Test Pedagogic AI**:
   ```bash
   curl -X POST "http://localhost:8001/api/ai/query" \
        -H "Content-Type: application/json" \
        -d '{"question":"Classroom management tips","user_role":"teacher"}'
   ```

### Using the API Documentation

1. Visit `http://localhost:8000/docs` for the main API documentation
2. Visit `http://localhost:8001/docs` for the AI service documentation

## Frontend Integration

The frontend services are located in `frontend/src/services/` and can be used as follows:

```javascript
// Example: Using the resource service
import { resourceService } from './services/resourceService';

// Create a resource
const newResource = await resourceService.createResource({
  title: "Math Lesson",
  description: "Algebra basics"
});

// Get resources
const resources = await resourceService.getResources({
  subjectId: 1,
  gradeLevel: "secondary_2"
});
```

## Troubleshooting

### Common Issues

1. **Services not starting**:
   - Check that all required ports are available
   - Ensure Docker is running
   - Check the logs: `docker-compose logs <service_name>`

2. **Database connection errors**:
   - Verify PostgreSQL is running
   - Check database credentials in environment variables
   - Ensure the database has been initialized

3. **AI service not responding**:
   - Check that the AI service is running on port 8001
   - Verify the frontend has the correct AI API URL

4. **Permission errors**:
   - Ensure users have the correct roles assigned
   - Check that authentication tokens are valid
   - Verify role-based access control in the backend code

### Checking Service Status

```bash
# Check if all services are running
docker-compose ps

# Check logs for a specific service
docker-compose logs backend

# Check if ports are open
netstat -an | grep "8000\|8001"
```

## Security Considerations

1. All API endpoints require authentication except for inquiry submission
2. Role-based access control is implemented for all features
3. Sensitive operations are restricted to administrators
4. Data is validated and sanitized on the backend
5. The AI service has its own authentication layer

## Performance Monitoring

1. **Cache Usage**: Redis is used for caching frequently accessed data
2. **Database Indexes**: All foreign keys and frequently queried fields are indexed
3. **API Response Times**: Monitor through the performance routes
4. **Resource Usage**: Check Docker resource usage: `docker stats`

## Maintenance

1. **Regular Backups**: Ensure database backups are configured
2. **Log Rotation**: Implement log rotation for all services
3. **Security Updates**: Regularly update dependencies
4. **Monitoring**: Set up monitoring for service health and performance