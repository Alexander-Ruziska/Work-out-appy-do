import React from 'react';
import './WeekNavigation.css';

function WeekNavigation({ currentWeek, totalWeeks, onPrevious, onNext, canGoPrevious, canGoNext }) {
  return (
    <div className="week-navigation-container">
      <div className="week-navigation">
        <button 
          className="nav-button" 
          onClick={onPrevious} 
          disabled={!canGoPrevious}
          aria-label="Previous week"
        >
          ← Previous
        </button>
        
        <div className="week-indicator">
          <h2>Week {currentWeek} of {totalWeeks}</h2>
          <div className="week-dots">
            {[...Array(totalWeeks)].map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index + 1 === currentWeek ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
        
        <button 
          className="nav-button" 
          onClick={onNext} 
          disabled={!canGoNext}
          aria-label="Next week"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default WeekNavigation;
