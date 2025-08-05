import React, { useState } from 'react';
import Button from '../ui/Button';
import './ClientForm.css';

interface MeetingFormData {
  clientId: number;
  meetingDate: string;
  meetingTime: string;
  duration: number;
  price: number;
  notes: string;
  isRecurring: boolean;
  recurringMonths: number;
  // Payment tracking fields
  isPaid: boolean;
  paymentDate: string;
  paymentTypeId: number;
}

interface MeetingFormErrors {
  clientId?: string;
  meetingDate?: string;
  meetingTime?: string;
  duration?: string;
  price?: string;
  notes?: string;
  isRecurring?: string;
  recurringMonths?: string;
  paymentDate?: string;
  paymentTypeId?: string;
}

interface Client {
  id: number;
  fullName: string;
}

interface PaymentType {
  id: number;
  name: string;
  isActive: boolean;
}

interface MeetingFormProps {
  clients: Client[];
  paymentTypes: PaymentType[];
  onSubmit: (data: MeetingFormData) => Promise<void>;
  onCancel: () => void;
}

const MeetingForm: React.FC<MeetingFormProps> = ({ clients, paymentTypes, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<MeetingFormData>({
    clientId: 0,
    meetingDate: '',
    meetingTime: '',
    duration: 60,
    price: 0,
    notes: '',
    isRecurring: false,
    recurringMonths: 3,
    // Payment tracking fields
    isPaid: false,
    paymentDate: '',
    paymentTypeId: 0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<MeetingFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => {
      if (name === 'duration' || name === 'price') {
        return {
          ...prev,
          [name]: parseFloat(value) || 0
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });

    // Clear error when user starts typing
    if (errors[name as keyof MeetingFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: MeetingFormErrors = {};

    if (!formData.clientId || formData.clientId === 0) {
      newErrors.clientId = 'Please select a client';
    }

    if (!formData.meetingDate) {
      newErrors.meetingDate = 'Meeting date is required';
    }

    if (!formData.meetingTime) {
      newErrors.meetingTime = 'Meeting time is required';
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.isRecurring && (formData.recurringMonths < 1 || formData.recurringMonths > 24)) {
      newErrors.recurringMonths = 'Duration must be between 1 and 24 months';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="client-form">
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="clientId" className="form-label">
            Client *
          </label>
          <select
            id="clientId"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            className={`form-input ${errors.clientId ? 'error' : ''}`}
            required
          >
            <option value="0">Select a client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.fullName}
              </option>
            ))}
          </select>
          {errors.clientId && <span className="error-message">{errors.clientId}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="meetingDate" className="form-label">
            Date *
          </label>
          <input
            type="date"
            id="meetingDate"
            name="meetingDate"
            value={formData.meetingDate}
            onChange={handleChange}
            className={`form-input ${errors.meetingDate ? 'error' : ''}`}
            min={today}
            required
          />
          {errors.meetingDate && <span className="error-message">{errors.meetingDate}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="meetingTime" className="form-label">
            Time *
          </label>
          <input
            type="time"
            id="meetingTime"
            name="meetingTime"
            value={formData.meetingTime}
            onChange={handleChange}
            className={`form-input ${errors.meetingTime ? 'error' : ''}`}
            required
          />
          {errors.meetingTime && <span className="error-message">{errors.meetingTime}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="duration" className="form-label">
            Duration (minutes) *
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className={`form-input ${errors.duration ? 'error' : ''}`}
            min="15"
            max="480"
            step="15"
            required
          />
          {errors.duration && <span className="error-message">{errors.duration}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="price" className="form-label">
            Price (ILS) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`form-input ${errors.price ? 'error' : ''}`}
            min="0"
            step="0.01"
            required
          />
          {errors.price && <span className="error-message">{errors.price}</span>}
        </div>

        {/* Payment Tracking Section */}
        <div className="form-field form-field--full">
          <div className="payment-section">
            <h4 className="section-title">Payment Information</h4>
            
            <div className="payment-row">
              <div className="form-field">
                <label className="form-label">
                  <input
                    type="checkbox"
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        isPaid: e.target.checked,
                        paymentDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                      }));
                    }}
                    className="form-checkbox"
                  />
                  <span>Mark as paid</span>
                </label>
              </div>
              
              {formData.isPaid && (
                <>
                  <div className="form-field">
                    <label htmlFor="paymentDate" className="form-label">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      id="paymentDate"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleChange}
                      className={`form-input ${errors.paymentDate ? 'error' : ''}`}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {errors.paymentDate && <span className="error-message">{errors.paymentDate}</span>}
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="paymentTypeId" className="form-label">
                      Payment Method
                    </label>
                    <select
                      id="paymentTypeId"
                      name="paymentTypeId"
                      value={formData.paymentTypeId}
                      onChange={handleChange}
                      className={`form-input ${errors.paymentTypeId ? 'error' : ''}`}
                    >
                      <option value="0">Select payment method</option>
                      {paymentTypes.map(paymentType => (
                        <option key={paymentType.id} value={paymentType.id}>
                          {paymentType.name}
                        </option>
                      ))}
                    </select>
                    {errors.paymentTypeId && <span className="error-message">{errors.paymentTypeId}</span>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="notes" className="form-label">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Any notes about this session..."
            rows={4}
          />
        </div>

        {/* Recurring Meeting Options */}
        <div className="form-field form-field--full">
          <div className="recurring-section">
            <label className="form-label">
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    isRecurring: e.target.checked
                  }));
                }}
                className="form-checkbox"
              />
              <span>Make this a recurring weekly session</span>
            </label>
            
            {formData.isRecurring && (
              <div className="recurring-options">
                <div className="form-field">
                  <label htmlFor="recurringMonths" className="form-label">
                    Duration (months)
                  </label>
                  <input
                    type="number"
                    id="recurringMonths"
                    name="recurringMonths"
                    value={formData.recurringMonths}
                    onChange={handleChange}
                    className="form-input"
                    min="1"
                    max="24"
                    required={formData.isRecurring}
                  />
                  <small className="form-help">
                    This will create weekly sessions on the same day and time for the specified number of months.
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          Schedule Session
        </Button>
      </div>
    </form>
  );
};

export default MeetingForm; 