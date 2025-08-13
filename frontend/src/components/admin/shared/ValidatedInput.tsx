import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../../services/adminApi';
import './ValidatedInput.css';

interface ValidatedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onValidationResult?: (isValid: boolean, message: string) => void;
  className?: string;
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter name...',
  disabled = false,
  onValidationResult,
  className = ''
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const validationTimeoutRef = useRef<number | null>(null);

  // Default validation result handler
  const handleValidationResult = onValidationResult || (() => {});

  const validateName = async (name: string) => {
    if (!name.trim()) {
      setValidationMessage('');
      setShowValidationMessage(false);
      handleValidationResult(true, '');
      return;
    }

    setIsValidating(true);
    try {
      const response = await adminApi.validateUserName(name);
      const isValid = response.data.valid;
      const message = response.data.message;
      
      setValidationMessage(message);
      setShowValidationMessage(true);
      handleValidationResult(isValid, message);
      
      // Hide validation message after 3 seconds
      window.setTimeout(() => setShowValidationMessage(false), 3000);
    } catch (error) {
      console.error('Validation error:', error);
      setValidationMessage('Error validating name');
      setShowValidationMessage(true);
      handleValidationResult(false, 'Error validating name');
      
      window.setTimeout(() => setShowValidationMessage(false), 3000);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Clear previous timeout
    if (validationTimeoutRef.current) {
      window.clearTimeout(validationTimeoutRef.current);
    }
    
    // Debounce validation - wait 500ms after user stops typing
    validationTimeoutRef.current = window.setTimeout(() => {
      validateName(newValue);
    }, 500);
  };

  const handleBlur = () => {
    // Validate immediately on blur
    if (validationTimeoutRef.current) {
      window.clearTimeout(validationTimeoutRef.current);
    }
    validateName(value);
  };

  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        window.clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`validated-input-container ${className}`}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`validated-input ${validationMessage && !validationMessage.includes('valid') ? 'invalid' : ''} ${isValidating ? 'validating' : ''}`}
      />
      {isValidating && (
        <div className="validation-spinner">
          <div className="spinner"></div>
        </div>
      )}
      {showValidationMessage && validationMessage && (
        <div className={`validation-message ${validationMessage.includes('valid') ? 'valid' : 'invalid'}`}>
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default ValidatedInput;
