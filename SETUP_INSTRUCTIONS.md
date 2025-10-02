# Innovative School Platform - Setup Instructions

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Docker Desktop** (for database and containerized services)
- **Python 3.11+** (for local development)
- **Node.js 18+** (for frontend development, coming soon)

## Quick Start

### 1. Clone and Setup Environment

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd innovative-school

# Copy environment variables
cp env.example .env

# Edit .env file with your configuration
# Update database passwords and API keys as needed
```

### 2. Start Database with Docker

```bash
# Start PostgreSQL with PostGIS extension
docker-compose up -d postgres

# Wait for database to be ready (about 10-15 seconds)
```

### 3. Install Python Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### 4. Run Database Setup Script

```bash
# Run the database setup script
python setup_database.py
```

This script will:
- Test Docker installation
- Start the PostgreSQL database
- Create the database schema
- Run initial migrations
- Test the database connection

### 5. Start the Backend API

```bash
# Start the FastAPI backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Root Endpoint**: http://localhost:8000/

## Database Schema

The database includes the following main tables:

- **users** - User accounts and authentication
- **students** - Student profiles and information
- **teachers** - Teacher profiles and information
- **parents** - Parent profiles and information
- **subjects** - Academic subjects
- **classes** - School classes and grade levels
- **enrollments** - Student class enrollments
- **attendances** - Daily attendance records
- **grades** - Student grades and assessments
- **parent_students** - Parent-student relationships

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /users/register` - User registration

### User Management
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile
- `GET /users/` - List all users (admin)

### Health Check
- `GET /health` - API health status

## Development

### Database Migrations

```bash
cd backend

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Testing the API

You can test the API using:

1. **Swagger UI**: Visit http://localhost:8000/docs
2. **curl commands**:
   ```bash
   # Register a new user
   curl -X POST "http://localhost:8000/users/register" \
        -H "Content-Type: application/json" \
        -d '{"email": "admin@school.com", "password": "password123", "role": "admin", "full_name": "Admin User"}'
   
   # Login
   curl -X POST "http://localhost:8000/auth/login" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=admin@school.com&password=password123"
   ```

## Troubleshooting

### Database Connection Issues

1. Ensure Docker is running
2. Check if PostgreSQL container is up: `docker ps`
3. Verify database logs: `docker logs innovative_school_postgres`

### Port Conflicts

If port 8000 is already in use:
```bash
# Use a different port
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### Environment Variables

Make sure your `.env` file contains:
```env
DATABASE_URL=postgresql://innovative_school_user:innovative_school_password@localhost:5432/innovative_school
SECRET_KEY=your_super_secret_key_here_change_in_production
```

## Next Steps

1. **Frontend Development**: Set up React frontend
2. **Core Features**: Implement student, teacher, and parent management
3. **Attendance System**: Build attendance tracking
4. **Gradebook**: Create grading system
5. **Notifications**: Add email/SMS notifications
6. **AI Services**: Integrate AI features

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify all prerequisites are installed
3. Ensure all environment variables are set correctly
4. Check Docker container status

