# Innovative School Platform - Frontend

A modern React-based frontend for the Innovative School Platform, built with TypeScript, Material-UI, and comprehensive internationalization support.

## Features

- **Modern React Architecture**: Built with React 18, TypeScript, and modern hooks
- **Material-UI Design**: Beautiful, responsive UI components
- **Internationalization**: Support for English, French, and Cameroonian languages
- **Role-Based Dashboards**: Customized interfaces for Admin, Teacher, Student, and Parent roles
- **Authentication**: Secure JWT-based authentication with context management
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Type Safety**: Full TypeScript support for better development experience

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **i18next** - Internationalization
- **Date-fns** - Date utilities

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:8000

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to http://localhost:3000

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
├── i18n/               # Internationalization files
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

## Features Overview

### Authentication
- Login/Register forms with validation
- JWT token management
- Automatic token refresh
- Protected routes based on user roles

### Role-Based Dashboards

#### Admin Dashboard
- User management (Students, Teachers, Parents)
- Class and subject management
- System statistics and overview
- Quick actions for common tasks

#### Teacher Dashboard
- Class management
- Student roster
- Attendance marking
- Grade management
- Teaching schedule

#### Student Dashboard
- Academic progress overview
- Class enrollment status
- Attendance records
- Grade history
- Assignment tracking

#### Parent Dashboard
- Children's academic progress
- Attendance monitoring
- Grade tracking
- Communication with school
- Progress reports

### Internationalization
- English (default)
- French
- Support for Cameroonian languages (extensible)
- Dynamic language switching
- Localized date/time formats

## API Integration

The frontend communicates with the backend API through:

- **Authentication Service**: Login, register, profile management
- **Student Service**: Student data management
- **Teacher Service**: Teacher data and class management
- **Class Service**: Class enrollment and management
- **Attendance Service**: Attendance tracking and reporting
- **Grade Service**: Grade management and reporting

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
```

## Development

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route to `App.tsx`
3. Update navigation if needed
4. Add translations to `src/i18n/index.ts`

### Adding New Components

1. Create component in `src/components/`
2. Export from appropriate index file
3. Add TypeScript types if needed
4. Include in storybook if applicable

### Styling Guidelines

- Use Material-UI components when possible
- Follow Material Design principles
- Use the theme system for consistent styling
- Implement responsive design patterns
- Use CSS-in-JS with emotion

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Testing

```bash
npm test
```

Runs the test suite with Jest and React Testing Library.

## Contributing

1. Follow TypeScript best practices
2. Use meaningful component and variable names
3. Add proper error handling
4. Include loading states
5. Write tests for new features
6. Update documentation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with React.lazy()
- Optimized bundle size
- Lazy loading of routes
- Efficient re-rendering with React.memo()
- Image optimization

## Security

- JWT token storage in localStorage
- Automatic token refresh
- Input validation and sanitization
- XSS protection
- CSRF protection via same-origin policy

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Ensure backend is running on port 8000
   - Check CORS settings
   - Verify API endpoints

2. **Authentication Issues**
   - Clear localStorage
   - Check token expiration
   - Verify user permissions

3. **Build Issues**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

### Debug Mode

Enable debug mode by setting:
```env
REACT_APP_DEBUG=true
```

This will show additional console logs and error details.

## Future Enhancements

- [ ] PWA support
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Advanced reporting
- [ ] Mobile app integration
- [ ] Real-time updates with WebSockets
- [ ] Advanced search and filtering
- [ ] Data visualization charts
- [ ] File upload capabilities
- [ ] Advanced form validation