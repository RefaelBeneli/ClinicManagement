import React, { useState, useMemo } from 'react';
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
  onPersonalMeetingClick 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showEventDetails, setShowEventDetails] = useState<CalendarEvent | null>(null);

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
    const today = startOfDay(new Date());
    return allEvents
      .filter(event => event.date >= today)
      .slice(0, 5);
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
  };

  const closeEventDetails = () => {
    setShowEventDetails(null);
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

  const getStatusColor = (status: string) => {
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
    const totalEvents = allEvents.length;
    const completedEvents = allEvents.filter(e => e.status === 'COMPLETED').length;
    const pendingEvents = allEvents.filter(e => e.status === 'SCHEDULED').length;

    return (
      <div className="calendar-stats">
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
                {dayEvents.slice(0, 6).map((event, index) => (
                  <div
                    key={event.id}
                    className={`event-dot ${event.type} ${event.status.toLowerCase()}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    title={`${event.title} - ${event.time} (${event.duration}min)`}
                  >
                    {event.type === 'session' ? 'S' : 'P'}
                  </div>
                ))}
                {dayEvents.length > 6 && (
                  <div className="event-dot more" title={`+${dayEvents.length - 6} more`}>
                    +{dayEvents.length - 6}
                  </div>
                )}
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
      <div className="event-details-overlay" onClick={closeEventDetails}>
        <div className="event-details-modal" onClick={(e) => e.stopPropagation()}>
          <div className="event-details-header">
            <h3>{event.title}</h3>
            <button onClick={closeEventDetails} className="close-event-details">×</button>
          </div>
          
          <div className="event-details-content">
            <div className="event-info-grid">
              <div className="event-info-item">
                <span className="info-label">Date:</span>
                <span className="info-value">{format(event.date, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="event-info-item">
                <span className="info-label">Time:</span>
                <span className="info-value">{event.time}</span>
              </div>
              <div className="event-info-item">
                <span className="info-label">Duration:</span>
                <span className="info-value">{event.duration} minutes</span>
              </div>
              <div className="event-info-item">
                <span className="info-label">Price:</span>
                <span className="info-value">{formatCurrency(event.price)}</span>
              </div>
              <div className="event-info-item">
                <span className="info-label">Status:</span>
                <span className="info-value status-badge" style={{ backgroundColor: statusColor }}>
                  {event.status.replace('_', ' ')}
                </span>
              </div>
              {event.clientName && (
                <div className="event-info-item">
                  <span className="info-label">Client:</span>
                  <span className="info-value">{event.clientName}</span>
                </div>
              )}
              {event.therapistName && (
                <div className="event-info-item">
                  <span className="info-label">Therapist:</span>
                  <span className="info-value">{event.therapistName}</span>
                </div>
              )}
            </div>
            
            {event.notes && (
              <div className="event-notes">
                <span className="info-label">Notes:</span>
                <p>{event.notes}</p>
              </div>
            )}
          </div>
          
          <div className="event-details-actions">
            <button 
              onClick={() => handleMeetingAction(event)}
              className="action-button primary"
            >
              {event.type === 'session' ? 'View Session' : 'View Personal Meeting'}
            </button>
            <button onClick={closeEventDetails} className="action-button secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderUpcomingEvents = () => {
    const upcoming = getUpcomingEvents();
    if (upcoming.length === 0) return null;

    return (
      <div className="upcoming-events">
        <h4>Upcoming Events</h4>
        <div className="upcoming-list">
          {upcoming.map(event => (
            <div 
              key={event.id} 
              className="upcoming-event-item"
              onClick={() => handleEventClick(event)}
            >
              <div className="event-time">{event.time}</div>
              <div className="event-title">{event.title}</div>
              <div className="event-status" style={{ backgroundColor: getStatusColor(event.status) }}>
                {event.status.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-overlay">
      <div className="calendar-container">
        {renderHeader()}
        {renderQuickStats()}
        {renderDays()}
        {renderCells()}
        
        <div className="calendar-footer">
          {renderUpcomingEvents()}
          
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
        </div>
      </div>
      
      {renderEventDetails()}
    </div>
  );
};

export default Calendar; 