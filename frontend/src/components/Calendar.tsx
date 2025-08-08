import React, { useState, useMemo, useEffect } from 'react';
import { Meeting, PersonalMeeting } from '../types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO,
  startOfDay,
  addWeeks,
  subWeeks,
  startOfDay as startOfDayFn,
  endOfDay as endOfDayFn
} from 'date-fns';
import './Calendar.css';

interface CalendarProps {
  meetings: Meeting[];
  personalMeetings?: PersonalMeeting[];
  onClose: () => void;
  onMeetingClick?: (meeting: Meeting) => void;
  onPersonalMeetingClick?: (meeting: PersonalMeeting) => void;
  onRefresh?: () => void; // Add refresh callback
}

interface CalendarEvent {
  id: string;
  type: 'session' | 'personal';
  title: string;
  time: string;
  duration: number;
  status: string;
  clientName?: string;
  therapistName?: string;
  price: number;
  notes?: string;
  date: Date;
  originalMeeting?: Meeting;
  originalPersonalMeeting?: PersonalMeeting;
}

const Calendar: React.FC<CalendarProps> = ({ 
  meetings, 
  personalMeetings = [], 
  onClose, 
  onMeetingClick,
  onPersonalMeetingClick,
  onRefresh
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showEventDetails, setShowEventDetails] = useState<CalendarEvent | null>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    content: string;
    x: number;
    y: number;
    event: CalendarEvent | null;
  }>({
    show: false,
    content: '',
    x: 0,
    y: 0,
    event: null
  });
  const [editForm, setEditForm] = useState<{
    time: string;
    duration: number;
    price: number;
    status: string;
    notes: string;
    clientName?: string;
    therapistName?: string;
  }>({
    time: '',
    duration: 60,
    price: 0,
    status: '',
    notes: ''
  });

  // Add ESC key functionality for event details modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      console.log('ESC key pressed, showEventDetails:', showEventDetails);
      if (event.key === 'Escape' && showEventDetails) {
        console.log('Closing modal with ESC key');
        closeEventDetails();
      }
    };

    if (showEventDetails) {
      console.log('Adding ESC key listener');
      document.addEventListener('keydown', handleEscKey);
      return () => {
        console.log('Removing ESC key listener');
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [showEventDetails]);

  // Add ESC key functionality for main calendar
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      console.log('ESC key pressed for main calendar');
      if (event.key === 'Escape') {
        console.log('Closing main calendar with ESC key');
        onClose();
      }
    };

    console.log('Adding ESC key listener for main calendar');
    document.addEventListener('keydown', handleEscKey);
    return () => {
      console.log('Removing ESC key listener for main calendar');
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Calculate date ranges based on view mode
  const getDateRange = (): {
    start: Date;
    end: Date;
    displayStart: Date;
    displayEnd: Date;
  } => {
    switch (viewMode) {
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        return {
          start: startOfWeek(monthStart),
          end: endOfWeek(monthEnd),
          displayStart: monthStart,
          displayEnd: monthEnd
        };
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return {
          start: weekStart,
          end: weekEnd,
          displayStart: weekStart,
          displayEnd: weekEnd
        };
      case 'day':
        const dayStart = startOfDayFn(currentDate);
        const dayEnd = endOfDayFn(currentDate);
        return {
          start: dayStart,
          end: dayEnd,
          displayStart: dayStart,
          displayEnd: dayEnd
        };
      default:
        // This should never happen, but TypeScript needs a return
        const defaultStart = startOfMonth(currentDate);
        const defaultEnd = endOfMonth(defaultStart);
        return {
          start: startOfWeek(defaultStart),
          end: endOfWeek(defaultEnd),
          displayStart: defaultStart,
          displayEnd: defaultEnd
        };
    }
  };

  const dateRange = getDateRange();

  // Combine and process all events
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];
    
    // Process regular meetings
    meetings.forEach(meeting => {
      events.push({
        id: `session-${meeting.id}`,
        type: 'session',
        title: `Session with ${meeting.client.fullName}`,
        time: format(parseISO(meeting.meetingDate), 'HH:mm'),
        duration: meeting.duration,
        status: meeting.status || 'SCHEDULED',
        clientName: meeting.client.fullName,
        price: meeting.price,
        notes: meeting.notes,
        date: parseISO(meeting.meetingDate),
        originalMeeting: meeting
      });
    });

    // Process personal meetings
    personalMeetings.forEach(meeting => {
      events.push({
        id: `personal-${meeting.id}`,
        type: 'personal',
        title: `Personal: ${meeting.therapistName}`,
        time: format(parseISO(meeting.meetingDate), 'HH:mm'),
        duration: meeting.duration,
        status: meeting.status || 'SCHEDULED',
        therapistName: meeting.therapistName,
        price: meeting.price,
        notes: meeting.notes,
        date: parseISO(meeting.meetingDate),
        originalPersonalMeeting: meeting
      });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [meetings, personalMeetings]);

  const getEventsForDate = (date: Date) => {
    return allEvents.filter(event => isSameDay(event.date, date));
  };

  const getTodayEvents = () => {
    return getEventsForDate(new Date());
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    const currentViewRange = getDateRange();
    
    // Get events based on current view mode - ONLY within the current view period
    let relevantEvents: CalendarEvent[] = [];
    
    switch (viewMode) {
      case 'month':
        // For month view, show events from current month only
        relevantEvents = allEvents.filter(event => 
          event.date >= currentViewRange.displayStart && 
          event.date <= currentViewRange.displayEnd &&
          event.date >= now // Only future events
        );
        break;
        
      case 'week':
        // For week view, show events from current week only
        relevantEvents = allEvents.filter(event => 
          event.date >= currentViewRange.displayStart && 
          event.date <= currentViewRange.displayEnd &&
          event.date >= now // Only future events
        );
        break;
        
      case 'day':
        // For day view, show events from current day only
        relevantEvents = allEvents.filter(event => 
          event.date >= currentViewRange.displayStart && 
          event.date <= currentViewRange.displayEnd &&
          event.date >= now // Only future events
        );
        break;
    }
    
    // Sort by date/time (closest first)
    const sortedEvents = relevantEvents.sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    });
    
    // Limit to reasonable number based on view mode
    const maxEvents = viewMode === 'day' ? 8 : viewMode === 'week' ? 12 : 15;
    return sortedEvents.slice(0, maxEvents);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(direction === 'prev' ? addDays(currentDate, -1) : addDays(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const events = getEventsForDate(date);
    if (events.length > 0) {
      setShowEventDetails(events[0]);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setShowEventDetails(event);
    // Initialize the edit form with current event data
    setEditForm({
      time: event.time,
      duration: event.duration,
      price: event.price,
      status: event.status,
      notes: event.notes || '',
      clientName: event.clientName,
      therapistName: event.therapistName
    });
  };

  const closeEventDetails = () => {
    console.log('Closing event details modal');
    setShowEventDetails(null);
    setEditForm({
      time: '',
      duration: 60,
      price: 0,
      status: '',
      notes: ''
    });
  };

  const handleEditFormChange = (field: string, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveChanges = async () => {
    if (!showEventDetails) return;

    try {
      const updatedEvent = {
        ...showEventDetails,
        time: editForm.time,
        duration: editForm.duration,
        price: editForm.price,
        status: editForm.status,
        notes: editForm.notes,
        clientName: editForm.clientName,
        therapistName: editForm.therapistName
      };

      // Update the event based on type
      if (showEventDetails.type === 'session' && showEventDetails.originalMeeting) {
        // Update session meeting
        const meetingData = {
          meetingDate: format(showEventDetails.date, "yyyy-MM-dd'T'HH:mm:ss"),
          duration: editForm.duration,
          price: editForm.price,
          status: editForm.status,
          notes: editForm.notes
        };
        
        // Call the backend API to update the meeting
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8085/api'}/meetings/${showEventDetails.originalMeeting.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(meetingData)
        });

        if (!response.ok) {
          throw new Error('Failed to update meeting');
        }

        const updatedMeeting = await response.json();
        console.log('Meeting updated successfully:', updatedMeeting);

      } else if (showEventDetails.type === 'personal' && showEventDetails.originalPersonalMeeting) {
        // Update personal meeting
        const personalMeetingData = {
          meetingDate: format(showEventDetails.date, "yyyy-MM-dd'T'HH:mm:ss"),
          duration: editForm.duration,
          price: editForm.price,
          status: editForm.status,
          notes: editForm.notes,
          therapistName: editForm.therapistName
        };
        
        // Call the backend API to update the personal meeting
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8085/api'}/personal-meetings/${showEventDetails.originalPersonalMeeting.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(personalMeetingData)
        });

        if (!response.ok) {
          throw new Error('Failed to update personal meeting');
        }

        const updatedPersonalMeeting = await response.json();
        console.log('Personal meeting updated successfully:', updatedPersonalMeeting);
      }

      // Update the local state
      setShowEventDetails(updatedEvent);
      
      // Close the modal
      closeEventDetails();
      
      // Refresh the calendar data using the callback
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      // Remove the alert and just log the error
      console.log('Update failed - please try again');
    }
  };

  const showTooltip = (event: React.MouseEvent | React.FocusEvent, calendarEvent: CalendarEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const tooltipContent = generateTooltipContent(calendarEvent);
    
    setTooltip({
      show: true,
      content: tooltipContent,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      event: calendarEvent
    });
  };

  const hideTooltip = () => {
    setTooltip({
      show: false,
      content: '',
      x: 0,
      y: 0,
      event: null
    });
  };

  const generateTooltipContent = (event: CalendarEvent): string => {
    const eventType = event.type === 'session' ? 'Session' : 'Personal Meeting';
    const clientOrTherapist = event.type === 'session' 
      ? `Client: ${event.clientName}` 
      : `Therapist: ${event.therapistName}`;
    
    return `${eventType}\n${clientOrTherapist}\nTime: ${event.time}\nDuration: ${event.duration} min\nStatus: ${event.status.replace('_', ' ')}\nPrice: ${formatCurrency(event.price)}`;
  };

  const handleMeetingAction = (event: CalendarEvent) => {
    if (event.type === 'session' && event.originalMeeting && onMeetingClick) {
      onMeetingClick(event.originalMeeting);
    } else if (event.type === 'personal' && event.originalPersonalMeeting && onPersonalMeetingClick) {
      onPersonalMeetingClick(event.originalPersonalMeeting);
    }
    closeEventDetails();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return '#3182ce';
    
    switch (status.toLowerCase()) {
      case 'completed': return '#38a169';
      case 'cancelled': return '#e53e3e';
      case 'no_show': return '#d53f8c';
      default: return '#3182ce';
    }
  };

  const renderHeader = () => {
    const getTitle = () => {
      switch (viewMode) {
        case 'month':
          return format(currentDate, 'MMMM yyyy');
        case 'week':
          const weekStart = startOfWeek(currentDate);
          const weekEnd = endOfWeek(currentDate);
          return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
        case 'day':
          return format(currentDate, 'EEEE, MMMM d, yyyy');
        default:
          return format(currentDate, 'MMMM yyyy');
      }
    };

    return (
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={() => navigateDate('prev')} className="nav-button">
            &#8249;
          </button>
          <h2 className="calendar-title">
            {getTitle()}
          </h2>
          <button onClick={() => navigateDate('next')} className="nav-button">
            &#8250;
          </button>
        </div>
        <div className="calendar-controls">
          <button onClick={goToToday} className="today-button">
            Today
          </button>
          <div className="view-mode-buttons">
            <button 
              className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
          </div>
          <button onClick={onClose} className="close-calendar">
            ✕ Close
          </button>
        </div>
      </div>
    );
  };

  const renderQuickStats = () => {
    const todayEvents = getTodayEvents();
    
    // Filter events based on current view date range
    const dateRange = getDateRange();
    const viewEvents = allEvents.filter(event => 
      event.date >= dateRange.displayStart && event.date <= dateRange.displayEnd
    );
    
    const totalEvents = viewEvents.length;
    const completedEvents = viewEvents.filter(e => e.status === 'COMPLETED').length;
    const pendingEvents = viewEvents.filter(e => e.status === 'SCHEDULED').length;

    // Get period label for display
    const getPeriodLabel = () => {
      switch (viewMode) {
        case 'month':
          return format(currentDate, 'MMMM yyyy');
        case 'week':
          return `Week of ${format(dateRange.displayStart, 'MMM d')} - ${format(dateRange.displayEnd, 'MMM d, yyyy')}`;
        case 'day':
          return format(currentDate, 'EEEE, MMM d, yyyy');
        default:
          return '';
      }
    };

    return (
      <div className="calendar-stats">
        <div className="stats-header">
          <h4>📊 Stats for {getPeriodLabel()}</h4>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{totalEvents}</div>
            <div className="stat-label">Total Events</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{completedEvents}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{pendingEvents}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{todayEvents.length}</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // For day view, only show one day header
    const headerCount = viewMode === 'day' ? 1 : 7;
    
    for (let i = 0; i < headerCount; i++) {
      days.push(
        <div className="calendar-day-header" key={i}>
          {viewMode === 'day' ? format(currentDate, 'EEEE') : dayNames[i]}
        </div>
      );
    }
    return <div className={`calendar-days-header ${viewMode === 'day' ? 'day-view' : ''}`}>{days}</div>;
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = dateRange.start;
    let formattedDate = '';

    // For day view, only show one day
    const endDay = viewMode === 'day' ? dateRange.end : dateRange.end;

    while (day <= endDay) {
      for (let i = 0; i < 7; i++) {
        if (viewMode === 'day' && i > 0) break; // Only show one column for day view
        
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayEvents = getEventsForDate(cloneDay);
        const isCurrentDay = isToday(cloneDay);
        const isSelected = selectedDate && isSameDay(cloneDay, selectedDate);
        const isInRange = viewMode === 'month' ? isSameMonth(day, dateRange.displayStart) : true;
        
        days.push(
          <div
            className={`calendar-cell ${
              !isInRange ? 'disabled' : ''
            } ${dayEvents.length > 0 ? 'has-events' : ''} ${
              isCurrentDay ? 'today' : ''
            } ${isSelected ? 'selected' : ''}`}
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div className="calendar-date-header">
              <span className="calendar-date">{formattedDate}</span>
              {isCurrentDay && <span className="today-indicator">Today</span>}
            </div>
            
            {dayEvents.length > 0 && (
              <div className="event-indicators">
                {dayEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className={`event-dot ${event.type} ${(event.status || '').toLowerCase()}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    onMouseEnter={(e) => showTooltip(e, event)}
                    onMouseLeave={hideTooltip}
                    onFocus={(e) => showTooltip(e, event)}
                    onBlur={hideTooltip}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleEventClick(event);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${event.type === 'session' ? 'Session' : 'Personal meeting'} with ${event.type === 'session' ? event.clientName : event.therapistName} at ${event.time}`}
                  >
                    {event.type === 'session' ? 'S' : 'P'}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className={`calendar-row ${viewMode === 'day' ? 'day-view' : ''}`} key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    
    return <div className={`calendar-body ${viewMode === 'day' ? 'day-view' : ''}`}>{rows}</div>;
  };

  const renderEventDetails = () => {
    if (!showEventDetails) return null;

    const event = showEventDetails;
    const statusColor = getStatusColor(event.status);

    return (
      <div className="event-details-overlay" onClick={() => {
        console.log('Overlay clicked, closing modal');
        closeEventDetails();
      }}>
        <div className="event-details-modal" onClick={(e) => {
          console.log('Modal content clicked, stopping propagation');
          e.stopPropagation();
        }}>
          <div className="event-details-header">
            <h3>{event.title}</h3>
            <div className="header-actions">
              <button onClick={closeEventDetails} className="close-event-details">×</button>
            </div>
          </div>
          
          <div className="event-details-content">
            <div className="event-info-grid">
              <div className="event-info-item">
                <span className="info-label">Date:</span>
                <span className="info-value">{format(event.date, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="event-info-item">
                <span className="info-label">Time:</span>
                <input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => handleEditFormChange('time', e.target.value)}
                  className="edit-input"
                />
              </div>
              <div className="event-info-item">
                <span className="info-label">Duration:</span>
                <input
                  type="number"
                  min="15"
                  max="300"
                  value={editForm.duration}
                  onChange={(e) => handleEditFormChange('duration', parseInt(e.target.value) || 60)}
                  className="edit-input"
                />
              </div>
              <div className="event-info-item">
                <span className="info-label">Price:</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => handleEditFormChange('price', parseFloat(e.target.value) || 0)}
                  className="edit-input"
                />
              </div>
              <div className="event-info-item">
                <span className="info-label">Status:</span>
                <select
                  value={editForm.status}
                  onChange={(e) => handleEditFormChange('status', e.target.value)}
                  className="edit-select"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>
              {event.clientName && (
                <div className="event-info-item">
                  <span className="info-label">Client:</span>
                  <input
                    type="text"
                    value={editForm.clientName || ''}
                    onChange={(e) => handleEditFormChange('clientName', e.target.value)}
                    className="edit-input"
                  />
                </div>
              )}
              {event.therapistName && (
                <div className="event-info-item">
                  <span className="info-label">Therapist:</span>
                  <input
                    type="text"
                    value={editForm.therapistName || ''}
                    onChange={(e) => handleEditFormChange('therapistName', e.target.value)}
                    className="edit-input"
                  />
                </div>
              )}
            </div>
            
            <div className="event-notes">
              <span className="info-label">Notes:</span>
              <textarea
                value={editForm.notes}
                onChange={(e) => handleEditFormChange('notes', e.target.value)}
                className="edit-textarea"
                placeholder="Add notes..."
              />
            </div>
          </div>
          
          <div className="event-details-actions">
            <button 
              onClick={saveChanges}
              className="action-button primary"
            >
              💾 Save Changes
            </button>
            <button 
              onClick={closeEventDetails}
              className="action-button secondary"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderUpcomingEvents = () => {
    const upcoming = getUpcomingEvents();
    if (upcoming.length === 0) return null;

    const getViewModeTitle = () => {
      const currentMonth = format(currentDate, 'MMMM yyyy');
      const currentWeek = `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d')}`;
      const currentDay = format(currentDate, 'EEEE, MMM d');
      
      switch (viewMode) {
        case 'month':
          return `Upcoming Events (${currentMonth})`;
        case 'week':
          return `Upcoming Events (${currentWeek})`;
        case 'day':
          return `Upcoming Events (${currentDay})`;
        default:
          return 'Upcoming Events';
      }
    };

    const formatEventDate = (date: Date) => {
      const now = new Date();
      const today = startOfDay(now);
      const tomorrow = addDays(today, 1);
      
      if (isSameDay(date, today)) {
        return 'Today';
      } else if (isSameDay(date, tomorrow)) {
        return 'Tomorrow';
      } else {
        return format(date, 'MMM d');
      }
    };

    return (
      <div className="upcoming-events">
        <h4>{getViewModeTitle()}</h4>
        <div className="upcoming-list">
          {upcoming.map(event => (
            <div 
              key={event.id} 
              className="upcoming-event-item"
              onClick={() => handleEventClick(event)}
            >
              <div className="event-date-time">
                <div className="event-date">{formatEventDate(event.date)}</div>
                <div className="event-time">{event.time}</div>
              </div>
              <div className="event-details">
                <div className="event-title">{event.title}</div>
                <div className="event-duration">{event.duration} min</div>
              </div>
              <div className="event-status" style={{ backgroundColor: getStatusColor(event.status) }}>
                {event.status.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
        {upcoming.length === 0 && (
          <div className="no-upcoming-events">
            <p>
              {viewMode === 'day' 
                ? 'No upcoming events today' 
                : viewMode === 'week' 
                ? 'No upcoming events this week' 
                : 'No upcoming events this month'
              }
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderDailyListView = () => {
    const todayEvents = getEventsForDate(currentDate);
    const sortedEvents = todayEvents.sort((a, b) => {
      return a.time.localeCompare(b.time);
    });

    return (
      <div className="daily-list-view">
        <div className="daily-list-header">
          <h3>{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
          <p>{sortedEvents.length} session{sortedEvents.length !== 1 ? 's' : ''} today</p>
        </div>
        
        {sortedEvents.length === 0 ? (
          <div className="no-events-today">
            <div className="no-events-icon">📅</div>
            <h4>No sessions today</h4>
            <p>You have a free day! Enjoy your time off.</p>
          </div>
        ) : (
          <div className="daily-events-list">
            {sortedEvents.map((event, index) => (
              <div 
                key={event.id} 
                className={`daily-event-item ${event.type} ${(event.status || '').toLowerCase()}`}
                onClick={() => handleEventClick(event)}
              >
                <div className="event-time-slot">
                  <div className="event-time">{event.time}</div>
                  <div className="event-duration">{event.duration} min</div>
                </div>
                
                <div className="event-main-info">
                  <div className="event-title">
                    {event.type === 'session' ? 'Session' : 'Personal Meeting'}
                  </div>
                  <div className="event-participant">
                    {event.type === 'session' 
                      ? `Client: ${event.clientName}` 
                      : `Therapist: ${event.therapistName}`
                    }
                  </div>
                  <div className="event-price">{formatCurrency(event.price)}</div>
                </div>
                
                <div className="event-status-section">
                  <div 
                    className="event-status-badge"
                    style={{ backgroundColor: getStatusColor(event.status) }}
                  >
                    {event.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="calendar-overlay" onClick={onClose}>
      <div className="calendar-container" onClick={(e) => e.stopPropagation()}>
        {renderHeader()}
        {renderQuickStats()}
        {viewMode === 'day' ? renderDailyListView() : (
          <>
            {renderDays()}
            {renderCells()}
          </>
        )}
        
        <div className="calendar-footer">
          {viewMode !== 'day' && renderUpcomingEvents()}
          
          {viewMode !== 'day' && (
            <div className="calendar-legend">
              <h4>Legend:</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-dot session scheduled"></span>
                  Session
                </div>
                <div className="legend-item">
                  <span className="legend-dot personal scheduled"></span>
                  Personal
                </div>
                <div className="legend-item">
                  <span className="legend-dot completed"></span>
                  Completed
                </div>
                <div className="legend-item">
                  <span className="legend-dot cancelled"></span>
                  Cancelled
                </div>
                <div className="legend-item">
                  <span className="legend-dot no_show"></span>
                  No Show
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Tooltip */}
      {tooltip.show && (
        <div 
          className="calendar-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="tooltip-content">
            {tooltip.content.split('\n').map((line, index) => (
              <div key={index} className="tooltip-line">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {renderEventDetails()}
    </div>
  );
};

export default Calendar; 