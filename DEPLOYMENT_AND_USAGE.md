# Deployment and Usage Guide for New Features

This document provides comprehensive instructions for deploying and using the new features added to the Innovative School Platform.

## Overview of New Features

1. **Teacher Resource Hub** - A dedicated space for educators to share and discover teaching materials
2. **In-App Messaging System** - Private communication between all user roles
3. **Pedagogic AI Assistant** - AI-powered educational guidance aligned with pedagogical best practices
4. **School Inquiry Management System** - Structured system for handling formal inquiries
5. **Comprehensive Accounting and Reporting Module** - Automated reporting for administrators

## Deployment Instructions

### Prerequisites

1. Docker and Docker Compose installed
2. At least 4GB RAM available for all services
3. Ports 8000, 8001, 5432, and 6379 available

### Step-by-Step Deployment

1. **Clone or Update the Repository**
   ```bash
   git clone https://github.com/your-org/innovative-school-platform.git
   cd innovative-school-platform
   ```

2. **Configure Environment Variables**
   ```bash
   cp env.example .env
   cp frontend/env.example frontend/.env
   cp backend/env.example backend/.env
   # Edit the .env files with your configuration
   ```

3. **Build and Start All Services**
   ```bash
   docker-compose up -d --build
   ```

4. **Initialize the Database**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

5. **Verify Services are Running**
   ```bash
   docker-compose ps
   ```

   You should see the following services:
   - innovative_school_postgres
   - innovative_school_redis
   - innovative_school_backend
   - innovative_school_pedagogic_ai
   - innovative_school_frontend
   - innovative_school_nginx

## Service Endpoints

- **Main Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **AI Service**: http://localhost:8001
- **Database**: localhost:5432
- **Redis**: localhost:6379

## Feature Usage Instructions

### 1. Teacher Resource Hub

**For Teachers:**
1. Log in with a teacher account
2. Navigate to the "Resource Hub" section
3. Click "Upload Resource" to share materials
4. Fill in details like title, description, subject, grade level
5. Upload files or add video links
6. Add tags for easier discovery

**For All Users:**
1. Browse resources in the hub
2. Use search and filters to find specific materials
3. Rate resources with 1-5 stars
4. Leave comments and feedback
5. Save favorite resources

**API Endpoints:**
- `POST /api/resources/` - Create a resource (teachers only)
- `GET /api/resources/` - List resources
- `GET /api/resources/{id}` - Get specific resource
- `PUT /api/resources/{id}` - Update resource (owner/admin only)
- `DELETE /api/resources/{id}` - Delete resource (owner/admin only)
- `POST /api/resources/{id}/ratings` - Rate a resource
- `GET /api/resources/{id}/ratings` - Get resource ratings
- `POST /api/resources/{id}/comments` - Comment on a resource
- `GET /api/resources/{id}/comments` - Get resource comments

### 2. In-App Messaging System

**For All Users:**
1. Access the messaging interface from the main navigation
2. Send direct messages to other users
3. Join group chats for classes or departments
4. Use the support channel for school inquiries
5. View unread message counts in the notification area

**API Endpoints:**
- `POST /api/messages/` - Send a message
- `GET /api/messages/` - Get user's messages
- `GET /api/messages/unread-count` - Get unread message count
- `POST /api/messages/{id}/read` - Mark message as read
- `POST /api/messages/groups` - Create a group (admins only)
- `GET /api/messages/groups` - Get user's groups
- `POST /api/messages/groups/{id}/members` - Add user to group
- `POST /api/messages/support` - Send message to support

### 3. Pedagogic AI Assistant

**For All Users:**
1. Access the AI assistant from the main navigation
2. Ask questions related to education, teaching, or learning
3. Provide context about your role, subject, or grade level
4. Receive pedagogically sound advice and guidance
5. Optionally save conversations for future reference

**API Endpoints:**
- `POST /api/ai/query` - Ask the AI a question
- `GET /api/ai/health` - Check AI service health

### 4. School Inquiry Management System

**For External Users:**
1. Use the public inquiry form on the website
2. Select the appropriate department
3. Set priority level
4. Submit the inquiry
5. Receive automatic confirmation with ticket number

**For Administrators:**
1. View incoming inquiries in the admin dashboard
2. Assign inquiries to appropriate staff
3. Update inquiry status (New, In Progress, Resolved)
4. Add internal comments and notes
5. Communicate with inquirers through the system

**API Endpoints:**
- `POST /api/inquiries/` - Submit an inquiry
- `GET /api/inquiries/` - List inquiries (admins/teachers)
- `GET /api/inquiries/{id}` - Get specific inquiry
- `PUT /api/inquiries/{id}` - Update inquiry (admins/assigned users)
- `POST /api/inquiries/{id}/comments` - Add comment to inquiry
- `POST /api/inquiries/{id}/assign` - Assign inquiry (admins only)
- `POST /api/inquiries/{id}/status` - Update status

### 5. Comprehensive Accounting and Reporting Module

**For Administrators:**
1. Record financial transactions (income/expense)
2. Manage school inventory items
3. View automated weekly reports every Monday
4. Access real-time dashboard metrics
5. Generate on-demand reports

**API Endpoints:**
- `POST /api/accounting/transactions` - Create transaction
- `GET /api/accounting/transactions` - List transactions
- `POST /api/accounting/inventory` - Create inventory item
- `GET /api/accounting/inventory` - List inventory items
- `PUT /api/accounting/inventory/{id}` - Update inventory item
- `DELETE /api/accounting/inventory/{id}` - Delete inventory item
- `POST /api/accounting/inventory/{id}/log` - Create inventory log
- `GET /api/accounting/reports/weekly-activity` - Activity report
- `GET /api/accounting/reports/weekly-financial` - Financial report
- `GET /api/accounting/reports/weekly-inventory` - Inventory report
- `GET /api/accounting/reports/dashboard` - Dashboard metrics

## Testing the Implementation

### Automated Tests

Run the provided test script:
```bash
cd innovative-school-platform
pip install -r test_requirements.txt
python test_new_features.py
```

### Manual Testing

1. **Test Teacher Resource Hub:**
   - Log in as a teacher
   - Upload a resource
   - Verify it appears in the resource list
   - Test rating and commenting features

2. **Test Messaging System:**
   - Send a message between two users
   - Create a group chat
   - Test the support channel

3. **Test AI Assistant:**
   - Ask various pedagogical questions
   - Verify context-aware responses
   - Test conversation saving

4. **Test Inquiry System:**
   - Submit a test inquiry
   - Process it as an administrator
   - Verify status updates and notifications

5. **Test Accounting Module:**
   - Create financial transactions
   - Add inventory items
   - Generate reports
   - Check dashboard metrics

## Monitoring and Maintenance

### Health Checks

All services include health check endpoints:
- Main API: `GET /health`
- AI Service: `GET /api/ai/health`

### Log Monitoring

View service logs:
```bash
docker-compose logs backend
docker-compose logs pedagogic-ai
```

### Performance Monitoring

Monitor resource usage:
```bash
docker stats
```

## Troubleshooting Common Issues

### Services Not Starting

1. Check port availability:
   ```bash
   netstat -an | grep "8000\|8001\|5432\|6379"
   ```

2. Check Docker logs:
   ```bash
   docker-compose logs --tail=50
   ```

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check database credentials in environment files

### Authentication Problems

1. Verify user accounts exist in the database
2. Check JWT configuration in backend
3. Ensure SECRET_KEY is properly set

### AI Service Issues

1. Check that the AI service is built and running:
   ```bash
   docker-compose ps pedagogic-ai
   ```

2. Verify the frontend has the correct AI API URL

## Security Considerations

1. **Role-Based Access Control**: All new features implement proper RBAC
2. **Data Encryption**: Sensitive data is encrypted at rest and in transit
3. **Input Validation**: All user inputs are validated and sanitized
4. **Rate Limiting**: API endpoints are protected against abuse
5. **Audit Logs**: Critical operations are logged for security review

## Performance Optimization

1. **Caching**: Redis is used for frequently accessed data
2. **Database Indexes**: Proper indexing on all query fields
3. **Connection Pooling**: Efficient database connection management
4. **Asynchronous Processing**: Non-blocking operations where possible

## Backup and Recovery

1. **Database Backups**: Automated daily backups via Docker volumes
2. **Configuration Backups**: Version control for all configuration files
3. **Disaster Recovery**: Documented recovery procedures

## Scaling Considerations

1. **Horizontal Scaling**: Services can be scaled independently
2. **Load Balancing**: Nginx configuration supports load balancing
3. **Database Replication**: PostgreSQL supports read replicas
4. **Caching Strategy**: Redis can be clustered for high availability

## Future Enhancements

1. **Mobile Applications**: Native mobile apps for iOS and Android
2. **Advanced AI Features**: Integration with more sophisticated AI models
3. **Analytics Dashboard**: Enhanced data visualization capabilities
4. **Third-Party Integrations**: LMS and SIS system integrations
5. **Multimedia Support**: Enhanced support for audio/video resources

## Support and Documentation

1. **API Documentation**: Available at `/docs` endpoints
2. **User Guides**: Comprehensive guides for each feature
3. **Technical Documentation**: Developer documentation for customization
4. **Community Support**: GitHub discussions and issue tracking
5. **Professional Support**: Available through subscription plans