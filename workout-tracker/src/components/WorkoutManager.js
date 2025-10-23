import React, { useState, useEffect } from 'react';
import './WorkoutManager.css';
import DB_SERVICE from '../services/dbService';
import { BiListUl } from 'react-icons/bi';
import { MdSave, MdClose } from 'react-icons/md';
import { IoMdAdd } from 'react-icons/io';

function WorkoutManager({ currentWorkout, onLoadWorkout, onClose }) {
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showNewWorkoutDialog, setShowNewWorkoutDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedWorkouts();
  }, []);

  const loadSavedWorkouts = async () => {
    setIsLoading(true);
    const workouts = await DB_SERVICE.loadSavedWorkouts();
    setSavedWorkouts(workouts);
    setIsLoading(false);
  };

  const saveCurrentWorkout = async () => {
    if (!newWorkoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    const workoutToSave = {
      id: Date.now(),
      name: newWorkoutName.trim(),
      data: currentWorkout,
      savedAt: new Date().toISOString()
    };

    await DB_SERVICE.saveWorkout(workoutToSave);
    await loadSavedWorkouts();
    setNewWorkoutName('');
    setShowSaveDialog(false);
    alert(`Workout "${workoutToSave.name}" saved successfully!`);
  };

  const loadWorkout = (workout) => {
    if (window.confirm(`Load workout "${workout.name}"? Your current workout will be replaced.`)) {
      onLoadWorkout(workout.data);
      onClose();
    }
  };

  const deleteWorkout = async (workoutId) => {
    const workout = savedWorkouts.find(w => w.id === workoutId);
    if (window.confirm(`Delete workout "${workout.name}"? This cannot be undone.`)) {
      await DB_SERVICE.deleteWorkout(workoutId);
      await loadSavedWorkouts();
    }
  };

  const createNewWorkout = async () => {
    if (!newWorkoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    const newWorkout = {
      blocks: [
        {
          name: 'Block 1',
          weeks: [
            {
              weekNumber: 1,
              days: [
                {
                  day: 'Day 1',
                  exercises: []
                }
              ]
            }
          ]
        }
      ]
    };

    const workoutToSave = {
      id: Date.now(),
      name: newWorkoutName.trim(),
      data: newWorkout,
      savedAt: new Date().toISOString()
    };

    await DB_SERVICE.saveWorkout(workoutToSave);
    await loadSavedWorkouts();
    setNewWorkoutName('');
    setShowNewWorkoutDialog(false);
    
    if (window.confirm(`New workout "${workoutToSave.name}" created! Load it now?`)) {
      onLoadWorkout(newWorkout);
      onClose();
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="workout-manager-overlay">
      <div className="workout-manager">
        <div className="manager-header">
          <h2>
            <BiListUl style={{ marginRight: '10px', verticalAlign: 'middle' }} />
            Workout Manager
          </h2>
          <button className="close-btn" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <div className="manager-actions">
          <button 
            className="action-btn save-btn"
            onClick={() => setShowSaveDialog(true)}
          >
            <MdSave style={{ marginRight: '8px', fontSize: '18px', verticalAlign: 'middle' }} />
            Save Current Workout
          </button>
          <button 
            className="action-btn new-btn"
            onClick={() => setShowNewWorkoutDialog(true)}
          >
            <IoMdAdd style={{ marginRight: '8px', fontSize: '18px', verticalAlign: 'middle' }} />
            Create New Workout
          </button>
        </div>

        {showSaveDialog && (
          <div className="dialog-box">
            <h3>Save Current Workout</h3>
            <input
              type="text"
              placeholder="Enter workout name..."
              value={newWorkoutName}
              onChange={(e) => setNewWorkoutName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveCurrentWorkout()}
            />
            <div className="dialog-actions">
              <button className="btn-primary" onClick={saveCurrentWorkout}>Save</button>
              <button className="btn-secondary" onClick={() => {
                setShowSaveDialog(false);
                setNewWorkoutName('');
              }}>Cancel</button>
            </div>
          </div>
        )}

        {showNewWorkoutDialog && (
          <div className="dialog-box">
            <h3>Create New Workout</h3>
            <p>This will create a blank workout template with 1 block, 1 week, and 1 day.</p>
            <input
              type="text"
              placeholder="Enter workout name..."
              value={newWorkoutName}
              onChange={(e) => setNewWorkoutName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createNewWorkout()}
            />
            <div className="dialog-actions">
              <button className="btn-primary" onClick={createNewWorkout}>Create</button>
              <button className="btn-secondary" onClick={() => {
                setShowNewWorkoutDialog(false);
                setNewWorkoutName('');
              }}>Cancel</button>
            </div>
          </div>
        )}

        <div className="saved-workouts-section">
          <h3>Saved Workouts ({savedWorkouts.length})</h3>
          {isLoading ? (
            <p className="loading-message">Loading workouts...</p>
          ) : savedWorkouts.length === 0 ? (
            <p className="no-workouts">No saved workouts yet. Save your current workout to get started!</p>
          ) : (
            <div className="workouts-list">
              {savedWorkouts.map(workout => (
                <div key={workout.id} className="workout-item">
                  <div className="workout-info">
                    <h4>{workout.name}</h4>
                    <p className="workout-meta">
                      {workout.data.blocks.length} block{workout.data.blocks.length !== 1 ? 's' : ''} • 
                      Saved {formatDate(workout.savedAt)}
                    </p>
                  </div>
                  <div className="workout-actions">
                    <button 
                      className="btn-load"
                      onClick={() => loadWorkout(workout)}
                    >
                      Load
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => deleteWorkout(workout.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkoutManager;
