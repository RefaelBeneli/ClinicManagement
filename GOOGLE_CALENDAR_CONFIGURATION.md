# Google Calendar Integration Configuration

## Current Status: DISABLED

The Google Calendar integration is currently **disabled** by default. This means:
- No Google OAuth credentials are required
- Calendar endpoints return empty responses
- No Google Calendar events are fetched
- No conflict detection with Google Calendar

## How to Enable Google Calendar Integration

### Option 1: Environment Variable (Recommended)

Add this environment variable to your backend:

```bash
GOOGLE_CALENDAR_ENABLED=true
```

**For IntelliJ VM Options:**
```
-DGOOGLE_CALENDAR_ENABLED=true
```

**For Railway/Production:**
```
GOOGLE_CALENDAR_ENABLED=true
```

### Option 2: Application Properties

Add to `src/main/resources/application.yml`:
```yaml
google:
  oauth:
    enabled: true
```

### Option 3: Command Line

```bash
java -Dgoogle.oauth.enabled=true -jar your-app.jar
```

## Required Configuration When Enabled

When you enable Google Calendar integration, you'll also need:

### 1. Google OAuth Credentials
```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://your-domain.com/calendar/callback
```

### 2. Frontend UI Components
Re-enable the Google Calendar integration UI by:
1. Uncommenting the import in `Dashboard.tsx`
2. Adding back the Google Calendar button
3. Re-adding the modal component

## How to Disable Google Calendar Integration

### Option 1: Environment Variable
```bash
GOOGLE_CALENDAR_ENABLED=false
```

### Option 2: Remove Environment Variable
Simply remove the `GOOGLE_CALENDAR_ENABLED` variable (defaults to false)

### Option 3: Application Properties
```yaml
google:
  oauth:
    enabled: false
```

## Backend Behavior

### When DISABLED (Current State):
- ✅ **No Google OAuth credentials required**
- ✅ **Calendar endpoints return empty lists**
- ✅ **No errors about missing credentials**
- ✅ **Application starts normally**
- ❌ **No Google Calendar integration**
- ❌ **No conflict detection**

### When ENABLED:
- ✅ **Full Google Calendar integration**
- ✅ **OAuth flow works**
- ✅ **Conflict detection active**
- ✅ **Calendar events synced**
- ❌ **Requires Google OAuth credentials**
- ❌ **Requires Google Cloud setup**

## API Endpoints Behavior

### When DISABLED:
- `GET /api/calendar/auth-url` → Returns "Google Calendar integration is disabled"
- `POST /api/calendar/oauth/callback` → Returns "Google Calendar integration is disabled"
- `GET /api/calendar/events` → Returns empty list `[]`
- `GET /api/calendar/conflicts` → Returns empty list `[]`
- `GET /api/calendar/calendars` → Returns empty list `[]`

### When ENABLED:
- All endpoints work normally with Google Calendar integration

## Testing the Configuration

### Check if Enabled:
```bash
# The application will log the status on startup
# Look for: "Google Calendar integration: enabled/disabled"
```

### Test Endpoint:
```bash
curl http://localhost:8085/api/calendar/events?startDate=2024-01-01&endDate=2024-01-31
```

**When Disabled:** Returns `[]`
**When Enabled:** Returns Google Calendar events or error if not configured

## Troubleshooting

### "Google Calendar integration is disabled"
- This is expected when the feature is disabled
- To enable, set `GOOGLE_CALENDAR_ENABLED=true`

### "Google OAuth credentials not configured"
- Feature is enabled but credentials are missing
- Add Google OAuth credentials or disable the feature

### Application won't start
- Check that the environment variable is set correctly
- Valid values: `true`, `false`, or not set (defaults to false)

## Quick Enable/Disable Commands

### Enable:
```bash
export GOOGLE_CALENDAR_ENABLED=true
```

### Disable:
```bash
export GOOGLE_CALENDAR_ENABLED=false
# or
unset GOOGLE_CALENDAR_ENABLED
```

## Frontend Integration

When you want to re-enable the frontend UI:

1. **Uncomment imports** in `Dashboard.tsx`:
```typescript
import GoogleCalendarIntegration from './GoogleCalendarIntegration';
```

2. **Add back the button**:
```typescript
<button className="action-button" onClick={handleCalendarIntegration}>
  🔗 Google Calendar
</button>
```

3. **Re-add the modal**:
```typescript
{showCalendarIntegration && (
  <GoogleCalendarIntegration />
)}
```

The backend is ready to work with the frontend once you enable the feature flag! 