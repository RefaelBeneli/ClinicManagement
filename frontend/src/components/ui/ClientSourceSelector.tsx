import React from 'react';
import { MeetingSource } from '../../types';
import './ClientSourceSelector.css';

interface ClientSourceSelectorProps {
  sources: MeetingSource[];
  selectedSourceId: number;
  onSourceChange: (sourceId: number) => void;
  showPricing?: boolean;
  className?: string;
  disabled?: boolean;
}

const ClientSourceSelector: React.FC<ClientSourceSelectorProps> = ({
  sources,
  selectedSourceId,
  onSourceChange,
  showPricing = true,
  className = '',
  disabled = false
}) => {
  const selectedSource = sources.find(s => s.id === selectedSourceId);

  return (
    <div className={`client-source-selector ${className}`}>
      <label className="selector-label">
                  Client Source *
      </label>
      
      <div className="source-options">
        {sources.filter(s => s.isActive).map(source => (
          <div
            key={source.id}
            className={`source-option ${selectedSourceId === source.id ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onSourceChange(source.id)}
          >
            <div className="source-header">
              <div className="source-name">{source.name}</div>
              <div className="source-duration">{source.duration}min</div>
            </div>
            
            {showPricing && (
              <div className="source-pricing">
                <div className="price-primary">
                  {source.price}₪
                </div>
                <div className="price-secondary">
                  No-show: {source.noShowPrice}₪
                </div>
              </div>
            )}
            
            {selectedSourceId === source.id && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>
      
      {selectedSource && (
        <div className="selected-source-info">
          <div className="info-item">
            <span className="info-label">Duration:</span>
            <span className="info-value">{selectedSource.duration} minutes</span>
          </div>
          <div className="info-item">
            <span className="info-label">Price:</span>
            <span className="info-value">{selectedSource.price}₪</span>
          </div>
          <div className="info-item">
            <span className="info-label">No-show fee:</span>
            <span className="info-value">{selectedSource.noShowPrice}₪</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSourceSelector; 