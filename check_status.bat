@echo off
REM Innovative School Platform - Status Check Script
REM This script checks the status of all services

echo ========================================
echo Innovative School Platform - Service Status
echo ========================================
echo.

REM Check if Docker is running
echo Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo Docker is running
echo.

REM Show service status
echo Current service status:
echo ======================
docker-compose ps

echo.
echo Service logs (last 20 lines):
echo =============================

echo Backend logs:
docker-compose logs --tail=10 backend

echo.
echo Frontend logs:
docker-compose logs --tail=10 frontend

echo.
echo Database logs:
docker-compose logs --tail=10 postgres

echo.
echo AI Service logs:
docker-compose logs --tail=10 pedagogic-ai

echo.
echo ========================================
echo Status Check Complete
echo ========================================
echo.
echo To view more logs for a specific service:
echo docker-compose logs [service_name]
echo.
echo To restart a specific service:
echo docker-compose restart [service_name]
echo.
echo To stop all services:
echo docker-compose down
echo.
pause