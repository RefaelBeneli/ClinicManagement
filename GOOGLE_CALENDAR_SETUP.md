# Google Calendar Integration Setup Guide

## Overview
The clinic management system includes Google Calendar integration that allows users to sync their clinic meetings and personal sessions with their Google Calendar. This requires setting up Google OAuth credentials.

## Prerequisites
- Google Cloud Console account
- Access to create OAuth 2.0 credentials

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: "Clinic Management System"
   - User support email: Your email
   - Developer contact information: Your email
   - Add scopes: `https://www.googleapis.com/auth/calendar`

4. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "Clinic Management Web Client"
   - Authorized redirect URIs:
     - For local development: `http://localhost:3000/calendar/callback`
     - For production: `https://your-domain.com/calendar/callback`
     - For Railway deployment: `https://your-app-name.up.railway.app/calendar/callback`

## Step 3: Configure Environment Variables

Add these environment variables to your backend deployment:

### For Railway Deployment:
```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://your-app-name.up.railway.app/calendar/callback
```

### For Local Development:
```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/calendar/callback
```

## Step 4: Update Frontend Configuration

If you're using a different redirect URI, update the frontend configuration in `src/main/resources/application.yml`:

```yaml
google:
  oauth:
    client-id: ${GOOGLE_CLIENT_ID:#{null}}
    client-secret: ${GOOGLE_CLIENT_SECRET:#{null}}
    redirect-uri: ${GOOGLE_REDIRECT_URI:https://your-domain.com/calendar/callback}
```

## Step 5: Test the Integration

1. Deploy the backend with the environment variables
2. Open the clinic management system
3. Go to Dashboard > Quick Actions > "📅 Google Calendar"
4. Click "🔗 Connect Google Calendar"
5. You should be redirected to Google's OAuth consent screen
6. After authorization, you should return to the app and see the integration settings

## Troubleshooting

### Common Issues:

1. **"Google OAuth credentials not configured"**
   - Ensure environment variables are set correctly
   - Check that the backend has been restarted after adding environment variables

2. **"Invalid redirect URI"**
   - Verify the redirect URI in Google Cloud Console matches your deployment URL
   - Check that the redirect URI in environment variables matches

3. **"Access denied"**
   - Ensure the Google Calendar API is enabled in your Google Cloud project
   - Check that the OAuth consent screen is properly configured

4. **Frontend not receiving response**
   - Check browser console for network errors
   - Verify the backend is running and accessible
   - Check CORS configuration if using different domains

### Environment Variable Examples:

For Railway deployment:
```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
GOOGLE_REDIRECT_URI=https://web-production-9aa8.up.railway.app/calendar/callback
```

For local development:
```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/calendar/callback
```

## Security Notes

- Never commit OAuth credentials to version control
- Use environment variables for all sensitive configuration
- Regularly rotate OAuth client secrets
- Monitor OAuth usage in Google Cloud Console
- Set appropriate OAuth consent screen restrictions

## API Scopes Used

The application requests the following Google Calendar API scopes:
- `https://www.googleapis.com/auth/calendar` - Full access to read/write calendar events

This allows the application to:
- Create calendar events for client sessions
- Create calendar events for personal meetings
- Read existing calendar events
- Update and delete calendar events
- Access multiple calendars (if user has them)