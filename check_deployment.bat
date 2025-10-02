@echo off
REM Innovative School Platform - Deployment Status Checker
REM This script checks the status of the ongoing deployment

echo ========================================
echo Innovative School Platform - Deployment Status
echo ========================================
echo.

echo Current time: %date% %time%
echo.

echo Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running
    echo Please start Docker Desktop
    exit /b 1
)

echo Docker is running
echo.

echo Checking if deployment is still in progress...
echo Looking for Docker build processes...
docker ps | findstr build >nul
if %errorlevel% equ 0 (
    echo Deployment is still building images...
) else (
    echo No active build processes found
)

echo.
echo Current Docker containers:
echo ========================
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo Docker Compose services:
echo ======================
docker-compose ps

echo.
echo If no services are shown above, the build process may still be ongoing.
echo This can take 10-20 minutes on first run depending on your internet connection.
echo.

echo To check logs for a specific service:
echo docker-compose logs [service_name]
echo.

pause