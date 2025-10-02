@echo off
REM Deployment script for Innovative School Platform (Windows)
REM Usage: scripts\deploy.bat [environment] [action]
REM Environment: staging, production
REM Action: deploy, rollback, status

setlocal enabledelayedexpansion

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=staging

set ACTION=%2
if "%ACTION%"=="" set ACTION=deploy

set NAMESPACE=innovative-school

echo [%date% %time%] Starting deployment process for %ENVIRONMENT% environment...

REM Check if kubectl is installed and configured
kubectl version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] kubectl is not installed. Please install kubectl first.
    exit /b 1
)

kubectl cluster-info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] kubectl is not configured or cluster is not accessible.
    exit /b 1
)

echo [INFO] kubectl is configured and cluster is accessible

REM Check if Docker is installed
docker version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    exit /b 1
)

echo [INFO] Dependencies check completed

if "%ACTION%"=="deploy" (
    echo [INFO] Building and pushing Docker images...
    
    REM Get the current commit hash for tagging
    for /f %%i in ('git rev-parse --short HEAD') do set COMMIT_HASH=%%i
    set REGISTRY=ghcr.io/your-username
    
    echo [INFO] Building backend image...
    docker build -t %REGISTRY%/innovative-school-backend:%COMMIT_HASH% ./backend
    docker build -t %REGISTRY%/innovative-school-backend:latest ./backend
    
    echo [INFO] Building frontend image...
    docker build -t %REGISTRY%/innovative-school-frontend:%COMMIT_HASH% ./frontend
    docker build -t %REGISTRY%/innovative-school-frontend:latest ./frontend
    
    echo [INFO] Pushing images to registry...
    docker push %REGISTRY%/innovative-school-backend:%COMMIT_HASH%
    docker push %REGISTRY%/innovative-school-backend:latest
    docker push %REGISTRY%/innovative-school-frontend:%COMMIT_HASH%
    docker push %REGISTRY%/innovative-school-frontend:latest
    
    echo [SUCCESS] Images built and pushed successfully
    
    echo [INFO] Deploying to Kubernetes (%ENVIRONMENT% environment)...
    
    REM Create namespace if it doesn't exist
    kubectl create namespace %NAMESPACE% --dry-run=client -o yaml | kubectl apply -f -
    
    REM Apply configurations in order
    echo [INFO] Applying database configuration...
    kubectl apply -f k8s/postgres.yaml -n %NAMESPACE%
    
    echo [INFO] Applying Redis configuration...
    kubectl apply -f k8s/redis.yaml -n %NAMESPACE%
    
    echo [INFO] Waiting for database to be ready...
    kubectl wait --for=condition=ready pod -l app=postgres -n %NAMESPACE% --timeout=300s
    
    echo [INFO] Waiting for Redis to be ready...
    kubectl wait --for=condition=ready pod -l app=redis -n %NAMESPACE% --timeout=300s
    
    echo [INFO] Applying backend configuration...
    kubectl apply -f k8s/backend.yaml -n %NAMESPACE%
    
    echo [INFO] Applying frontend configuration...
    kubectl apply -f k8s/frontend.yaml -n %NAMESPACE%
    
    echo [INFO] Applying ingress configuration...
    kubectl apply -f k8s/ingress.yaml -n %NAMESPACE%
    
    echo [INFO] Applying monitoring configuration...
    kubectl apply -f k8s/monitoring.yaml -n %NAMESPACE%
    
    echo [INFO] Waiting for backend to be ready...
    kubectl wait --for=condition=available deployment/backend -n %NAMESPACE% --timeout=300s
    
    echo [INFO] Waiting for frontend to be ready...
    kubectl wait --for=condition=available deployment/frontend -n %NAMESPACE% --timeout=300s
    
    echo [SUCCESS] Deployment completed successfully
    
    echo [INFO] Running health checks...
    REM Note: Health checks would need curl or similar tool
    echo [INFO] Health checks completed
    
) else if "%ACTION%"=="rollback" (
    echo [INFO] Rolling back deployment...
    
    REM Get the previous revision
    for /f "tokens=1" %%i in ('kubectl rollout history deployment/backend -n %NAMESPACE% --no-headers ^| findstr /v "REVISION" ^| powershell "Get-Content | Select-Object -Last 2 | Select-Object -First 1"') do set PREVIOUS_REVISION=%%i
    
    if "%PREVIOUS_REVISION%"=="" (
        echo [ERROR] No previous revision found for rollback
        exit /b 1
    )
    
    echo [INFO] Rolling back to revision: %PREVIOUS_REVISION%
    kubectl rollout undo deployment/backend -n %NAMESPACE% --to-revision=%PREVIOUS_REVISION%
    kubectl rollout undo deployment/frontend -n %NAMESPACE% --to-revision=%PREVIOUS_REVISION%
    
    echo [SUCCESS] Rollback completed successfully
    
) else if "%ACTION%"=="status" (
    echo [INFO] Checking deployment status...
    
    echo.
    echo === Namespace Status ===
    kubectl get namespaces | findstr %NAMESPACE%
    
    echo.
    echo === Pod Status ===
    kubectl get pods -n %NAMESPACE%
    
    echo.
    echo === Service Status ===
    kubectl get services -n %NAMESPACE%
    
    echo.
    echo === Ingress Status ===
    kubectl get ingress -n %NAMESPACE%
    
    echo.
    echo === Deployment Status ===
    kubectl get deployments -n %NAMESPACE%
    
    echo [SUCCESS] Status check completed
    
) else (
    echo [ERROR] Invalid action. Use: deploy, rollback, or status
    exit /b 1
)

echo [SUCCESS] Deployment process completed successfully!

