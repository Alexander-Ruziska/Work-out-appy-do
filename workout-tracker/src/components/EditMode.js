import React, { useState } from 'react';
import './EditMode.css';

function EditMode({ workoutData, onSave, onCancel }) {
  const [editedData, setEditedData] = useState(JSON.parse(JSON.stringify(workoutData)));
  const [selectedBlock, setSelectedBlock] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);

  // Add new block
  const addBlock = () => {
    const newBlock = {
      name: `Block ${editedData.blocks.length + 1}`,
      weeks: [{
        weekNumber: 1,
        days: [{
          day: 'Day 1 - Upper',
          exercises: []
        }]
      }]
    };
    setEditedData({
      ...editedData,
      blocks: [...editedData.blocks, newBlock]
    });
  };

  // Delete block
  const deleteBlock = (blockIndex) => {
    if (editedData.blocks.length === 1) {
      alert('Cannot delete the last block!');
      return;
    }
    const newBlocks = editedData.blocks.filter((_, i) => i !== blockIndex);
    setEditedData({ ...editedData, blocks: newBlocks });
    if (selectedBlock >= newBlocks.length) {
      setSelectedBlock(newBlocks.length - 1);
    }
  };

  // Update block name
  const updateBlockName = (blockIndex, name) => {
    const newBlocks = [...editedData.blocks];
    newBlocks[blockIndex].name = name;
    setEditedData({ ...editedData, blocks: newBlocks });
  };

  // Add week
  const addWeek = (blockIndex) => {
    const newBlocks = [...editedData.blocks];
    const newWeekNumber = newBlocks[blockIndex].weeks.length + 1;
    newBlocks[blockIndex].weeks.push({
      weekNumber: newWeekNumber,
      days: [{
        day: 'Day 1 - Upper',
        exercises: []
      }]
    });
    setEditedData({ ...editedData, blocks: newBlocks });
  };

  // Delete week
  const deleteWeek = (blockIndex, weekIndex) => {
    if (editedData.blocks[blockIndex].weeks.length === 1) {
      alert('Cannot delete the last week!');
      return;
    }
    const newBlocks = [...editedData.blocks];
    newBlocks[blockIndex].weeks = newBlocks[blockIndex].weeks.filter((_, i) => i !== weekIndex);
    // Renumber weeks
    newBlocks[blockIndex].weeks.forEach((week, i) => {
      week.weekNumber = i + 1;
    });
    setEditedData({ ...editedData, blocks: newBlocks });
    if (selectedWeek >= newBlocks[blockIndex].weeks.length) {
      setSelectedWeek(newBlocks[blockIndex].weeks.length - 1);
    }
  };

  // Add day
  const addDay = (blockIndex, weekIndex) => {
    const newBlocks = [...editedData.blocks];
    const dayNumber = newBlocks[blockIndex].weeks[weekIndex].days.length + 1;
    newBlocks[blockIndex].weeks[weekIndex].days.push({
      day: `Day ${dayNumber}`,
      exercises: []
    });
    setEditedData({ ...editedData, blocks: newBlocks });
  };

  // Delete day
  const deleteDay = (blockIndex, weekIndex, dayIndex) => {
    if (editedData.blocks[blockIndex].weeks[weekIndex].days.length === 1) {
      alert('Cannot delete the last day!');
      return;
    }
    const newBlocks = [...editedData.blocks];
    newBlocks[blockIndex].weeks[weekIndex].days = 
      newBlocks[blockIndex].weeks[weekIndex].days.filter((_, i) => i !== dayIndex);
    setEditedData({ ...editedData, blocks: newBlocks });
    if (selectedDay >= newBlocks[blockIndex].weeks[weekIndex].days.length) {
      setSelectedDay(newBlocks[blockIndex].weeks[weekIndex].days.length - 1);
    }
  };

  // Update day name
  const updateDayName = (blockIndex, weekIndex, dayIndex, name) => {
    const newBlocks = [...editedData.blocks];
    newBlocks[blockIndex].weeks[weekIndex].days[dayIndex].day = name;
    setEditedData({ ...editedData, blocks: newBlocks });
  };

  // Add exercise
  const addExercise = (blockIndex, weekIndex, dayIndex) => {
    const newBlocks = [...editedData.blocks];
    newBlocks[blockIndex].weeks[weekIndex].days[dayIndex].exercises.push({
      name: 'New Exercise',
      sets: '3',
      reps: '10',
      load: '',
      rpe: '7'
    });
    setEditedData({ ...editedData, blocks: newBlocks });
  };

  // Delete exercise
  const deleteExercise = (blockIndex, weekIndex, dayIndex, exerciseIndex) => {
    const newBlocks = [...editedData.blocks];
    newBlocks[blockIndex].weeks[weekIndex].days[dayIndex].exercises = 
      newBlocks[blockIndex].weeks[weekIndex].days[dayIndex].exercises.filter((_, i) => i !== exerciseIndex);
    setEditedData({ ...editedData, blocks: newBlocks });
  };

  // Update exercise
  const updateExercise = (blockIndex, weekIndex, dayIndex, exerciseIndex, field, value) => {
    const newBlocks = [...editedData.blocks];
    newBlocks[blockIndex].weeks[weekIndex].days[dayIndex].exercises[exerciseIndex][field] = value;
    setEditedData({ ...editedData, blocks: newBlocks });
  };

  const handleSave = () => {
    onSave(editedData);
  };

  const currentBlock = editedData.blocks[selectedBlock];
  const currentWeek = currentBlock?.weeks[selectedWeek];
  const currentDay = currentWeek?.days[selectedDay];

  return (
    <div className="edit-mode-overlay">
      <div className="edit-mode-container">
        <div className="edit-mode-header">
          <h2>🔧 Edit Mode</h2>
          <div className="edit-mode-actions">
            <button className="save-button" onClick={handleSave}>💾 Save Changes</button>
            <button className="cancel-button" onClick={onCancel}>✕ Cancel</button>
          </div>
        </div>

        <div className="edit-mode-content">
          {/* Blocks Section */}
          <div className="edit-section">
            <div className="section-header">
              <h3>Blocks</h3>
              <button className="add-button" onClick={addBlock}>+ Add Block</button>
            </div>
            <div className="blocks-list">
              {editedData.blocks.map((block, blockIndex) => (
                <div 
                  key={blockIndex} 
                  className={`block-item ${selectedBlock === blockIndex ? 'active' : ''}`}
                  onClick={() => setSelectedBlock(blockIndex)}
                >
                  <input
                    type="text"
                    value={block.name}
                    onChange={(e) => updateBlockName(blockIndex, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button 
                    className="delete-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBlock(blockIndex);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Weeks Section */}
          <div className="edit-section">
            <div className="section-header">
              <h3>Weeks</h3>
              <button className="add-button" onClick={() => addWeek(selectedBlock)}>+ Add Week</button>
            </div>
            <div className="weeks-list">
              {currentBlock?.weeks.map((week, weekIndex) => (
                <div 
                  key={weekIndex} 
                  className={`week-item ${selectedWeek === weekIndex ? 'active' : ''}`}
                  onClick={() => setSelectedWeek(weekIndex)}
                >
                  <span>Week {week.weekNumber}</span>
                  <button 
                    className="delete-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWeek(selectedBlock, weekIndex);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Days Section */}
          <div className="edit-section">
            <div className="section-header">
              <h3>Days</h3>
              <button className="add-button" onClick={() => addDay(selectedBlock, selectedWeek)}>+ Add Day</button>
            </div>
            <div className="days-list">
              {currentWeek?.days.map((day, dayIndex) => (
                <div 
                  key={dayIndex} 
                  className={`day-item ${selectedDay === dayIndex ? 'active' : ''}`}
                  onClick={() => setSelectedDay(dayIndex)}
                >
                  <input
                    type="text"
                    value={day.day}
                    onChange={(e) => updateDayName(selectedBlock, selectedWeek, dayIndex, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button 
                    className="delete-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDay(selectedBlock, selectedWeek, dayIndex);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exercises Section */}
          <div className="edit-section exercises-section">
            <div className="section-header">
              <h3>Exercises - {currentDay?.day}</h3>
              <button className="add-button" onClick={() => addExercise(selectedBlock, selectedWeek, selectedDay)}>
                + Add Exercise
              </button>
            </div>
            <div className="exercises-list">
              {currentDay?.exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="exercise-edit-item">
                  <div className="exercise-edit-header">
                    <span className="exercise-number">{exerciseIndex + 1}</span>
                    <button 
                      className="delete-btn-small"
                      onClick={() => deleteExercise(selectedBlock, selectedWeek, selectedDay, exerciseIndex)}
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="exercise-edit-fields">
                    <div className="field-group">
                      <label>Exercise Name</label>
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => updateExercise(selectedBlock, selectedWeek, selectedDay, exerciseIndex, 'name', e.target.value)}
                      />
                    </div>
                    <div className="field-row">
                      <div className="field-group">
                        <label>Sets</label>
                        <input
                          type="text"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(selectedBlock, selectedWeek, selectedDay, exerciseIndex, 'sets', e.target.value)}
                        />
                      </div>
                      <div className="field-group">
                        <label>Reps</label>
                        <input
                          type="text"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(selectedBlock, selectedWeek, selectedDay, exerciseIndex, 'reps', e.target.value)}
                        />
                      </div>
                      <div className="field-group">
                        <label>Load</label>
                        <input
                          type="text"
                          value={exercise.load}
                          onChange={(e) => updateExercise(selectedBlock, selectedWeek, selectedDay, exerciseIndex, 'load', e.target.value)}
                        />
                      </div>
                      <div className="field-group">
                        <label>RPE</label>
                        <input
                          type="text"
                          value={exercise.rpe}
                          onChange={(e) => updateExercise(selectedBlock, selectedWeek, selectedDay, exerciseIndex, 'rpe', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {currentDay?.exercises.length === 0 && (
                <p className="no-exercises">No exercises yet. Click "Add Exercise" to get started!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditMode;
