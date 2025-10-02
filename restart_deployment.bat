@echo off
REM Innovative School Platform - Deployment Restart Script
REM This script helps restart the deployment process

echo ========================================
echo Innovative School Platform - Deployment Restart
echo ========================================
echo.

echo This script will:
echo 1. Stop any running services
echo 2. Clean up existing containers
echo 3. Rebuild and restart all services
echo.

echo WARNING: This will stop all services and rebuild images
echo If you have important data, make sure it's backed up
echo.

set /p confirm=Do you want to continue? (y/N): 

if /i not "%confirm%"=="y" (
    echo Deployment restart cancelled
    pause
    exit /b 0
)

echo.
echo 1. Stopping services...
docker-compose down
if %errorlevel% neq 0 (
    echo WARNING: Failed to stop services, continuing anyway...
)

echo.
echo 2. Cleaning up Docker system (this may take a moment)...
echo This will remove:
echo - All stopped containers
echo - All networks not used by at least one container
echo - All build cache
echo.
docker system prune -f
if %errorlevel% neq 0 (
    echo WARNING: Failed to prune Docker system, continuing anyway...
)

echo.
echo 3. Building Docker images...
echo This may take 10-20 minutes on first run
echo Please be patient...
docker-compose build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build Docker images
    echo Check the error messages above
    pause
    exit /b 1
)

echo.
echo 4. Starting services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start services
    echo Check the error messages above
    pause
    exit /b 1
)

echo.
echo 5. Waiting for services to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo 6. Initializing database...
docker-compose exec backend alembic upgrade head
if %errorlevel% neq 0 (
    echo WARNING: Database initialization may have failed
    echo You may need to run this command manually later
    echo docker-compose exec backend alembic upgrade head
)

echo.
echo 7. Creating admin user...
docker-compose exec backend python create_admin.py
if %errorlevel% neq 0 (
    echo WARNING: Failed to create admin user
    echo You may need to run this command manually later
    echo docker-compose exec backend python create_admin.py
)

echo.
echo ========================================
echo Deployment Restart Complete!
echo ========================================
echo.
echo Services should now be running
echo.
echo Check status with:
echo docker-compose ps
echo.
echo Check logs with:
echo docker-compose logs
echo.
echo Access the application at:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo AI Service: http://localhost:8001
echo.
echo Default admin credentials:
echo Email: admin@school.cm
echo Password: admin123
echo.
pause