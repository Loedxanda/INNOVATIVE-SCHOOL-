# Production Deployment Guide - Innovative School Platform

This guide covers deploying the Innovative School Platform to production environments using Kubernetes, Docker, and various cloud providers.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Cloud Provider Setup](#cloud-provider-setup)
3. [Kubernetes Cluster Setup](#kubernetes-cluster-setup)
4. [Container Registry Setup](#container-registry-setup)
5. [Deployment Methods](#deployment-methods)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Security Configuration](#security-configuration)
8. [Backup and Recovery](#backup-and-recovery)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools
- Docker Desktop or Docker Engine
- kubectl (Kubernetes CLI)
- Helm 3.x
- Git
- Cloud provider CLI tools (AWS CLI, Azure CLI, or GCP CLI)

### System Requirements
- Minimum 4 CPU cores
- Minimum 8GB RAM
- 50GB+ storage
- Kubernetes cluster with at least 3 nodes

## Cloud Provider Setup

### AWS EKS

1. **Create EKS Cluster**
```bash
# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Create cluster
eksctl create cluster \
  --name innovative-school \
  --region us-west-2 \
  --nodegroup-name workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 5 \
  --managed
```

2. **Configure kubectl**
```bash
aws eks update-kubeconfig --region us-west-2 --name innovative-school
```

### Google GKE

1. **Create GKE Cluster**
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Create cluster
gcloud container clusters create innovative-school \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-medium \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 5
```

2. **Configure kubectl**
```bash
gcloud container clusters get-credentials innovative-school --zone us-central1-a
```

### Azure AKS

1. **Create AKS Cluster**
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Create resource group
az group create --name innovative-school-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group innovative-school-rg \
  --name innovative-school \
  --node-count 3 \
  --node-vm-size Standard_B2s \
  --enable-addons monitoring \
  --generate-ssh-keys
```

2. **Configure kubectl**
```bash
az aks get-credentials --resource-group innovative-school-rg --name innovative-school
```

## Kubernetes Cluster Setup

### Install Required Components

1. **NGINX Ingress Controller**
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

2. **Cert-Manager for SSL**
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

3. **Create ClusterIssuer**
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

## Container Registry Setup

### GitHub Container Registry

1. **Login to Registry**
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

2. **Build and Push Images**
```bash
# Build backend
docker build -t ghcr.io/your-username/innovative-school-backend:latest ./backend
docker push ghcr.io/your-username/innovative-school-backend:latest

# Build frontend
docker build -t ghcr.io/your-username/innovative-school-frontend:latest ./frontend
docker push ghcr.io/your-username/innovative-school-frontend:latest
```

### AWS ECR

1. **Create ECR Repositories**
```bash
aws ecr create-repository --repository-name innovative-school-backend
aws ecr create-repository --repository-name innovative-school-frontend
```

2. **Login and Push**
```bash
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-west-2.amazonaws.com

# Tag and push
docker tag innovative-school-backend:latest 123456789012.dkr.ecr.us-west-2.amazonaws.com/innovative-school-backend:latest
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/innovative-school-backend:latest
```

## Deployment Methods

### Method 1: Direct Kubernetes Deployment

1. **Deploy using kubectl**
```bash
# Create namespace
kubectl create namespace innovative-school

# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/monitoring.yaml
```

2. **Check deployment status**
```bash
kubectl get pods -n innovative-school
kubectl get services -n innovative-school
kubectl get ingress -n innovative-school
```

### Method 2: Helm Deployment

1. **Install using Helm**
```bash
# Add dependencies
helm dependency update ./helm

# Install chart
helm install innovative-school ./helm \
  --namespace innovative-school \
  --create-namespace \
  --values helm/values.yaml
```

2. **Upgrade deployment**
```bash
helm upgrade innovative-school ./helm \
  --namespace innovative-school \
  --values helm/values.yaml
```

### Method 3: Automated Scripts

1. **Using deployment scripts**
```bash
# Linux/Mac
chmod +x scripts/deploy.sh
./scripts/deploy.sh production deploy

# Windows
scripts\deploy.bat production deploy
```

2. **Check status**
```bash
./scripts/deploy.sh production status
```

## Monitoring and Logging

### Prometheus and Grafana

1. **Access monitoring dashboards**
```bash
# Port forward to access locally
kubectl port-forward -n innovative-school svc/prometheus-service 9090:9090
kubectl port-forward -n innovative-school svc/grafana-service 3000:3000
```

2. **Access URLs**
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin123)

### Application Logs

```bash
# View backend logs
kubectl logs -f deployment/backend -n innovative-school

# View frontend logs
kubectl logs -f deployment/frontend -n innovative-school

# View all logs
kubectl logs -f -l app=innovative-school -n innovative-school
```

## Security Configuration

### SSL/TLS Setup

1. **Update DNS records**
```
A    innovativeschool.cm        -> <LoadBalancer-IP>
A    api.innovativeschool.cm   -> <LoadBalancer-IP>
CNAME www.innovativeschool.cm  -> innovativeschool.cm
```

2. **Verify SSL certificates**
```bash
kubectl get certificates -n innovative-school
kubectl describe certificate innovative-school-tls -n innovative-school
```

### Security Best Practices

1. **Network Policies**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: innovative-school-network-policy
  namespace: innovative-school
spec:
  podSelector:
    matchLabels:
      app: innovative-school
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 8000
```

2. **Pod Security Standards**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: innovative-school
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

## Backup and Recovery

### Database Backup

1. **Automated backups**
```bash
# Create backup job
kubectl apply -f k8s/backup-job.yaml
```

2. **Manual backup**
```bash
kubectl exec -it deployment/postgres -n innovative-school -- pg_dump -U postgres innovative_school > backup.sql
```

### Application Backup

1. **Configuration backup**
```bash
kubectl get all -n innovative-school -o yaml > innovative-school-backup.yaml
```

2. **Secrets backup**
```bash
kubectl get secrets -n innovative-school -o yaml > secrets-backup.yaml
```

## Troubleshooting

### Common Issues

1. **Pods not starting**
```bash
kubectl describe pod <pod-name> -n innovative-school
kubectl logs <pod-name> -n innovative-school
```

2. **Service not accessible**
```bash
kubectl get endpoints -n innovative-school
kubectl describe service <service-name> -n innovative-school
```

3. **Ingress not working**
```bash
kubectl describe ingress innovative-school-ingress -n innovative-school
kubectl get ingressclass
```

### Performance Issues

1. **Resource constraints**
```bash
kubectl top pods -n innovative-school
kubectl top nodes
```

2. **Scaling**
```bash
kubectl scale deployment backend --replicas=5 -n innovative-school
kubectl autoscale deployment backend --min=3 --max=10 --cpu-percent=70 -n innovative-school
```

### Health Checks

1. **Application health**
```bash
# Backend health
curl -f https://api.innovativeschool.cm/health

# Frontend health
curl -f https://innovativeschool.cm/
```

2. **Database connectivity**
```bash
kubectl exec -it deployment/postgres -n innovative-school -- psql -U postgres -c "SELECT 1;"
```

## Production Checklist

- [ ] Kubernetes cluster created and configured
- [ ] Container registry setup and images pushed
- [ ] SSL certificates configured
- [ ] DNS records updated
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented
- [ ] Security policies applied
- [ ] Load testing completed
- [ ] Disaster recovery plan tested
- [ ] Documentation updated

## Support

For deployment issues or questions:
- Check the troubleshooting section above
- Review application logs
- Contact the development team
- Create an issue in the project repository

## Next Steps

After successful deployment:
1. Configure monitoring alerts
2. Set up automated backups
3. Implement CI/CD pipeline
4. Plan for scaling and maintenance
5. Train operations team

