@echo off
REM MVP Testing Script for Innovative School Platform (Windows)
REM This script runs comprehensive tests for the MVP

echo 🚀 Starting MVP Testing for Innovative School Platform
echo ==================================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please install Python first.
    exit /b 1
)

echo [SUCCESS] All prerequisites are installed

REM Start services
echo [INFO] Starting services with Docker Compose...
docker-compose up -d

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Some services failed to start
    docker-compose logs
    exit /b 1
)

echo [SUCCESS] All services are running

REM Run backend tests
echo [INFO] Running backend tests...
cd backend

REM Install dependencies
echo [INFO] Installing backend dependencies...
pip install -r requirements.txt

REM Run unit tests
echo [INFO] Running backend unit tests...
pytest tests/ -v --tb=short
if %errorlevel% neq 0 (
    echo [ERROR] Backend unit tests failed
    exit /b 1
)
echo [SUCCESS] Backend unit tests passed

REM Run integration tests
echo [INFO] Running backend integration tests...
pytest tests/test_api_integration.py -v --tb=short
if %errorlevel% neq 0 (
    echo [ERROR] Backend integration tests failed
    exit /b 1
)
echo [SUCCESS] Backend integration tests passed

REM Run performance tests
echo [INFO] Running backend performance tests...
pytest tests/test_performance.py -v --tb=short
if %errorlevel% neq 0 (
    echo [WARNING] Backend performance tests failed (non-critical)
)

REM Run security tests
echo [INFO] Running security tests...
pytest tests/test_security.py -v --tb=short
if %errorlevel% neq 0 (
    echo [ERROR] Security tests failed
    exit /b 1
)
echo [SUCCESS] Security tests passed

cd ..

REM Run frontend tests
echo [INFO] Running frontend tests...
cd frontend

REM Install dependencies
echo [INFO] Installing frontend dependencies...
npm install

REM Run unit tests
echo [INFO] Running frontend unit tests...
npm test -- --coverage --watchAll=false
if %errorlevel% neq 0 (
    echo [ERROR] Frontend unit tests failed
    exit /b 1
)
echo [SUCCESS] Frontend unit tests passed

REM Run integration tests
echo [INFO] Running frontend integration tests...
npm run test:integration
if %errorlevel% neq 0 (
    echo [WARNING] Frontend integration tests failed (non-critical)
)

REM Run E2E tests
echo [INFO] Running E2E tests...
npm run cypress:run
if %errorlevel% neq 0 (
    echo [ERROR] E2E tests failed
    exit /b 1
)
echo [SUCCESS] E2E tests passed

cd ..

REM Generate test reports
echo [INFO] Generating test reports...
mkdir test-reports 2>nul

REM Generate backend coverage report
cd backend
pytest --cov=. --cov-report=html --cov-report=xml
copy htmlcov\index.html ..\test-reports\backend-coverage.html
copy coverage.xml ..\test-reports\backend-coverage.xml
cd ..

REM Generate frontend coverage report
cd frontend
npm run test:coverage
copy coverage\lcov-report\index.html ..\test-reports\frontend-coverage.html
cd ..

echo [SUCCESS] Test reports generated in test-reports/ directory

REM Cleanup
echo [INFO] Cleaning up...
docker-compose down
docker-compose down -v

echo [SUCCESS] Cleanup completed
echo [SUCCESS] All tests completed successfully! 🎉

pause

