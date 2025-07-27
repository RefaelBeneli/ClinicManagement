import React, { useState } from 'react';
import { Meeting } from '../types';
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
  subMonths 
} from 'date-fns';
import './Calendar.css';

interface CalendarProps {
  meetings: Meeting[];
  onClose: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ meetings, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => 
      isSameDay(new Date(meeting.meetingDate), date)
    );
  };

  const renderHeader = () => {
    return (
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={previousMonth} className="nav-button">
            &#8249;
          </button>
          <h2 className="calendar-title">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={nextMonth} className="nav-button">
            &#8250;
          </button>
        </div>
        <button onClick={onClose} className="close-calendar">
          ✕ Close
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="calendar-day-header" key={i}>
          {dayNames[i]}
        </div>
      );
    }
    return <div className="calendar-days-header">{days}</div>;
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayMeetings = getMeetingsForDate(cloneDay);
        
        days.push(
          <div
            className={`calendar-cell ${
              !isSameMonth(day, monthStart) ? 'disabled' : ''
            } ${dayMeetings.length > 0 ? 'has-meetings' : ''}`}
            key={day.toString()}
          >
            <span className="calendar-date">{formattedDate}</span>
            {dayMeetings.length > 0 && (
              <div className="meeting-indicators">
                {dayMeetings.slice(0, 3).map((meeting, index) => (
                  <div
                    key={meeting.id}
                    className={`meeting-dot ${meeting.status.toLowerCase()}`}
                    title={`${meeting.client.fullName} - ${format(new Date(meeting.meetingDate), 'HH:mm')}`}
                  >
                    {meeting.client.fullName.charAt(0)}
                  </div>
                ))}
                {dayMeetings.length > 3 && (
                  <div className="meeting-dot more" title={`+${dayMeetings.length - 3} more`}>
                    +{dayMeetings.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="calendar-row" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    
    return <div className="calendar-body">{rows}</div>;
  };

  return (
    <div className="calendar-overlay">
      <div className="calendar-container">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
        
        <div className="calendar-legend">
          <h4>Legend:</h4>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-dot scheduled"></span>
              Scheduled
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
  );
};

export default Calendar; 