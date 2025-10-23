import React, { useState, useEffect } from 'react';
import './App.css';
import workoutData from './workoutData.json';
import WeekView from './components/WeekView';
import WeekNavigation from './components/WeekNavigation';
import BlockSelector from './components/BlockSelector';
import EditMode from './components/EditMode';
import WorkoutManager from './components/WorkoutManager';
import DB_SERVICE from './services/dbService';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { BiListUl, BiEditAlt } from 'react-icons/bi';
import { AiOutlinePushpin } from 'react-icons/ai';

function App() {
  const [data, setData] = useState(workoutData);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkoutManager, setShowWorkoutManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const totalWeeks = data?.blocks?.[currentBlock]?.weeks?.length || 0;

  // Load the active workout from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Starting to load data...');
        const savedData = await DB_SERVICE.loadCurrentWorkout();
        console.log('Loaded saved data:', savedData);
        if (savedData) {
          setData(savedData);
        } else {
          console.log('No saved data, using initial workout data');
          // First time loading - save the initial workout
          await DB_SERVICE.saveCurrentWorkout(workoutData);
          
          // Also add it to saved workouts if not already there
          const savedWorkouts = await DB_SERVICE.loadSavedWorkouts();
          if (savedWorkouts.length === 0) {
            const initialSavedWorkout = {
              id: Date.now(),
              name: 'Original Program (Block 1 & 2)',
              data: workoutData,
              savedAt: new Date().toISOString()
            };
            await DB_SERVICE.saveWorkout(initialSavedWorkout);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        console.log('Setting loading to false');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handlePreviousWeek = () => {
    if (currentWeek > 0) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeek < totalWeeks - 1) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const handleBlockChange = (blockIndex) => {
    setCurrentBlock(blockIndex);
    setCurrentWeek(0); // Reset to first week when changing blocks
  };

  const handleSaveEdit = async (editedData) => {
    setData(editedData);
    setIsEditMode(false);
    // Save to database
    await DB_SERVICE.saveCurrentWorkout(editedData);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleLoadWorkout = async (workoutData) => {
    setData(workoutData);
    setCurrentBlock(0);
    setCurrentWeek(0);
    await DB_SERVICE.saveCurrentWorkout(workoutData);
  };

  if (isEditMode) {
    return <EditMode workoutData={data} onSave={handleSaveEdit} onCancel={handleCancelEdit} />;
  }

  if (isLoading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white',
          fontSize: '24px'
        }}>
          Loading workout data...
        </div>
      </div>
    );
  }

  if (!data || !data.blocks || data.blocks.length === 0) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white',
          fontSize: '24px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <p>No workout data found</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {showWorkoutManager && (
        <WorkoutManager 
          currentWorkout={data}
          onLoadWorkout={handleLoadWorkout}
          onClose={() => setShowWorkoutManager(false)}
        />
      )}

      <header className="App-header">
        <h1>Workout Program Tracker</h1>
        <p className="subtitle">Progressive Overload Training Program</p>
        <div className="header-buttons">
          <button className="header-btn manager-btn" onClick={() => setShowWorkoutManager(true)}>
            <BiListUl style={{ marginRight: '8px', fontSize: '18px', verticalAlign: 'middle' }} />
            Workouts
          </button>
          <button className="header-btn edit-btn" onClick={() => setIsEditMode(true)}>
            <BiEditAlt style={{ marginRight: '8px', fontSize: '18px', verticalAlign: 'middle' }} />
            Edit
          </button>
        </div>
      </header>
      
      <BlockSelector
        blocks={data.blocks}
        currentBlock={currentBlock}
        onBlockChange={handleBlockChange}
      />
      
      <WeekNavigation
        currentWeek={currentWeek + 1}
        totalWeeks={totalWeeks}
        onPrevious={handlePreviousWeek}
        onNext={handleNextWeek}
        canGoPrevious={currentWeek > 0}
        canGoNext={currentWeek < totalWeeks - 1}
      />

      <WeekView weekData={data.blocks[currentBlock].weeks[currentWeek]} />

      <footer className="App-footer">
        <div className="notes-section">
          <h3>
            <AiOutlinePushpin style={{ marginRight: '10px', verticalAlign: 'middle' }} />
            Important Notes
          </h3>
          <ul>
            <li><strong>WARM UP:</strong> All you have to do to properly warm up is a few sets at a moderate intensity while building up to your prescribed set. You don't NEED to do "activation" exercises unless you want to</li>
            <li><strong>REST DAYS:</strong> In a perfect world, have a rest day after day 3 and 5</li>
            <li><strong>REST TIMES:</strong> Rest times for all exercises are a 3 minute minimum. For strength, it doesn't matter how much longer this goes, so long as you stay warm</li>
            <li><strong>SUPERSETS:</strong> When 2 exercises are listed without a space between them, this is a superset</li>
            <li><strong>NOMENCLATURE:</strong> SA = single arm, DB = dumbbell, BB = barbell, SL = single leg</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;
