# Security Configuration Guide

## Environment Variables Setup

This application uses environment variables to securely store sensitive information. Follow these steps to configure your environment:

### 1. Create Environment File

Copy the example environment file and configure it with your actual values:

```bash
cp .env.example .env
```

### 2. Required Environment Variables

#### Email Configuration
- `EMAIL_USER`: Gmail address for sending emails
- `EMAIL_PASS`: Gmail app password (not your regular password)

#### Database Configuration
- `MONGODB_URI`: MongoDB connection string

#### Authentication
- `STAFF_EMAILS`: Comma-separated list of authorized staff email addresses
- `APPROVAL_EMAILS`: Comma-separated list of emails for testimonial approvals

#### Firebase Configuration
Configure both backend and frontend Firebase variables with your project credentials.

#### API Configuration
- `API_BASE_URL`: Backend API URL (default: http://localhost:5000)
- `REACT_APP_API_BASE_URL`: Frontend API URL (default: http://localhost:5000)

#### Google Services
- `GOOGLE_REVIEWS_URL`: Your Google Reviews page URL
- `REACT_APP_GOOGLE_REVIEWS_URL`: Frontend Google Reviews URL

### 3. Security Best Practices

1. **Never commit .env files** - The .env file is already added to .gitignore
2. **Use strong passwords** - Generate secure app passwords for email
3. **Limit staff access** - Only add authorized email addresses to STAFF_EMAILS
4. **Regular rotation** - Periodically update API keys and passwords
5. **Environment separation** - Use different configurations for development/production

### 4. Gmail App Password Setup

1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate a new app password for "Mail"
4. Use this app password in the `EMAIL_PASS` variable

### 5. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication and Firestore
3. Get your configuration from Project Settings
4. Add the configuration to both backend and frontend environment variables

### 6. Production Deployment

For production deployment:
- Use environment-specific configuration
- Store secrets in your hosting platform's environment variables
- Update URLs to production domains
- Enable HTTPS for all endpoints

## File Security Status

✅ **Secured Files:**
- `.env` - Added to .gitignore
- `src/firebase.js` - Uses environment variables
- `routes/appointments.js` - Uses environment variables
- `routes/otp.js` - Uses environment variables
- `server.js` - Uses environment variables
- All frontend components - Use environment variables

## Environment Variables Reference

| Variable | Type | Description |
|----------|------|-------------|
| `EMAIL_USER` | Backend | Gmail address for sending emails |
| `EMAIL_PASS` | Backend | Gmail app password |
| `MONGODB_URI` | Backend | MongoDB connection string |
| `FRONTEND_URL` | Backend | Frontend application URL |
| `STAFF_EMAILS` | Backend | Authorized staff email addresses |
| `APPROVAL_EMAILS` | Backend | Testimonial approval email addresses |
| `FIREBASE_*` | Backend | Firebase configuration |
| `REACT_APP_*` | Frontend | React app configuration |
| `API_BASE_URL` | Backend | Backend API base URL |
| `GOOGLE_REVIEWS_URL` | Backend | Google Reviews page URL |

Remember: Variables prefixed with `REACT_APP_` are accessible in the frontend React application.