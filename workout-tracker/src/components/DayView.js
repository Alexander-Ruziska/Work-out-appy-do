import React from 'react';
import ExerciseCard from './ExerciseCard';
import './DayView.css';
import { MdTrendingUp } from 'react-icons/md';

function DayView({ dayData, progressiveSettings, onOpenSettings }) {
  if (!dayData || !dayData.exercises || dayData.exercises.length === 0) {
    return <div className="day-view">No exercises for this day.</div>;
  }

  const handleOverloadToggle = (e) => {
    e.stopPropagation();
    if (onOpenSettings) {
      onOpenSettings();
    }
  };

  return (
    <div className="day-view">
      <div className="day-header">
        <button 
          className={`overload-toggle ${progressiveSettings?.isOverloadEnabled ? 'active' : ''}`}
          onClick={handleOverloadToggle}
          title={progressiveSettings?.isOverloadEnabled 
            ? `Progressive Overload: +${progressiveSettings.overloadPercentage}% every ${progressiveSettings.overloadInterval} week(s)` 
            : 'Click to enable Progressive Overload'}
        >
          <MdTrendingUp />
          <span className="toggle-text">
            Progressive Overload: {progressiveSettings?.isOverloadEnabled ? 'ON' : 'OFF'}
          </span>
        </button>
        <h3 className="day-title">{dayData.day}</h3>
      </div>
      <div className="exercises-grid">
        {dayData.exercises.map((exercise, index) => (
          <ExerciseCard key={index} exercise={exercise} index={index + 1} />
        ))}
      </div>
    </div>
  );
}

export default DayView;
