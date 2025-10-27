import React, { useState } from 'react';
import DayView from './DayView';
import './WeekView.css';
import { MdTrendingUp } from 'react-icons/md';

function WeekView({ weekData, progressiveSettings, onOpenSettings }) {
  const [selectedDay, setSelectedDay] = useState(0);

  if (!weekData || !weekData.days || weekData.days.length === 0) {
    return <div className="week-view">No workout data available for this week.</div>;
  }

  const handleOverloadToggle = (e) => {
    e.stopPropagation();
    if (onOpenSettings) {
      onOpenSettings();
    }
  };

  return (
    <div className="week-view">
      <div className="day-tabs">
        {weekData.days.map((day, index) => (
          <button
            key={index}
            className={`day-tab ${selectedDay === index ? 'active' : ''}`}
            onClick={() => setSelectedDay(index)}
          >
            {day.day}
          </button>
        ))}
      </div>

      <DayView 
        dayData={weekData.days[selectedDay]} 
        progressiveSettings={progressiveSettings}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
}

export default WeekView;
