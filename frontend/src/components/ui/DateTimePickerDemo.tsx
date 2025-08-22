import React, { useState } from 'react';
import DateTimePicker from './DateTimePicker';
import './DateTimePicker.css';

const DateTimePickerDemo: React.FC = () => {
  const [selectedDateTime, setSelectedDateTime] = useState('');

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>DateTimePicker Demo</h2>
      <p>This demonstrates the custom DateTimePicker component that properly closes after selection.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Select Date & Time:
        </label>
        <DateTimePicker
          value={selectedDateTime}
          onChange={setSelectedDateTime}
          placeholder="Click to select date and time"
        />
      </div>

      {selectedDateTime && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #0ea5e9', 
          borderRadius: '8px',
          marginTop: '16px'
        }}>
          <strong>Selected:</strong> {selectedDateTime}
        </div>
      )}

      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h3>Key Features:</h3>
        <ul>
          <li>✅ Automatically closes after date/time selection</li>
          <li>✅ Closes when clicking outside</li>
          <li>✅ Closes on Escape key</li>
          <li>✅ Responsive design</li>
          <li>✅ Accessible navigation</li>
          <li>✅ Clear and Today buttons</li>
          <li>✅ Separate hour and minute selection</li>
        </ul>
      </div>
    </div>
  );
};

export default DateTimePickerDemo;

