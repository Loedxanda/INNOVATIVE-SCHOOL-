@echo off
REM Production deployment script for Innovative School Platform (Windows)
REM This script handles the complete production deployment process

setlocal enabledelayedexpansion

REM Configuration
set ENVIRONMENT=production
set NAMESPACE=innovative-school
set CHART_PATH=.\helm
set VALUES_FILE=k8s\production-values.yaml
set REGISTRY=ghcr.io/your-username
set VERSION=v1.0.0

echo [%date% %time%] Starting production deployment for Innovative School Platform...

REM Pre-deployment checks
echo [INFO] Running pre-deployment checks...

REM Check if kubectl is configured
kubectl cluster-info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] kubectl is not configured or cluster is not accessible
    exit /b 1
)

REM Check if helm is installed
helm version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Helm is not installed. Please install Helm 3.x first
    exit /b 1
)

REM Check if required environment variables are set
if "%POSTGRES_PASSWORD%"=="" (
    echo [ERROR] Required environment variable POSTGRES_PASSWORD is not set
    exit /b 1
)
if "%SECRET_KEY%"=="" (
    echo [ERROR] Required environment variable SECRET_KEY is not set
    exit /b 1
)
if "%JWT_SECRET_KEY%"=="" (
    echo [ERROR] Required environment variable JWT_SECRET_KEY is not set
    exit /b 1
)
if "%GOOGLE_MAPS_API_KEY%"=="" (
    echo [ERROR] Required environment variable GOOGLE_MAPS_API_KEY is not set
    exit /b 1
)
if "%AWS_ACCESS_KEY_ID%"=="" (
    echo [ERROR] Required environment variable AWS_ACCESS_KEY_ID is not set
    exit /b 1
)
if "%AWS_SECRET_ACCESS_KEY%"=="" (
    echo [ERROR] Required environment variable AWS_SECRET_ACCESS_KEY is not set
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker first
    exit /b 1
)

echo [SUCCESS] Pre-deployment checks passed

REM Build production images
echo [INFO] Building production Docker images...

echo [INFO] Building backend image...
docker build -t %REGISTRY%/innovative-school-backend:%VERSION% .\backend
docker build -t %REGISTRY%/innovative-school-backend:latest .\backend

echo [INFO] Building frontend image...
docker build -t %REGISTRY%/innovative-school-frontend:%VERSION% .\frontend
docker build -t %REGISTRY%/innovative-school-frontend:latest .\frontend

echo [INFO] Pushing images to registry...
docker push %REGISTRY%/innovative-school-backend:%VERSION%
docker push %REGISTRY%/innovative-school-backend:latest
docker push %REGISTRY%/innovative-school-frontend:%VERSION%
docker push %REGISTRY%/innovative-school-frontend:latest

echo [SUCCESS] Production images built and pushed successfully

REM Create production secrets
echo [INFO] Creating production secrets...

REM Create namespace if it doesn't exist
kubectl create namespace %NAMESPACE% --dry-run=client -o yaml | kubectl apply -f -

REM Create secrets
kubectl create secret generic innovative-school-secrets ^
    --from-literal=POSTGRES_PASSWORD="%POSTGRES_PASSWORD%" ^
    --from-literal=SECRET_KEY="%SECRET_KEY%" ^
    --from-literal=JWT_SECRET_KEY="%JWT_SECRET_KEY%" ^
    --from-literal=GOOGLE_MAPS_API_KEY="%GOOGLE_MAPS_API_KEY%" ^
    --from-literal=AWS_ACCESS_KEY_ID="%AWS_ACCESS_KEY_ID%" ^
    --from-literal=AWS_SECRET_ACCESS_KEY="%AWS_SECRET_ACCESS_KEY%" ^
    --from-literal=SENDGRID_API_KEY="%SENDGRID_API_KEY%" ^
    --from-literal=TWILIO_ACCOUNT_SID="%TWILIO_ACCOUNT_SID%" ^
    --from-literal=TWILIO_AUTH_TOKEN="%TWILIO_AUTH_TOKEN%" ^
    --from-literal=GRAFANA_ADMIN_PASSWORD="%GRAFANA_ADMIN_PASSWORD%" ^
    --from-literal=SLACK_WEBHOOK_URL="%SLACK_WEBHOOK_URL%" ^
    --from-literal=SENTRY_DSN="%SENTRY_DSN%" ^
    -n %NAMESPACE% ^
    --dry-run=client -o yaml | kubectl apply -f -

echo [SUCCESS] Production secrets created successfully

REM Deploy using Helm
echo [INFO] Deploying with Helm...

REM Update Helm dependencies
echo [INFO] Updating Helm dependencies...
helm dependency update %CHART_PATH%

REM Install or upgrade the release
helm list -n %NAMESPACE% | findstr innovative-school >nul
if errorlevel 1 (
    echo [INFO] Installing new release...
    helm install innovative-school %CHART_PATH% ^
        --namespace %NAMESPACE% ^
        --create-namespace ^
        --values %VALUES_FILE% ^
        --wait ^
        --timeout=10m
) else (
    echo [INFO] Upgrading existing release...
    helm upgrade innovative-school %CHART_PATH% ^
        --namespace %NAMESPACE% ^
        --values %VALUES_FILE% ^
        --wait ^
        --timeout=10m
)

echo [SUCCESS] Helm deployment completed successfully

REM Post-deployment checks
echo [INFO] Running post-deployment checks...

echo [INFO] Waiting for all pods to be ready...
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=innovative-school -n %NAMESPACE% --timeout=300s

echo [INFO] Checking pod status...
kubectl get pods -n %NAMESPACE%

echo [INFO] Checking services...
kubectl get services -n %NAMESPACE%

echo [INFO] Checking ingress...
kubectl get ingress -n %NAMESPACE%

echo [SUCCESS] Post-deployment checks completed

REM Setup monitoring
echo [INFO] Setting up monitoring and alerting...

kubectl get pods -n %NAMESPACE% | findstr prometheus >nul
if errorlevel 1 (
    echo [WARNING] Prometheus is not running - monitoring may not be available
) else (
    echo [INFO] Prometheus is running
)

kubectl get pods -n %NAMESPACE% | findstr grafana >nul
if errorlevel 1 (
    echo [WARNING] Grafana is not running - dashboards may not be available
) else (
    echo [INFO] Grafana is running
)

echo [SUCCESS] Monitoring setup completed

REM Display deployment information
echo [INFO] Deployment Information:
echo.
echo Environment: %ENVIRONMENT%
echo Namespace: %NAMESPACE%
echo Version: %VERSION%
echo Registry: %REGISTRY%
echo.
echo Access URLs:
echo   Frontend: https://innovativeschool.cm
echo   API: https://api.innovativeschool.cm
echo   API Docs: https://api.innovativeschool.cm/docs
echo.
echo Monitoring:
echo   Prometheus: kubectl port-forward -n %NAMESPACE% svc/prometheus-service 9090:9090
echo   Grafana: kubectl port-forward -n %NAMESPACE% svc/grafana-service 3000:3000
echo.
echo Useful Commands:
echo   View pods: kubectl get pods -n %NAMESPACE%
echo   View logs: kubectl logs -f deployment/backend -n %NAMESPACE%
echo   Scale backend: kubectl scale deployment backend --replicas=10 -n %NAMESPACE%
echo   Check status: kubectl get all -n %NAMESPACE%
echo.

echo [SUCCESS] Production deployment completed successfully! 🎉
echo.
echo Your Innovative School Platform is now live at:
echo   🌐 https://innovativeschool.cm
echo   📚 https://api.innovativeschool.cm/docs
echo.
echo Next steps:
echo   1. Update your DNS records to point to the load balancer IP
echo   2. Configure SSL certificates (if not already done)
echo   3. Set up monitoring alerts
echo   4. Configure backup schedules
echo   5. Train your team on the platform

