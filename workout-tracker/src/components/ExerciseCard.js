import React, { useState } from 'react';
import './ExerciseCard.css';

function ExerciseCard({ exercise, index }) {
  const [completed, setCompleted] = useState(false);

  return (
    <div className={`exercise-card ${completed ? 'completed' : ''}`}>
      <div className="exercise-header">
        <span className="exercise-number">{index}</span>
        <h4 className="exercise-name">{exercise.name}</h4>
        <button 
          className="complete-checkbox"
          onClick={() => setCompleted(!completed)}
          aria-label="Mark as complete"
        >
          {completed && '✓'}
        </button>
      </div>
      
      <div className="exercise-details">
        <div className="detail-item">
          <span className="detail-label">Sets</span>
          <span className="detail-value">{exercise.sets || '-'}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Reps</span>
          <span className="detail-value">{exercise.reps || '-'}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Load</span>
          <span className="detail-value">{exercise.load || '-'}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">RPE</span>
          <span className="detail-value">{exercise.rpe && exercise.rpe !== 'nan' ? exercise.rpe : '-'}</span>
        </div>
      </div>
    </div>
  );
}

export default ExerciseCard;
