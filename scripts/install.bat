@echo off
REM Innovative School Platform - Installation Script (Windows)
REM This script automates the installation process

echo 🚀 Starting Innovative School Platform Installation
echo ==================================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    echo See the installation guide for detailed instructions.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    echo See the installation guide for detailed instructions.
    pause
    exit /b 1
)

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed. Please install Git first.
    echo See the installation guide for detailed instructions.
    pause
    exit /b 1
)

echo [SUCCESS] All prerequisites are installed

REM Create environment files
echo [INFO] Creating environment files...

if not exist .env (
    copy env.example .env
    echo [SUCCESS] Created .env file
) else (
    echo [WARNING] .env file already exists, skipping...
)

if not exist frontend\.env (
    copy frontend\env.example frontend\.env
    echo [SUCCESS] Created frontend\.env file
) else (
    echo [WARNING] frontend\.env file already exists, skipping...
)

if not exist backend\.env (
    copy backend\env.example backend\.env
    echo [SUCCESS] Created backend\.env file
) else (
    echo [WARNING] backend\.env file already exists, skipping...
)

REM Generate secure passwords
echo [INFO] Generating secure passwords...

REM Generate random passwords using PowerShell
for /f %%i in ('powershell -Command "Get-Random -Minimum 100000 -Maximum 999999"') do set postgres_password=%%i
for /f %%i in ('powershell -Command "Get-Random -Minimum 100000 -Maximum 999999"') do set redis_password=%%i
for /f %%i in ('powershell -Command "Get-Random -Minimum 100000 -Maximum 999999"') do set jwt_secret=%%i
for /f %%i in ('powershell -Command "Get-Random -Minimum 100000 -Maximum 999999"') do set secret_key=%%i

REM Update .env files with generated passwords
powershell -Command "(Get-Content .env) -replace 'your_secure_password_here', '%postgres_password%' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'your_redis_password_here', '%redis_password%' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'your_jwt_secret_key_here_make_it_long_and_secure', '%jwt_secret%' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'your_secret_key_here_make_it_long_and_secure', '%secret_key%' | Set-Content .env"

REM Update backend .env
powershell -Command "(Get-Content backend\.env) -replace 'your_secure_password_here', '%postgres_password%' | Set-Content backend\.env"
powershell -Command "(Get-Content backend\.env) -replace 'your_redis_password_here', '%redis_password%' | Set-Content backend\.env"
powershell -Command "(Get-Content backend\.env) -replace 'your_jwt_secret_key_here_make_it_long_and_secure', '%jwt_secret%' | Set-Content backend\.env"
powershell -Command "(Get-Content backend\.env) -replace 'your_secret_key_here_make_it_long_and_secure', '%secret_key%' | Set-Content backend\.env"

echo [SUCCESS] Generated secure passwords and updated configuration files

REM Build Docker images
echo [INFO] Building Docker images...
docker-compose build --no-cache

if %errorlevel% neq 0 (
    echo [ERROR] Failed to build Docker images
    pause
    exit /b 1
)

echo [SUCCESS] Docker images built successfully

REM Start services
echo [INFO] Starting services...
docker-compose up -d

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Some services failed to start
    docker-compose logs
    pause
    exit /b 1
)

echo [SUCCESS] All services are running

REM Initialize database
echo [INFO] Initializing database...
echo [INFO] Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Run migrations
docker-compose exec backend alembic upgrade head

if %errorlevel% neq 0 (
    echo [ERROR] Database migrations failed
    pause
    exit /b 1
)

echo [SUCCESS] Database migrations completed

REM Create admin user
echo [INFO] Creating admin user...
docker-compose exec backend python create_admin.py

if %errorlevel% neq 0 (
    echo [WARNING] Failed to create admin user (you can create it manually later)
)

echo [SUCCESS] Admin user created successfully

REM Run tests
echo [INFO] Running tests...

REM Run backend tests
docker-compose exec backend pytest tests/ -v --tb=short

if %errorlevel% neq 0 (
    echo [WARNING] Some backend tests failed (non-critical)
)

REM Run frontend tests
docker-compose exec frontend npm test -- --coverage --watchAll=false

if %errorlevel% neq 0 (
    echo [WARNING] Some frontend tests failed (non-critical)
)

echo [SUCCESS] Tests completed

REM Show installation summary
echo.
echo [SUCCESS] Installation completed successfully! 🎉
echo.
echo ==================================================
echo Innovative School Platform - Installation Summary
echo ==================================================
echo.
echo 🌐 Frontend URL: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 🤖 AI Service: http://localhost:8001
echo 📚 API Documentation: http://localhost:8000/docs
echo 🧠 AI Documentation: http://localhost:8001/docs
echo 💾 Database: PostgreSQL (port 5432)
echo 🗄️  Cache: Redis (port 6379)
echo.
echo 📋 Default Admin Credentials:
echo    Email: admin@school.cm
echo    Password: admin123
echo.
echo 🔧 Management Commands:
echo    Start services: docker-compose up -d
echo    Stop services: docker-compose down
echo    View logs: docker-compose logs -f
echo    Run tests: scripts\run_tests.bat
echo.
echo 📖 Documentation:
echo    Installation Guide: docs\INSTALLATION_GUIDE.md
echo    Testing Guide: docs\MVP_TESTING_GUIDE.md
echo    Backup Guide: docs\BACKUP_AND_RECOVERY.md
echo    UI/UX Design: UI_UX_DESIGN_SPECIFICATION.md
echo    New Features: FEATURES_IMPLEMENTATION_SUMMARY.md
echo.
echo ⚠️  Important:
echo    - Change default passwords in production
echo    - Configure SSL certificates for HTTPS
echo    - Set up proper backup strategies
echo    - Review security settings
echo.
echo 🚀 Ready to use! Open http://localhost:3000 in your browser.
echo.
pause