@echo off
REM Innovative School Platform - Stop Services Script
REM This script stops all running services

echo ========================================
echo Innovative School Platform - Stop Services
echo ========================================
echo.

REM Check if Docker is running
echo Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running
    echo Please start Docker Desktop
    pause
    exit /b 1
)

echo Docker is running
echo.

REM Show current status
echo Current services:
echo ===============
docker-compose ps

echo.
echo Stopping all services...
docker-compose down

echo.
echo All services have been stopped
echo.

echo To remove all data (including database):
echo docker-compose down -v
echo WARNING: This will delete all data!
echo.

pause