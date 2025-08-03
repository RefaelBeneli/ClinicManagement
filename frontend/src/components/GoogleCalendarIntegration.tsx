import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { calendarIntegration } from '../services/api';
import {
  CalendarIntegration,
  CalendarIntegrationRequest,
  UpdateCalendarIntegrationRequest,
  GoogleCalendar,
  CalendarSyncStatus,
  AuthUrlResponse
} from '../types';
import './GoogleCalendarIntegration.css';

const GoogleCalendarIntegration: React.FC = () => {
  const { token } = useAuth();
  const [integration, setIntegration] = useState<CalendarIntegration | null>(null);
  const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus | null>(null);
  const [userCalendars, setUserCalendars] = useState<GoogleCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<UpdateCalendarIntegrationRequest>({
    clientSessionCalendar: '',
    personalMeetingCalendar: '',
    syncEnabled: true,
    syncClientSessions: true,
    syncPersonalMeetings: true
  });

  // Load integration data
  const loadIntegrationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [integrationData, statusData, calendarsData] = await Promise.all([
        calendarIntegration.getIntegration(),
        calendarIntegration.getSyncStatus(),
        calendarIntegration.getCalendars()
      ]);

      setIntegration(integrationData);
      setSyncStatus(statusData);
      setUserCalendars(calendarsData);

      // Initialize form data if integration exists
      if (integrationData) {
        setFormData({
          clientSessionCalendar: integrationData.clientSessionCalendar || '',
          personalMeetingCalendar: integrationData.personalMeetingCalendar || '',
          syncEnabled: integrationData.syncEnabled,
          syncClientSessions: integrationData.syncClientSessions,
          syncPersonalMeetings: integrationData.syncPersonalMeetings
        });
      }
    } catch (error: any) {
      console.error('Error loading integration data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load calendar integration data';
      setError(`Failed to load calendar integration data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntegrationData();
  }, [loadIntegrationData]);

  // Handle Google Calendar connection
  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);
      setSuccess(null);

      const authUrlResponse: AuthUrlResponse = await calendarIntegration.getAuthUrl();
      
      // Store state for OAuth callback
      sessionStorage.setItem('google_oauth_state', authUrlResponse.state);
      
      // Redirect to Google OAuth
      window.location.href = authUrlResponse.authUrl;
    } catch (error: any) {
      console.error('Error initiating Google Calendar connection:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate Google Calendar connection';
      setError(`Failed to initiate Google Calendar connection: ${errorMessage}`);
    } finally {
      setConnecting(false);
    }
  };

  // Handle OAuth callback (called when user returns from Google)
  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = sessionStorage.getItem('google_oauth_state');

    if (code && state && state === storedState) {
      try {
        setConnecting(true);
        setError(null);

        const newIntegration = await calendarIntegration.handleOAuthCallback({
          code,
          state
        });

        setIntegration(newIntegration);
        setSuccess('Google Calendar connected successfully!');
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        sessionStorage.removeItem('google_oauth_state');
        
        // Reload data
        await loadIntegrationData();
      } catch (error: any) {
        console.error('Error handling OAuth callback:', error);
        setError('Failed to complete Google Calendar connection');
      } finally {
        setConnecting(false);
      }
    }
  };

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Update integration settings
  const handleUpdateSettings = async () => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const updatedIntegration = await calendarIntegration.updateIntegration(formData);
      setIntegration(updatedIntegration);
      setSuccess('Calendar settings updated successfully!');
    } catch (error: any) {
      console.error('Error updating calendar settings:', error);
      setError('Failed to update calendar settings');
    } finally {
      setUpdating(false);
    }
  };

  // Enable/disable sync
  const handleToggleSync = async (enabled: boolean) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      if (enabled) {
        await calendarIntegration.enableSync();
        setSuccess('Calendar sync enabled!');
      } else {
        await calendarIntegration.disableSync();
        setSuccess('Calendar sync disabled!');
      }

      await loadIntegrationData();
    } catch (error: any) {
      console.error('Error toggling sync:', error);
      setError(`Failed to ${enabled ? 'enable' : 'disable'} calendar sync`);
    } finally {
      setUpdating(false);
    }
  };

  // Disconnect Google Calendar
  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Google Calendar? This will stop all sync functionality.')) {
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      await calendarIntegration.disconnectIntegration();
      setIntegration(null);
      setSyncStatus(null);
      setSuccess('Google Calendar disconnected successfully!');
    } catch (error: any) {
      console.error('Error disconnecting Google Calendar:', error);
      setError('Failed to disconnect Google Calendar');
    } finally {
      setUpdating(false);
    }
  };

  // Check for OAuth callback on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code') && urlParams.get('state')) {
      handleOAuthCallback();
    }
  }, []);

  if (loading) {
    return (
      <div className="calendar-integration-container">
        <div className="loading-spinner">Loading calendar integration...</div>
      </div>
    );
  }

  return (
    <div className="calendar-integration-container">
      <div className="calendar-integration-header">
        <h2>📅 Google Calendar Integration</h2>
        <p>Connect your Google Calendar to automatically sync your clinic meetings and personal sessions.</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="alert alert-error">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Connection Status */}
      <div className="connection-status">
        <h3>Connection Status</h3>
        <div className="status-card">
          {integration ? (
            <div className="status-connected">
              <span className="status-icon">✅</span>
              <div className="status-details">
                <strong>Connected to Google Calendar</strong>
                <p>Last updated: {new Date(integration.updatedAt).toLocaleString()}</p>
                {syncStatus && (
                  <p>Sync: {syncStatus.syncEnabled ? 'Enabled' : 'Disabled'}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="status-disconnected">
              <span className="status-icon">❌</span>
              <div className="status-details">
                <strong>Not Connected</strong>
                <p>Connect your Google Calendar to enable automatic sync</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connection Actions */}
      {!integration ? (
        <div className="connection-actions">
          <h3>Connect Google Calendar</h3>
          <p>Click the button below to connect your Google Calendar account.</p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="btn btn-primary btn-connect"
          >
            {connecting ? 'Connecting...' : '🔗 Connect Google Calendar'}
          </button>
          
          {/* Help message for setup issues */}
          <div className="setup-help">
            <details>
              <summary>🔧 Having trouble connecting?</summary>
              <div className="help-content">
                <p>If you're seeing errors, the Google Calendar integration may not be configured on the server.</p>
                <p><strong>For administrators:</strong></p>
                <ul>
                  <li>Check the <code>GOOGLE_CALENDAR_SETUP.md</code> file for setup instructions</li>
                  <li>Ensure Google OAuth credentials are configured in environment variables</li>
                  <li>Verify the Google Calendar API is enabled in Google Cloud Console</li>
                </ul>
                <p><strong>For users:</strong></p>
                <ul>
                  <li>Contact your system administrator to configure Google Calendar integration</li>
                  <li>Check that you're using the latest version of the application</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      ) : (
        <div className="integration-settings">
          <h3>Integration Settings</h3>
          
          {/* Calendar Selection */}
          <div className="setting-group">
            <h4>Calendar Selection</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clientSessionCalendar">Client Sessions Calendar</label>
                <select
                  id="clientSessionCalendar"
                  name="clientSessionCalendar"
                  value={formData.clientSessionCalendar}
                  onChange={handleFormChange}
                >
                  <option value="">Select a calendar for client sessions</option>
                  {userCalendars.map(calendar => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.summary} {calendar.primary ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="personalMeetingCalendar">Personal Meetings Calendar</label>
                <select
                  id="personalMeetingCalendar"
                  name="personalMeetingCalendar"
                  value={formData.personalMeetingCalendar}
                  onChange={handleFormChange}
                >
                  <option value="">Select a calendar for personal meetings</option>
                  {userCalendars.map(calendar => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.summary} {calendar.primary ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sync Settings */}
          <div className="setting-group">
            <h4>Sync Settings</h4>
            <div className="form-row">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="syncEnabled"
                    checked={formData.syncEnabled}
                    onChange={handleFormChange}
                  />
                  Enable Calendar Sync
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="syncClientSessions"
                    checked={formData.syncClientSessions}
                    onChange={handleFormChange}
                  />
                  Sync Client Sessions
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="syncPersonalMeetings"
                    checked={formData.syncPersonalMeetings}
                    onChange={handleFormChange}
                  />
                  Sync Personal Meetings
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleUpdateSettings}
              disabled={updating}
              className="btn btn-primary"
            >
              {updating ? 'Updating...' : '💾 Save Settings'}
            </button>

            <button
              onClick={() => handleToggleSync(!formData.syncEnabled)}
              disabled={updating}
              className={`btn ${formData.syncEnabled ? 'btn-warning' : 'btn-success'}`}
            >
              {updating ? 'Updating...' : (formData.syncEnabled ? '⏸️ Disable Sync' : '▶️ Enable Sync')}
            </button>

            <button
              onClick={handleDisconnect}
              disabled={updating}
              className="btn btn-danger"
            >
              {updating ? 'Disconnecting...' : '🔌 Disconnect'}
            </button>
          </div>
        </div>
      )}

      {/* Sync Status Details */}
      {syncStatus && (
        <div className="sync-status-details">
          <h3>Sync Status</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Last Sync:</span>
              <span className="status-value">
                {syncStatus.lastSyncDate 
                  ? new Date(syncStatus.lastSyncDate).toLocaleString()
                  : 'Never'
                }
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Client Sessions:</span>
              <span className={`status-value ${syncStatus.clientSessionsSynced ? 'success' : 'error'}`}>
                {syncStatus.clientSessionsSynced ? '✅ Synced' : '❌ Not Synced'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Personal Meetings:</span>
              <span className={`status-value ${syncStatus.personalMeetingsSynced ? 'success' : 'error'}`}>
                {syncStatus.personalMeetingsSynced ? '✅ Synced' : '❌ Not Synced'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarIntegration; 