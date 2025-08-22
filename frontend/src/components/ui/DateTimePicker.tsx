import React, { useState, useRef, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns';
import './DateTimePicker.css';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = 'Select date and time'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value);
        if (isValid(date)) {
          setSelectedDate(date);
          setSelectedHour(date.getHours());
          setSelectedMinute(date.getMinutes());
          setCurrentMonth(date);
        }
      } catch (error) {
        console.error('Error parsing date value:', error);
      }
    }
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close picker on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleDateSelect = (day: number, month: Date) => {
    const newDate = new Date(month.getFullYear(), month.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleTimeSelect = (hour: number, minute: number) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(selectedHour, selectedMinute, 0, 0);
      
      // Format as ISO string for datetime-local input compatibility
      const isoString = finalDate.toISOString().slice(0, 16);
      onChange(isoString);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setSelectedDate(null);
    setSelectedHour(0);
    setSelectedMinute(0);
    onChange('');
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setSelectedHour(today.getHours());
    setSelectedMinute(today.getMinutes());
    setCurrentMonth(today);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add days from previous month
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevMonth = new Date(year, month - 1, 0);
      days.push({ day: prevMonth.getDate() - i, isCurrentMonth: false });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    
    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    
    return days;
  };

  const isToday = (day: number, month: Date) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === month.getMonth() && 
           today.getFullYear() === month.getFullYear();
  };

  const isSelected = (day: number, month: Date) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === month.getMonth() && 
           selectedDate.getFullYear() === month.getFullYear();
  };

  const displayValue = value ? format(new Date(value), 'dd/MM/yyyy, HH:mm') : '';

  return (
    <div className={`date-time-picker ${className}`} ref={pickerRef}>
      <div className="date-time-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onClick={handleInputClick}
          onChange={() => {}} // Read-only input
          placeholder={placeholder}
          className="date-time-input"
          disabled={disabled}
          readOnly
        />
        <button
          type="button"
          className="date-time-toggle"
          onClick={handleInputClick}
          disabled={disabled}
          aria-label="Open date picker"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="date-time-picker-dropdown">
          <div className="picker-header">
            <div className="month-navigation">
              <button
                type="button"
                className="nav-button"
                onClick={() => navigateMonth('prev')}
                aria-label="Previous month"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="month-year-display">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <button
                type="button"
                className="nav-button"
                onClick={() => navigateMonth('next')}
                aria-label="Next month"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="picker-content">
            <div className="calendar-section">
              <div className="calendar-header">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
              </div>
              <div className="calendar-grid">
                {getDaysInMonth(currentMonth).map(({ day, isCurrentMonth }, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${
                      isToday(day, currentMonth) ? 'today' : ''
                    } ${isSelected(day, currentMonth) ? 'selected' : ''}`}
                    onClick={() => isCurrentMonth && handleDateSelect(day, currentMonth)}
                    disabled={!isCurrentMonth}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="calendar-actions">
                <button type="button" className="action-button" onClick={handleClear}>
                  Clear
                </button>
                <button type="button" className="action-button" onClick={handleToday}>
                  Today
                </button>
              </div>
            </div>

            <div className="time-section">
              <div className="time-header">Time</div>
              <div className="time-selector">
                <div className="time-column">
                  <div className="time-label">Hours</div>
                  <div className="time-list">
                    {Array.from({ length: 24 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`time-option ${selectedHour === i ? 'selected' : ''}`}
                        onClick={() => handleTimeSelect(i, selectedMinute)}
                      >
                        {i.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="time-column">
                  <div className="time-label">Minutes</div>
                  <div className="time-list">
                    {Array.from({ length: 60 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`time-option ${selectedMinute === i ? 'selected' : ''}`}
                        onClick={() => handleTimeSelect(selectedHour, i)}
                      >
                        {i.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="picker-footer">
            <button
              type="button"
              className="confirm-button"
              onClick={handleConfirm}
              disabled={!selectedDate}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;

