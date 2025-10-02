# PC Deployment Guide for Innovative School Platform

This guide will help you deploy the Innovative School Platform on your local PC.

## Prerequisites

1. **Docker** - Make sure Docker Desktop is installed and running
2. **Git** - For version control (optional but recommended)
3. **At least 8GB RAM** - Recommended for smooth operation
4. **20GB free disk space** - For Docker images and data

## Deployment Steps

### Step 1: Verify System Requirements

First, verify that Docker is installed and running:

```cmd
docker --version
docker-compose --version
```

You should see output similar to:
```
Docker version 20.10.0 or higher
Docker Compose version 2.0.0 or higher
```

### Step 2: Prepare Environment Files

The application requires environment configuration files. If they don't exist, create them:

```cmd
copy env.example .env
copy frontend\env.example frontend\.env
copy backend\env.example backend\.env
```

### Step 3: Build Docker Images

Build all the required Docker images:

```cmd
docker-compose build
```

This will build images for:
- PostgreSQL database with PostGIS
- Redis cache
- Backend API (FastAPI)
- Pedagogic AI service (FastAPI)
- Frontend (React with Nginx)

### Step 4: Start Services

Start all services in detached mode:

```cmd
docker-compose up -d
```

### Step 5: Initialize Database

Wait for about 30 seconds for the database to initialize, then run:

```cmd
docker-compose exec backend alembic upgrade head
```

### Step 6: Create Admin User

Create the default admin user:

```cmd
docker-compose exec backend python create_admin.py
```

### Step 7: Access the Application

Once all services are running, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **AI Service**: http://localhost:8001
- **API Documentation**: http://localhost:8000/docs
- **AI Documentation**: http://localhost:8001/docs

Default admin credentials:
- Email: admin@school.cm
- Password: admin123

## Troubleshooting

### Common Issues

1. **Port Conflicts**: If you see port binding errors, make sure no other services are using ports 3000, 8000, 8001, 5432, or 6379.

2. **Insufficient Resources**: If services fail to start, try increasing Docker Desktop's allocated resources.

3. **Build Failures**: If builds fail, try building services individually:
   ```cmd
   docker-compose build postgres
   docker-compose build redis
   docker-compose build backend
   docker-compose build pedagogic-ai
   docker-compose build frontend
   ```

### Checking Service Status

To check if services are running:

```cmd
docker-compose ps
```

To view logs for a specific service:

```cmd
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Stopping Services

To stop all services:

```cmd
docker-compose down
```

To stop and remove all data (including database):

```cmd
docker-compose down -v
```

## Service Architecture

The application consists of the following services:

1. **PostgreSQL Database** (postgres:5432)
   - Stores all application data
   - Uses PostGIS for location-based features

2. **Redis Cache** (redis:6379)
   - Caching layer for improved performance
   - Session storage

3. **Backend API** (backend:8000)
   - FastAPI application
   - RESTful API endpoints
   - Business logic implementation

4. **Pedagogic AI Service** (pedagogic-ai:8001)
   - Dedicated microservice for AI features
   - Educational query processing

5. **Frontend** (frontend:3000)
   - React application with TypeScript
   - Material-UI components
   - Responsive design

6. **Nginx** (nginx:80, 443)
   - Reverse proxy
   - Static file serving
   - SSL termination (in production)

## Customization

### Environment Variables

You can customize the application behavior by modifying the environment files:
- `.env` - Main configuration
- `backend/.env` - Backend-specific configuration
- `frontend/.env` - Frontend-specific configuration

### Theme Customization

The application uses a dark mode theme with:
- **Primary Color**: Oxblood (#4A0000)
- **Secondary Color**: Deep Blue (#001F3F)
- **Accent Colors**: Light Blue (#0074D9) and gradients

To modify the theme, edit the UI/UX design files in:
- `UI_UX_DESIGN_SPECIFICATION.md`
- `UI_UX_IMPLEMENTATION_GUIDE.md`

## Maintenance

### Backups

The application includes automated backup functionality. To manually create a backup:

```cmd
docker-compose exec postgres pg_dump -U innovative_school_user innovative_school > backup.sql
```

### Updates

To update the application:

1. Pull the latest code:
   ```cmd
   git pull
   ```

2. Rebuild images:
   ```cmd
   docker-compose build
   ```

3. Restart services:
   ```cmd
   docker-compose down
   docker-compose up -d
   ```

### Monitoring

To monitor resource usage:

```cmd
docker stats
```

## Security Considerations

1. **Change Default Passwords**: Update the default admin password after first login
2. **Environment Variables**: Keep sensitive information in environment variables, not in code
3. **HTTPS**: Configure SSL certificates for production deployment
4. **Firewall**: Restrict access to necessary ports only

## Support

For additional help, refer to:
- [README.md](README.md) - Main documentation
- [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md) - Cloud deployment guide
- [MOBILE_APP_DEVELOPMENT_GUIDE.md](MOBILE_APP_DEVELOPMENT_GUIDE.md) - Mobile app development guide
- [UI_UX_DESIGN_SPECIFICATION.md](UI_UX_DESIGN_SPECIFICATION.md) - Design guidelines

If you encounter issues, please check the logs and ensure all prerequisites are met.