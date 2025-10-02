# AWS Deployment Guide for Innovative School Platform

This guide provides step-by-step instructions for deploying the Innovative School Platform on Amazon Web Services (AWS).

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Docker** installed on your local machine
4. **Domain name** (optional but recommended)
5. **SSL Certificate** (can be obtained through AWS Certificate Manager)

## Architecture Overview

The deployment will consist of:
- **EC2 Instance** running Docker containers
- **RDS PostgreSQL** (optional, for production database)
- **ElastiCache Redis** (optional, for production cache)
- **Application Load Balancer** (optional, for high availability)
- **S3 Bucket** for static assets and backups
- **CloudFront** (optional, for CDN)
- **Route 53** for DNS management

## Deployment Options

### Option 1: Single EC2 Instance (Recommended for MVP)

This approach deploys all services on a single EC2 instance using Docker Compose, similar to the local deployment.

### Option 2: Microservices Architecture (Recommended for Production)

This approach separates services into different AWS resources for better scalability and reliability.

## Option 1: Single EC2 Instance Deployment

### Step 1: Launch EC2 Instance

1. Sign in to the AWS Management Console
2. Navigate to EC2 Dashboard
3. Click "Launch Instance"
4. Choose an Amazon Machine Image (AMI):
   - **Ubuntu Server 20.04 LTS (HVM), SSD Volume Type**
5. Select an Instance Type:
   - **t3.medium** (2 vCPUs, 4 GiB RAM) - Minimum recommendation
   - **t3.large** (2 vCPUs, 8 GiB RAM) - Recommended for production
6. Configure Instance Details:
   - Network: Choose your VPC
   - Subnet: Choose a public subnet
   - Auto-assign Public IP: Enable
7. Add Storage:
   - Root volume: 20 GiB (gp2)
   - Add additional volume for data: 50 GiB (gp2)
8. Add Tags:
   - Name: innovative-school-platform
9. Configure Security Group:
   - SSH (port 22) from your IP
   - HTTP (port 80) from anywhere (0.0.0.0/0)
   - HTTPS (port 443) from anywhere (0.0.0.0/0)
   - PostgreSQL (port 5432) from your IP (for direct access if needed)
10. Review and Launch with your key pair

### Step 2: Connect to EC2 Instance

```bash
# SSH into your instance
ssh -i /path/to/your-key.pem ubuntu@your-ec2-public-ip

# Update system packages
sudo apt update && sudo apt upgrade -y
```

### Step 3: Install Docker and Docker Compose

```bash
# Install Docker
sudo apt install docker.io -y

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Log out and log back in for group changes to take effect
exit
```

### Step 4: Deploy Application

```bash
# SSH back into your instance
ssh -i /path/to/your-key.pem ubuntu@your-ec2-public-ip

# Clone the repository
git clone https://github.com/your-org/innovative-school-platform.git
cd innovative-school-platform

# Create environment files
cp env.example .env
cp frontend/env.example frontend/.env
cp backend/env.example backend/.env

# Edit environment variables
nano .env
```

Update the following in your `.env` file:
```
# Database Configuration
POSTGRES_PASSWORD=your_secure_database_password

# Redis Configuration
REDIS_PASSWORD=your_secure_redis_password

# JWT Configuration
JWT_SECRET_KEY=your_very_long_jwt_secret_key
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# Security Configuration
SECRET_KEY=your_very_long_secret_key

# Email Configuration (if using)
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# AWS S3 Configuration (if using)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET=your_s3_bucket_name
S3_REGION=your_preferred_region
```

### Step 5: Start Services

```bash
# Build and start services
docker-compose up -d

# Wait for services to initialize (5-10 minutes)
sleep 300

# Initialize database
docker-compose exec backend alembic upgrade head

# Create admin user
docker-compose exec backend python create_admin.py
```

### Step 6: Configure DNS and SSL (Optional but Recommended)

1. **Reserve Elastic IP**:
   - In EC2 Dashboard, go to "Elastic IPs"
   - Click "Allocate Elastic IP address"
   - Associate it with your EC2 instance

2. **Configure Route 53**:
   - In Route 53, create a hosted zone for your domain
   - Create an A record pointing to your Elastic IP

3. **Set up SSL with Let's Encrypt**:
```bash
# Install Certbot
sudo apt install certbot -y

# Obtain SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx configuration to use SSL
# Edit nginx/nginx.prod.conf to include SSL configuration
```

### Step 7: Configure Monitoring and Backups

```bash
# Set up CloudWatch logs
# Create log groups in CloudWatch for:
# - /innovative-school/platform
# - /innovative-school/nginx
# - /innovative-school/postgres
# - /innovative-school/redis

# Configure automated backups
# The platform includes automated backup scripts
# You can also set up S3 backups:
# 1. Create S3 bucket
# 2. Update AWS credentials in .env
# 3. Configure backup schedule in crontab
```

## Option 2: Microservices Architecture (Production)

### Step 1: Set up RDS PostgreSQL

1. Navigate to RDS in AWS Console
2. Click "Create database"
3. Choose "PostgreSQL"
4. Select version 13 or later
5. Templates: Production
6. DB instance identifier: innovative-school-db
7. Master username: postgres
8. Master password: your_secure_password
9. DB instance class: db.t3.medium
10. Storage: 100 GiB
11. Storage autoscaling: Enable
12. VPC: Select your VPC
13. Public access: No
14. Security group: Create new or use existing
15. Database name: innovative_school
16. Backup retention: 7 days
17. Enable deletion protection

### Step 2: Set up ElastiCache Redis

1. Navigate to ElastiCache in AWS Console
2. Click "Create"
3. Redis version: 6.x
4. Name: innovative-school-redis
5. Node type: cache.t3.medium
6. Number of replicas: 1
7. Multi-AZ: Enable
8. VPC: Select your VPC
9. Subnet group: Create new or use existing
10. Security group: Create new or use existing

### Step 3: Set up ECR for Docker Images

```bash
# Install AWS CLI if not already installed
pip install awscli

# Configure AWS CLI
aws configure

# Create ECR repositories
aws ecr create-repository --repository-name innovative-school/backend
aws ecr create-repository --repository-name innovative-school/frontend
aws ecr create-repository --repository-name innovative-school/ai-service

# Login to ECR
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account.dkr.ecr.your-region.amazonaws.com

# Build and push images
cd backend
docker build -t your-account.dkr.ecr.your-region.amazonaws.com/innovative-school/backend:latest .
docker push your-account.dkr.ecr.your-region.amazonaws.com/innovative-school/backend:latest

cd ../frontend
docker build -t your-account.dkr.ecr.your-region.amazonaws.com/innovative-school/frontend:latest .
docker push your-account.dkr.ecr.your-region.amazonaws.com/innovative-school/frontend:latest

cd ../ai_services/pedagogic_ai
docker build -t your-account.dkr.ecr.your-region.amazonaws.com/innovative-school/ai-service:latest .
docker push your-account.dkr.ecr.your-region.amazonaws.com/innovative-school/ai-service:latest
```

### Step 4: Deploy with ECS or EKS

1. **Using ECS**:
   - Create ECS cluster
   - Create task definitions for each service
   - Create services for each task
   - Configure load balancer

2. **Using EKS**:
   - Create EKS cluster
   - Deploy with Helm charts
   - Configure ingress controller

## Monitoring and Maintenance

### CloudWatch Setup

1. Create alarms for:
   - CPU utilization > 80%
   - Memory utilization > 80%
   - Disk space < 20%
   - Service health checks

2. Set up log monitoring:
   - Application logs
   - Nginx access/error logs
   - Database logs
   - Redis logs

### Backup Strategy

1. **Database Backups**:
   - Enable automated backups in RDS
   - Set retention period (7-35 days)
   - Create manual snapshots before major updates

2. **S3 Backups**:
   - Configure lifecycle policies
   - Enable versioning
   - Set up cross-region replication

3. **Application Backups**:
   - Use built-in backup scripts
   - Schedule regular backups to S3
   - Test restore procedures regularly

### Security Best Practices

1. **Network Security**:
   - Use security groups to restrict access
   - Implement VPC with private and public subnets
   - Use Network ACLs for additional protection

2. **Data Security**:
   - Enable encryption at rest
   - Use SSL/TLS for data in transit
   - Regularly rotate credentials

3. **Application Security**:
   - Keep Docker images updated
   - Apply security patches regularly
   - Implement WAF for web application protection

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**:
   - Use Application Load Balancer
   - Configure auto-scaling groups
   - Set up health checks

2. **Database Scaling**:
   - Use read replicas for read-heavy operations
   - Implement connection pooling
   - Consider database sharding for large datasets

### Vertical Scaling

1. **EC2 Instance**:
   - Monitor resource utilization
   - Upgrade instance type as needed
   - Use burstable instances for variable workloads

2. **Database**:
   - Upgrade RDS instance class
   - Increase storage as needed
   - Optimize queries and indexes

## Cost Optimization

### Resource Optimization

1. **Right-sizing**:
   - Monitor actual resource usage
   - Adjust instance types accordingly
   - Use reserved instances for predictable workloads

2. **Storage Optimization**:
   - Use appropriate storage types
   - Implement lifecycle policies
   - Enable compression and deduplication

### Cost Monitoring

1. **AWS Cost Explorer**:
   - Track spending trends
   - Set up budget alerts
   - Identify cost optimization opportunities

2. **Tagging Strategy**:
   - Tag resources with cost centers
   - Use consistent naming conventions
   - Implement resource grouping

## Troubleshooting

### Common Issues

1. **Services Not Starting**:
   - Check Docker logs: `docker-compose logs service-name`
   - Verify environment variables
   - Check port conflicts

2. **Database Connection Issues**:
   - Verify database credentials
   - Check security group rules
   - Ensure database is accepting connections

3. **Performance Issues**:
   - Monitor resource utilization
   - Check database query performance
   - Optimize slow queries

### Recovery Procedures

1. **Database Recovery**:
   - Restore from RDS snapshot
   - Use point-in-time recovery
   - Apply latest backups

2. **Application Recovery**:
   - Redeploy from Docker images
   - Restore from S3 backups
   - Recreate environment from configuration

## Conclusion

This guide provides a comprehensive approach to deploying the Innovative School Platform on AWS. The single EC2 instance approach is suitable for MVP and testing, while the microservices architecture is recommended for production environments requiring high availability and scalability.

Regular monitoring, backups, and security updates are essential for maintaining a production environment. Consider using AWS managed services where possible to reduce operational overhead and improve reliability.