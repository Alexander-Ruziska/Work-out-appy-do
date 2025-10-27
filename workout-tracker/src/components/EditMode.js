import React, { useState, useEffect } from 'react';
import './EditMode.css';
import AutoFillReview from './AutoFillReview';

function EditMode({ workoutData, onSave, onCancel, progressiveSettings, currentBlock: initialBlock }) {
  const [editedData, setEditedData] = useState(JSON.parse(JSON.stringify(workoutData)));
  const [selectedBlock, setSelectedBlock] = useState(initialBlock || 0);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showAutoFillReview, setShowAutoFillReview] = useState(false);
  const [autoFillChanges, setAutoFillChanges] = useState([]);
  const [hasReviewedAutoFill, setHasReviewedAutoFill] = useState(false);
  const [editingDayIndex, setEditingDayIndex] = useState(null);

  // Apply progressive overload on initial load if enabled
  useEffect(() => {
    if (progressiveSettings?.isOverloadEnabled && !hasReviewedAutoFill) {
      const originalData = JSON.parse(JSON.stringify(workoutData));
      const filledData = applyProgressiveOverload(editedData);
      
      // Calculate what changed
      const changes = detectChanges(originalData, filledData);
      
      if (changes.length > 0) {
        setAutoFillChanges(changes);
        setShowAutoFillReview(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Calculate suggested load based on progressive overload settings
  const calculateSuggestedLoad = (blockIndex, weekNumber, dayIndex, exerciseIndex) => {
    if (!progressiveSettings?.isOverloadEnabled) return null;

    const { overloadPercentage, overloadInterval, resetOnBlockChange } = progressiveSettings;
    
    // If we should reset on block change and we're not in the first block
    if (resetOnBlockChange && blockIndex > 0) {
      // Look for the same exercise in the same week/day of this block
      if (weekNumber === 0) return null; // First week of block, no suggestion
      const prevWeek = editedData.blocks[blockIndex].weeks[weekNumber - overloadInterval];
      if (!prevWeek) return null;
      
      const prevExercise = prevWeek.days[dayIndex]?.exercises[exerciseIndex];
      if (!prevExercise || !prevExercise.load) return null;
      
      const prevLoad = parseFloat(prevExercise.load);
      if (isNaN(prevLoad)) return null;
      
      return (prevLoad * (1 + overloadPercentage / 100)).toFixed(1);
    } else {
      // Look across all previous weeks in all blocks
      let weeksBack = overloadInterval;
      let currentBlockIdx = blockIndex;
      let currentWeekIdx = weekNumber - weeksBack;
      
      // Navigate backwards through blocks if needed
      while (currentWeekIdx < 0 && currentBlockIdx > 0) {
        currentBlockIdx--;
        const prevBlockWeeks = editedData.blocks[currentBlockIdx]?.weeks.length || 0;
        currentWeekIdx += prevBlockWeeks;
      }
      
      // If we went too far back, no suggestion
      if (currentWeekIdx < 0 || currentBlockIdx < 0) return null;
      
      const prevWeek = editedData.blocks[currentBlockIdx]?.weeks[currentWeekIdx];
      if (!prevWeek) return null;
      
      const prevExercise = prevWeek.days[dayIndex]?.exercises[exerciseIndex];
      if (!prevExercise || !prevExercise.load) return null;
      
      const prevLoad = parseFloat(prevExercise.load);
      if (isNaN(prevLoad)) return null;
      
      return (prevLoad * (1 + overloadPercentage / 100)).toFixed(1);
    }
  };

  // Apply progressive overload to all future weeks based on exercise names
  const applyProgressiveOverload = (data, fromBlockIndex = 0, fromWeekIndex = 0) => {
    if (!progressiveSettings?.isOverloadEnabled) return data;

    const { overloadPercentage, overloadInterval, resetOnBlockChange } = progressiveSettings;
    const newData = JSON.parse(JSON.stringify(data));

    // Build a map of exercise loads: { "Bench Press": { blockIdx: 0, weekIdx: 2, dayIdx: 0, load: 105 }, ... }
    const exerciseHistory = {};

    console.log('🔄 Starting Progressive Overload Calculation');
    console.log('Settings:', { overloadPercentage, overloadInterval, resetOnBlockChange });

    // First pass: identify Week 1 exercises with loads (these are our baseline)
    // Process each block
    newData.blocks.forEach((block, blockIdx) => {
      // Reset history if we're starting a new block and resetOnBlockChange is true
      if (resetOnBlockChange && blockIdx > 0) {
        Object.keys(exerciseHistory).forEach(key => delete exerciseHistory[key]);
      }

      block.weeks.forEach((week, weekIdx) => {
        // Determine if this is a "baseline" week (Week 1, or first week of block if reset on block change)
        const isBaselineWeek = resetOnBlockChange ? (weekIdx === 0) : (blockIdx === 0 && weekIdx === 0);

        week.days.forEach((day, dayIdx) => {
          day.exercises.forEach((exercise, exerciseIdx) => {
            const exerciseName = exercise.name?.trim().toLowerCase();
            if (!exerciseName) return;

            // Key includes both exercise name AND day index to track exercises per day
            const key = `${exerciseName}_day${dayIdx}`;
            const hasManualLoad = exercise.load && exercise.load.trim() !== '';

            console.log(`📊 Block ${blockIdx} Week ${weekIdx} Day ${dayIdx} "${exerciseName}": load="${exercise.load}", hasManualLoad=${hasManualLoad}, isBaseline=${isBaselineWeek}`);

            console.log(`📊 Block ${blockIdx} Week ${weekIdx} Day ${dayIdx} "${exerciseName}": load="${exercise.load}", hasManualLoad=${hasManualLoad}, isBaseline=${isBaselineWeek}`);

            // If this is a baseline week and has a manual load, store it as the starting point
            if (isBaselineWeek && hasManualLoad) {
              const load = parseFloat(exercise.load);
              if (!isNaN(load)) {
                console.log(`✅ Storing ${key} as baseline: ${load} lbs (week ${weekIdx})`);
                // Store the complete exercise data, not just the load
                exerciseHistory[key] = {
                  blockIdx,
                  weekIdx,
                  dayIdx,
                  load,
                  exerciseIdx,
                  baselineExercise: { ...exercise } // Store complete exercise data
                };
              }
            } else if (!isBaselineWeek && exerciseHistory[key]) {
              // This is a future week and we have a baseline - calculate progressive overload
              const history = exerciseHistory[key];
              
              // Calculate weeks between
              let weeksDiff = weekIdx - history.weekIdx;
              if (blockIdx !== history.blockIdx) {
                // Add up weeks from previous blocks
                for (let b = history.blockIdx; b < blockIdx; b++) {
                  weeksDiff += newData.blocks[b].weeks.length;
                }
                weeksDiff -= history.weekIdx;
                weeksDiff += weekIdx;
              }

              console.log(`🧮 Calculating for ${key}: weeksDiff=${weeksDiff}, interval=${overloadInterval}, history.load=${history.load}`);

              // Apply progressive overload regardless of whether there's already a load
              // (This will OVERWRITE existing loads)
              if (weeksDiff > 0 && weeksDiff % overloadInterval === 0) {
                const multiplier = Math.pow(1 + overloadPercentage / 100, weeksDiff / overloadInterval);
                const newLoad = (history.load * multiplier).toFixed(1);
                console.log(`🚀 AUTO-FILL: ${key} = ${newLoad} lbs (was ${history.load}, multiplier=${multiplier.toFixed(2)}, OVERWRITING existing: "${exercise.load}")`);
                exercise.load = newLoad;

                // Update history with this new auto-filled load
                exerciseHistory[key] = {
                  blockIdx,
                  weekIdx,
                  dayIdx,
                  load: parseFloat(newLoad),
                  exerciseIdx
                };
              } else if (weeksDiff > 0 && weeksDiff < overloadInterval) {
                // Between intervals, keep the same load
                exercise.load = history.load.toString();
              }
            }
          });
        });
      });
    });

    return newData;
  };

  // Detect what changed between original and auto-filled data
  const detectChanges = (originalData, newData) => {
    const changes = [];
    
    newData.blocks.forEach((block, blockIdx) => {
      block.weeks.forEach((week, weekIdx) => {
        week.days.forEach((day, dayIdx) => {
          day.exercises.forEach((exercise, exerciseIdx) => {
            const originalExercise = originalData.blocks[blockIdx]?.weeks[weekIdx]?.days[dayIdx]?.exercises[exerciseIdx];
            
            if (originalExercise && exercise.load && exercise.load !== originalExercise.load) {
              changes.push({
                blockIdx,
                weekIdx,
                dayIdx,
                exerciseIdx,
                blockName: block.name,
                dayName: day.day,
                exerciseName: exercise.name,
                oldValue: originalExercise.load,
                newValue: exercise.load
              });
            }
          });
        });
      });
    });
    
    return changes;
  };

  // Handle accepting auto-fill changes
  const handleAcceptAutoFill = (acceptedChanges) => {
    const newData = JSON.parse(JSON.stringify(editedData));
    
    acceptedChanges.forEach(change => {
      newData.blocks[change.blockIdx].weeks[change.weekIdx].days[change.dayIdx]
        .exercises[change.exerciseIdx].load = change.newValue;
    });
    
    setEditedData(newData);
    setShowAutoFillReview(false);
    setHasReviewedAutoFill(true);
  };

  // Handle rejecting auto-fill
  const handleRejectAutoFill = () => {
    setShowAutoFillReview(false);
    setHasReviewedAutoFill(true);
    // Keep original data without auto-fill
  };

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
    let updatedData = { ...editedData, blocks: newBlocks };
    
    // If user changed load or exercise name, recalculate progressive overload for future weeks
    if ((field === 'load' || field === 'name') && progressiveSettings?.isOverloadEnabled && hasReviewedAutoFill) {
      const beforeRecalc = JSON.parse(JSON.stringify(updatedData));
      updatedData = applyProgressiveOverload(updatedData, blockIndex, weekIndex);
      
      // Show what will change (for future weeks only, after the current one)
      const changes = detectChanges(beforeRecalc, updatedData).filter(change => {
        // Only show changes for weeks after the current one being edited
        if (change.blockIdx > blockIndex) return true;
        if (change.blockIdx === blockIndex && change.weekIdx > weekIndex) return true;
        return false;
      });
      
      if (changes.length > 0) {
        setAutoFillChanges(changes);
        setShowAutoFillReview(true);
        // Don't apply yet, wait for user confirmation
        setEditedData({ ...editedData, blocks: newBlocks }); // Only apply the immediate change
        return;
      }
    }
    
    setEditedData(updatedData);
  };

  const handleSave = () => {
    onSave(editedData);
  };

  const currentBlock = editedData.blocks[selectedBlock];
  const currentWeek = currentBlock?.weeks[selectedWeek];
  const currentDay = currentWeek?.days[selectedDay];

  return (
    <div className="edit-mode-overlay">
      {showAutoFillReview && (
        <AutoFillReview
          changes={autoFillChanges}
          onAccept={handleAcceptAutoFill}
          onReject={handleRejectAutoFill}
        />
      )}
      
      <div className="edit-mode-container">
        <div className="edit-mode-header">
          <h2>🔧 Edit Mode</h2>
          <div className="edit-mode-actions">
            <button className="save-button" onClick={handleSave}>💾 Save Changes</button>
            <button className="cancel-button" onClick={onCancel}>✕ Cancel</button>
          </div>
        </div>

        {progressiveSettings?.isOverloadEnabled && hasReviewedAutoFill && (
          <div className="progressive-notice">
            <span className="notice-icon">🤖</span>
            <strong>Progressive Overload Active:</strong> When you change loads, future weeks will be suggested for auto-calculation at +{progressiveSettings.overloadPercentage}% every {progressiveSettings.overloadInterval} week{progressiveSettings.overloadInterval > 1 ? 's' : ''}. 
            You'll review changes before they're applied.
          </div>
        )}

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
                  onClick={() => {
                    setSelectedDay(dayIndex);
                    setEditingDayIndex(null); // Stop editing when selecting
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingDayIndex(dayIndex);
                  }}
                >
                  {editingDayIndex === dayIndex ? (
                    <input
                      type="text"
                      value={day.day}
                      onChange={(e) => updateDayName(selectedBlock, selectedWeek, dayIndex, e.target.value)}
                      onBlur={() => setEditingDayIndex(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingDayIndex(null);
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="day-name">{day.day}</span>
                  )}
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
                          placeholder={calculateSuggestedLoad(selectedBlock, selectedWeek, selectedDay, exerciseIndex) ? 
                            `Suggested: ${calculateSuggestedLoad(selectedBlock, selectedWeek, selectedDay, exerciseIndex)}` : 
                            'Enter load'}
                        />
                        {!exercise.load && calculateSuggestedLoad(selectedBlock, selectedWeek, selectedDay, exerciseIndex) && (
                          <small className="load-hint">
                            💡 Progressive overload: {calculateSuggestedLoad(selectedBlock, selectedWeek, selectedDay, exerciseIndex)} lbs
                          </small>
                        )}
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
