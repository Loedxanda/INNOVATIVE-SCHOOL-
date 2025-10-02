# Innovative School Platform - Deployment Guide

This guide covers deploying the Innovative School Platform using Docker containers for both development and production environments, as well as alternative deployment options including Vercel for the frontend.

## Prerequisites

- Docker Desktop (for local development)
- Docker Engine (for production servers)
- Docker Compose
- Git

## Quick Start (Development)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd innovative-school

# Copy environment files
cp env.example .env
cp frontend/env.example frontend/.env

# Edit configuration files
nano .env
nano frontend/.env
```

### 2. Start Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432

## Production Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login to apply group changes
```

### 2. Application Setup

```bash
# Clone repository
git clone <your-repo-url>
cd innovative-school

# Create production environment file
cp env.example .env.prod
nano .env.prod
```

### 3. Production Environment Configuration

Create `.env.prod` with production values:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@postgres:5432/innovative_school
POSTGRES_USER=innovative_school_user
POSTGRES_PASSWORD=your_secure_production_password
POSTGRES_DB=innovative_school

# JWT Configuration
SECRET_KEY=your_super_secure_production_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Redis Configuration
REDIS_URL=redis://redis:6379

# Frontend Configuration
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_ENVIRONMENT=production

# Environment
ENVIRONMENT=production
```

### 4. SSL Certificate Setup

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem

# For production, use Let's Encrypt or your SSL provider
```

### 5. Deploy Production

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Vercel Deployment (Frontend Only)

For deploying only the frontend to Vercel while keeping the backend on your own server:

### 1. Prerequisites

1. A Vercel account (free at [vercel.com](https://vercel.com))
2. Backend API deployed and accessible via HTTPS
3. Custom domain (optional but recommended)

### 2. Prepare Your Project

1. Create a `.env.production` file in the frontend directory:
   ```env
   REACT_APP_API_URL=https://your-backend-domain.com
   REACT_APP_ENVIRONMENT=production
   REACT_APP_ENABLE_DEBUG=false
   ```

2. Update the `frontend/vercel.json` file with your backend domain:
   ```json
   {
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "https://your-backend-domain.com/api/$1"
       }
     ],
     "env": {
       "REACT_APP_API_URL": "https://your-backend-domain.com"
     }
   }
   ```

### 3. Deploy via Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy the project:
   ```bash
   vercel
   ```

5. For subsequent deployments to production:
   ```bash
   vercel --prod
   ```

### 4. Deploy via Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - Framework Preset: Create React App
   - Root Directory: frontend
   - Build Command: `npm run build`
   - Output Directory: build
   - Install Command: `npm install`

6. Add environment variables in the Vercel dashboard:
   - `REACT_APP_API_URL`: Your backend API URL
   - `REACT_APP_ENVIRONMENT`: production

7. Deploy!

## Service Management

### Development Commands

```bash
# Start specific service
docker-compose up -d postgres

# Restart service
docker-compose restart backend

# View service logs
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend bash

# Scale service
docker-compose up -d --scale backend=3
```

### Production Commands

```bash
# Start production
docker-compose -f docker-compose.prod.yml up -d

# Stop production
docker-compose -f docker-compose.prod.yml down

# Update application
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U innovative_school_user innovative_school > backup.sql
```

## Database Management

### Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U innovative_school_user innovative_school > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T postgres psql -U innovative_school_user innovative_school < backup.sql
```

### Migrations

```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "Description"
```

## Monitoring and Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Health Checks

```bash
# Check service health
docker-compose ps

# Test API health
curl http://localhost:8000/health

# Test database connection
docker-compose exec postgres pg_isready -U innovative_school_user
```

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use strong, unique passwords
- Rotate secrets regularly
- Use environment-specific configurations

### 2. Network Security

- Use Docker networks for service isolation
- Configure firewall rules
- Use HTTPS in production
- Implement rate limiting

### 3. Database Security

- Use strong database passwords
- Enable SSL connections
- Regular security updates
- Backup encryption

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   sudo netstat -tulpn | grep :8000
   
   # Change ports in docker-compose.yml
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   chmod -R 755 .
   ```

3. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec postgres psql -U innovative_school_user -d innovative_school
   ```

4. **Memory Issues**
   ```bash
   # Check container stats
   docker stats
   
   # Increase memory limits in docker-compose.yml
   ```

### Performance Optimization

1. **Database Optimization**
   - Configure PostgreSQL settings
   - Add database indexes
   - Regular VACUUM and ANALYZE

2. **Application Optimization**
   - Use connection pooling
   - Implement caching
   - Optimize queries

3. **Container Optimization**
   - Use multi-stage builds
   - Optimize image sizes
   - Configure resource limits

## Scaling

### Horizontal Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Use load balancer
# Configure nginx for load balancing
```

### Vertical Scaling

```bash
# Increase resource limits
# Edit docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
```

## Backup and Recovery

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
CONTAINER_NAME="innovative_school_postgres"

# Create backup
docker exec $CONTAINER_NAME pg_dump -U innovative_school_user innovative_school > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### Recovery

```bash
# Restore from backup
gunzip -c backup_20240101_120000.sql.gz | docker exec -i innovative_school_postgres psql -U innovative_school_user -d innovative_school
```

## Maintenance

### Regular Tasks

1. **Daily**
   - Check service health
   - Monitor logs for errors
   - Verify backups

2. **Weekly**
   - Update dependencies
   - Review security logs
   - Performance monitoring

3. **Monthly**
   - Security updates
   - Database maintenance
   - Capacity planning

### Updates

```bash
# Update application
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# Update dependencies
docker-compose -f docker-compose.prod.yml exec backend pip install --upgrade -r requirements.txt
docker-compose -f docker-compose.prod.yml exec frontend npm update
```

## Support

For deployment issues:

1. Check the logs: `docker-compose logs -f`
2. Verify configuration files
3. Test individual services
4. Check resource usage
5. Review security settings

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Vercel Documentation](https://vercel.com/docs)