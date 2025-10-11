# Security Setup Instructions

## Environment Variables Setup

**IMPORTANT: Never commit `.env` files to GitHub!**

### 1. Create Your Local `.env` File
Copy `.env.example` to `.env` and update with your real values:

```bash
cp .env.example .env
```

### 2. Update Staff Email Addresses
In your `.env` file, set the authorized staff emails:

```
REACT_APP_AUTHORIZED_STAFF_EMAILS=your-staff@email.com,manager@email.com,admin@email.com
```

### 3. Security Checklist
- ✅ `.env` is in `.gitignore`
- ✅ Never share `.env` file contents
- ✅ Use different emails for dev/staging/production
- ✅ Regularly rotate sensitive credentials

### 4. Production Deployment
Set environment variables on your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Heroku: Settings → Config Vars

### 5. Staff Access Management
To add/remove staff access:
1. Update `REACT_APP_AUTHORIZED_STAFF_EMAILS` in your environment
2. Restart the application
3. Staff will receive OTP codes via email

## Current Security Features
- ✅ Email-based OTP authentication
- ✅ Authorized email list validation
- ✅ Environment variable protection
- ✅ Session-based access control