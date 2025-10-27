import React, { useState } from 'react';
import './AutoFillReview.css';

function AutoFillReview({ changes, onAccept, onReject }) {
  const [selectedChanges, setSelectedChanges] = useState(
    changes.reduce((acc, change) => {
      acc[`${change.blockIdx}-${change.weekIdx}-${change.dayIdx}-${change.exerciseIdx}`] = true;
      return acc;
    }, {})
  );

  const toggleChange = (change) => {
    const key = `${change.blockIdx}-${change.weekIdx}-${change.dayIdx}-${change.exerciseIdx}`;
    setSelectedChanges(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleAll = (select) => {
    const newState = {};
    changes.forEach(change => {
      const key = `${change.blockIdx}-${change.weekIdx}-${change.dayIdx}-${change.exerciseIdx}`;
      newState[key] = select;
    });
    setSelectedChanges(newState);
  };

  const handleAccept = () => {
    const acceptedChanges = changes.filter(change => {
      const key = `${change.blockIdx}-${change.weekIdx}-${change.dayIdx}-${change.exerciseIdx}`;
      return selectedChanges[key];
    });
    onAccept(acceptedChanges);
  };

  const selectedCount = Object.values(selectedChanges).filter(Boolean).length;

  return (
    <div className="autofill-review-overlay">
      <div className="autofill-review-modal">
        <div className="review-header">
          <h2>🤖 Review Progressive Overload Auto-Fill</h2>
          <p className="review-subtitle">
            {changes.length} load{changes.length !== 1 ? 's' : ''} will be auto-calculated. 
            Review and select which ones to apply.
          </p>
        </div>

        <div className="review-actions-top">
          <button className="select-all-btn" onClick={() => toggleAll(true)}>
            ✓ Select All
          </button>
          <button className="deselect-all-btn" onClick={() => toggleAll(false)}>
            ✗ Deselect All
          </button>
          <span className="selected-count">
            {selectedCount} of {changes.length} selected
          </span>
        </div>

        <div className="review-content">
          {changes.map((change, idx) => {
            const key = `${change.blockIdx}-${change.weekIdx}-${change.dayIdx}-${change.exerciseIdx}`;
            const isSelected = selectedChanges[key];
            
            return (
              <div 
                key={idx} 
                className={`review-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleChange(change)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleChange(change)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="review-item-content">
                  <div className="review-item-header">
                    <span className="exercise-name">{change.exerciseName}</span>
                    <span className="location">
                      {change.blockName} → Week {change.weekIdx + 1} → {change.dayName}
                    </span>
                  </div>
                  <div className="review-item-change">
                    <span className="old-value">{change.oldValue || 'Empty'}</span>
                    <span className="arrow">→</span>
                    <span className="new-value">{change.newValue} lbs</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="review-footer">
          <button className="reject-btn" onClick={onReject}>
            Cancel Auto-Fill
          </button>
          <button 
            className="accept-btn" 
            onClick={handleAccept}
            disabled={selectedCount === 0}
          >
            Apply {selectedCount} Change{selectedCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AutoFillReview;
