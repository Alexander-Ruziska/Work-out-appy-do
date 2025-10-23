import React, { useState } from 'react';
import DayView from './DayView';
import './WeekView.css';

function WeekView({ weekData }) {
  const [selectedDay, setSelectedDay] = useState(0);

  if (!weekData || !weekData.days || weekData.days.length === 0) {
    return <div className="week-view">No workout data available for this week.</div>;
  }

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

      <DayView dayData={weekData.days[selectedDay]} />
    </div>
  );
}

export default WeekView;
