import React, { useState } from 'react';
import './StatusToggle.css';

export default function StatusToggle({ 
  status, 
  onToggle, 
  disabled = false,
  size = 'md'
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onToggle();
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = status === 'Active' || status === 'active' || status === true;

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || isLoading}
      className={`status-toggle ${isActive ? 'active' : 'inactive'} ${size} ${isLoading ? 'loading' : ''}`}
      title={`Click to toggle status (currently ${isActive ? 'Active' : 'Inactive'})`}
    >
      <span className="toggle-slider"></span>
      <span className="toggle-label">
        {isLoading ? '...' : isActive ? 'Active' : 'Inactive'}
      </span>
    </button>
  );
}
