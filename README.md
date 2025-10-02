# Innovative School Platform MVP

A next-generation, AI-powered, multilingual school management and learning platform designed specifically for Cameroonian primary and secondary schools.

## 🌟 Features

### Core School Management
- **Student Management**: Complete student profiles, enrollment, and academic tracking
- **Teacher Management**: Teacher profiles, class assignments, and subject management
- **Class & Subject Management**: Flexible class structures and curriculum support
- **Attendance Tracking**: Real-time attendance marking with automated reports
- **Grade Management**: Comprehensive gradebook and report card generation
- **Parent Portal**: Parent access to child's academic progress and communication

### Advanced Features
- **Multilingual Support**: English, French, and Cameroonian local languages
- **AI-Powered Analytics**: Personalized learning insights and performance analytics
- **Google Maps Integration**: Bus routes, school locations, and student home mapping
- **Notification System**: Email, SMS, and push notifications for parents and staff
- **Backup & Recovery**: Automated database backups with cloud storage integration
- **Performance Optimization**: Redis caching and database query optimization
- **Security**: Role-based access control, rate limiting, and data encryption

### Newly Implemented Features

#### Teacher Resource Hub
- **Resource Sharing**: Teachers can upload files (PDF, DOCX, PPT) and video links
- **Categorization**: Resources organized by subject, grade level, and topic
- **Community Feedback**: Rating and commenting system for resource quality assessment
- **Access Control**: Teachers upload, all users view

#### In-App Messaging System
- **Private Communication**: Direct messaging between all user roles
- **Group Chats**: Class groups and administrative teams
- **Support Channel**: Dedicated channel for school inquiries
- **Message Tracking**: Read status and unread message counters

#### Pedagogic AI Assistant
- **Educational Expertise**: AI aligned with pedagogical best practices
- **Context-Aware Responses**: Personalized advice based on user role and specialization
- **Privacy Controls**: Opt-in conversation saving with data protection
- **Microservice Architecture**: Dedicated AI service with RESTful API

#### School Inquiry Management System
- **Form-Based Submission**: Structured inquiry process with automatic ticketing
- **Department Routing**: Automatic assignment to appropriate departments
- **Status Tracking**: Real-time progress updates (New, In Progress, Resolved)
- **Assignment Management**: Staff assignment and internal commenting

#### Comprehensive Accounting and Reporting Module
- **Financial Tracking**: Income and expense recording with categorization
- **Inventory Management**: Asset tracking with status monitoring
- **Automated Reports**: Weekly activity, financial, and inventory reports
- **Real-Time Dashboard**: Live metrics and key performance indicators

### User Roles
- **Administrators**: Full system access and management capabilities
- **Teachers**: Class management, attendance, and grading tools
- **Students**: Personal academic dashboard and progress tracking
- **Parents**: Child progress monitoring and school communication

## 🎨 UI/UX Design

### Sophisticated Dark Mode Theme
- **Oxblood (Deep Burgundy)**: Primary accent color for key interactive elements
- **Deep Blue/Navy**: Main background for panels and overall canvas
- **Gradient Effects**: Strategic Oxblood-to-Deep-Blue gradients for premium visual elements
- **Motion Effects**: Smooth transitions, 3D pop hover effects, and notification animations

### Component Library
- **Cards**: Interactive resource and dashboard cards with hover effects
- **Buttons**: Primary, secondary, and gradient "Ask AI" buttons
- **Navigation**: Vertical gradient side navigation with active states
- **Forms**: Styled inputs with focus states and validation

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js (v16+)
- Python (v3.8+)
- Git
- OpenSSL (for password generation)

### Installation

#### Option 1: Automated Installation (Recommended)

**Windows:**
```cmd
scripts\install.bat
```

**Linux/macOS:**
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

#### Option 2: Manual Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-org/innovative-school-platform.git
cd innovative-school-platform
```

2. **Configure environment:**
```bash
cp env.example .env
cp frontend/env.example frontend/.env
cp backend/env.example backend/.env
# Edit the .env files with your configuration
```

3. **Start services:**
```bash
docker-compose up -d
```

4. **Initialize database:**
```bash
docker-compose exec backend alembic upgrade head
```

5. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- AI Service: http://localhost:8001
- API Documentation: http://localhost:8000/docs
- AI Documentation: http://localhost:8001/docs

### Default Credentials
- **Admin Email**: admin@school.cm
- **Admin Password**: admin123

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION_GUIDE.md) - Detailed installation instructions
- [Testing Guide](docs/MVP_TESTING_GUIDE.md) - Comprehensive testing procedures
- [Backup & Recovery](docs/BACKUP_AND_RECOVERY.md) - Data backup and recovery strategies
- [API Documentation](http://localhost:8000/docs) - Interactive API documentation
- [UI/UX Design Specification](UI_UX_DESIGN_SPECIFICATION.md) - Design system guidelines
- [New Features Implementation](FEATURES_IMPLEMENTATION_SUMMARY.md) - Technical implementation details
- [New Features Usage Guide](NEW_FEATURES_USAGE_GUIDE.md) - API usage instructions
- [Vercel Deployment Guide](frontend/VERCEL_DEPLOYMENT.md) - Deploy frontend to Vercel

## 🏗️ Architecture

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with PostGIS
- **Cache**: Redis
- **Authentication**: JWT tokens
- **API**: RESTful APIs with OpenAPI documentation
- **Microservices**: Dedicated Pedagogic AI service

### Frontend
- **Framework**: React with TypeScript
- **UI Library**: Material-UI with custom dark theme
- **State Management**: React Context
- **Internationalization**: i18next
- **Maps**: Google Maps API

### AI Service
- **Framework**: FastAPI (Python)
- **API**: RESTful endpoints for pedagogic queries
- **Security**: JWT authentication
- **Privacy**: Opt-in conversation saving

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **Monitoring**: Built-in health checks and performance monitoring
- **Backup**: Automated backup system with retention policies

## 🧪 Testing

### Run All Tests
```bash
# Windows
scripts\run_tests.bat

# Linux/macOS
./scripts/run_tests.sh
```

### Test Categories
- **Unit Tests**: Backend (pytest) and Frontend (Jest)
- **Integration Tests**: API and database integration
- **End-to-End Tests**: Cypress automated testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Authentication and authorization
- **New Feature Tests**: Tests for all newly implemented features

## 🔧 Development

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### AI Service Development
```bash
cd ai_services/pedagogic_ai
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

## 🚀 Production Deployment

### Using Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Configure production environment variables
2. Set up SSL certificates
3. Configure Nginx reverse proxy
4. Set up database backups
5. Configure monitoring and logging

## ☁️ Vercel Deployment (Frontend Only)

For deploying only the frontend to Vercel while keeping the backend on your own server:

### Prerequisites
1. A Vercel account (free at [vercel.com](https://vercel.com))
2. Backend API deployed and accessible via HTTPS
3. Custom domain (optional but recommended)

### Quick Deployment
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to frontend directory and deploy:
   ```bash
   cd frontend
   vercel
   ```

For detailed instructions, see [Vercel Deployment Guide](frontend/VERCEL_DEPLOYMENT.md).

## 🖥️ Local PC Deployment

### Prerequisites
- Windows 10/11 with WSL2 or native Linux/macOS
- At least 8GB RAM recommended
- 20GB free disk space

### Deployment Steps

1. **Install Dependencies**
```bash
# Windows with WSL2 (Ubuntu)
wsl --install
# Restart computer
# Install Docker Desktop for Windows
# Enable WSL2 integration in Docker settings

# Linux/macOS
# Install Docker and Docker Compose
```

2. **Clone and Configure**
```bash
git clone https://github.com/your-org/innovative-school-platform.git
cd innovative-school-platform
./scripts/install.sh --production
```

3. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- AI Service: http://localhost:8001

## 📱 Mobile Application Development

### Approach
The platform is designed with a mobile-first responsive design and can be accessed via mobile browsers. For native mobile applications, we recommend using React Native to leverage existing React components and APIs.

### Mobile App Features
- **Cross-Platform**: Single codebase for iOS and Android
- **Offline Support**: Local caching for offline access
- **Push Notifications**: Real-time alerts for messages and updates
- **Camera Integration**: Photo uploads for attendance and resources
- **Biometric Authentication**: Fingerprint/Face ID login

### Development Setup

1. **Install React Native CLI**
```bash
npm install -g react-native-cli
# Or use Expo CLI for easier setup
npm install -g expo-cli
```

2. **Create Mobile Project**
```bash
# Using React Native CLI
npx react-native init InnovativeSchoolMobile
cd InnovativeSchoolMobile

# Or using Expo
expo init innovative-school-mobile
cd innovative-school-mobile
```

3. **Integrate with Existing APIs**
```bash
# Install required dependencies
npm install @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/stack
npm install axios
```

4. **Key Mobile Components**
- Login/Authentication screens
- Dashboard with role-specific views
- Resource browsing and downloading
- Messaging interface
- AI assistant chat
- Inquiry submission
- Offline data synchronization

5. **Build and Test**
```bash
# For iOS (requires macOS with Xcode)
npx react-native run-ios

# For Android
npx react-native run-android

# Using Expo
expo start
```

### Mobile App Architecture
- **State Management**: Redux or Context API
- **Navigation**: React Navigation
- **Data Persistence**: AsyncStorage or SQLite
- **Networking**: Axios with JWT authentication
- **UI Components**: React Native Paper or Native Base

## 📊 Performance

### Caching
- Redis-based caching for frequently accessed data
- Database query optimization
- Connection pooling
- Performance monitoring and analytics

### Scalability
- Horizontal scaling with load balancers
- Database read replicas
- CDN for static assets
- Microservices architecture for AI features

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Session management

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### Infrastructure Security
- HTTPS/SSL encryption
- Secure headers
- Environment variable protection
- Regular security updates

## 🌍 Internationalization

### Supported Languages
- **English**: Primary language
- **French**: Secondary language
- **Cameroonian Languages**: Local language support

### Features
- Dynamic language switching
- Localized date and time formats
- Currency and number formatting
- Right-to-left language support

## 📱 Mobile Support

- Responsive design for mobile devices
- Progressive Web App (PWA) capabilities
- Mobile-optimized interfaces
- Touch-friendly navigation
- Native mobile app development ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation
- Ensure all tests pass
- Follow security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check the `/docs` directory
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact support at support@innovativeschool.cm

### Community
- Join our community discussions
- Contribute to the project
- Share feedback and suggestions
- Help improve documentation

## 🗺️ Roadmap

### Phase 1 (Current - MVP)
- ✅ Core school management features
- ✅ User authentication and authorization
- ✅ Multilingual support
- ✅ Basic AI integration
- ✅ Mobile-responsive design
- ✅ Teacher Resource Hub
- ✅ In-App Messaging System
- ✅ Pedagogic AI Assistant
- ✅ School Inquiry Management
- ✅ Accounting and Reporting Module

### Phase 2 (Future)
- 🔄 Advanced AI features
- 🔄 Native mobile applications (iOS/Android)
- 🔄 Advanced analytics
- 🔄 Third-party integrations
- 🔄 Advanced reporting

### Phase 3 (Long-term)
- 🔄 Machine learning integration
- 🔄 Advanced personalization
- 🔄 IoT device integration
- 🔄 Blockchain features
- 🔄 Advanced security features

## 🙏 Acknowledgments

- **FastAPI** for the excellent Python web framework
- **React** for the powerful frontend library
- **Material-UI** for the beautiful component library
- **PostgreSQL** for the robust database system
- **Docker** for containerization
- **Open Source Community** for the amazing tools and libraries

## 📞 Contact

- **Project Maintainer**: Innovative School Platform Team
- **Email**: contact@innovativeschool.cm
- **Website**: https://innovativeschool.cm
- **GitHub**: https://github.com/your-org/innovative-school-platform

---

**Made with ❤️ for Cameroonian Schools**

*Empowering education through technology*