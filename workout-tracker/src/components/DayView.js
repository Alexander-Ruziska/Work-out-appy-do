import React from 'react';
import ExerciseCard from './ExerciseCard';
import './DayView.css';

function DayView({ dayData }) {
  if (!dayData || !dayData.exercises || dayData.exercises.length === 0) {
    return <div className="day-view">No exercises for this day.</div>;
  }

  return (
    <div className="day-view">
      <h3 className="day-title">{dayData.day}</h3>
      <div className="exercises-grid">
        {dayData.exercises.map((exercise, index) => (
          <ExerciseCard key={index} exercise={exercise} index={index + 1} />
        ))}
      </div>
    </div>
  );
}

export default DayView;
