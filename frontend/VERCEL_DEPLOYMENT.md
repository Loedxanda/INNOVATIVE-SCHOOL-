# Vercel Deployment Guide

This guide explains how to deploy the Innovative School Platform frontend to Vercel.

## Prerequisites

1. A Vercel account (free at [vercel.com](https://vercel.com))
2. The backend API deployed and accessible via HTTPS
3. A custom domain (optional but recommended)

## Deployment Steps

### 1. Prepare Your Project

Before deploying to Vercel, ensure your frontend is properly configured:

1. Create a `.env.production` file in the frontend directory:
   ```env
   REACT_APP_API_URL=https://your-backend-domain.com
   REACT_APP_ENVIRONMENT=production
   REACT_APP_ENABLE_DEBUG=false
   ```

2. Update the `vercel.json` file with your backend domain:
   ```json
   {
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "https://your-backend-domain.com/api/$1"
       }
     ],
     "env": {
       "REACT_APP_API_URL": "https://your-backend-domain.com"
     }
   }
   ```

### 2. Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy the project:
   ```bash
   vercel
   ```

5. For subsequent deployments to production:
   ```bash
   vercel --prod
   ```

### 3. Deploy via Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - Framework Preset: Create React App
   - Root Directory: frontend
   - Build Command: `npm run build`
   - Output Directory: build
   - Install Command: `npm install`

6. Add environment variables in the Vercel dashboard:
   - `REACT_APP_API_URL`: Your backend API URL
   - `REACT_APP_ENVIRONMENT`: production

7. Deploy!

## Environment Variables

Set these environment variables in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | https://api.yourdomain.com |
| `REACT_APP_ENVIRONMENT` | Environment | production |
| `REACT_APP_ENABLE_DEBUG` | Debug mode | false |

## Custom Domain

To use a custom domain:

1. In the Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions
5. Vercel will automatically provision an SSL certificate

## Routing Configuration

The `vercel.json` file handles routing:

- All API requests are proxied to your backend
- All other requests serve the React app (SPA routing)

## Backend Considerations

Ensure your backend is configured to handle CORS properly:

1. Allow requests from your Vercel domain
2. Configure proper authentication headers
3. Ensure WebSocket connections work if needed

## Monitoring and Analytics

Vercel provides built-in:

- Performance monitoring
- Error tracking
- Real-time logs
- Deployment history

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify `REACT_APP_API_URL` is set correctly
   - Check CORS configuration on your backend
   - Ensure backend is accessible via HTTPS

2. **Environment Variables Not Working**
   - Make sure variables are prefixed with `REACT_APP_`
   - Check Vercel project settings
   - Redeploy after changing environment variables

3. **Routing Issues**
   - Verify `vercel.json` routing configuration
   - Check that all routes are handled by `index.html`

4. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

### Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs
3. Verify environment configuration
4. Contact Vercel support if needed

## Best Practices

1. **Security**
   - Never expose sensitive keys in client-side code
   - Use environment variables for configuration
   - Implement proper authentication

2. **Performance**
   - Optimize images and assets
   - Use code splitting
   - Enable compression

3. **Maintenance**
   - Set up automated deployments
   - Monitor performance metrics
   - Keep dependencies updated

## Scaling

Vercel automatically handles:
- Global CDN distribution
- Automatic scaling
- Serverless functions (if needed)
- Edge caching

Your application will automatically scale to handle traffic surges.