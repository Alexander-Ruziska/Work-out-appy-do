import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import workoutData from './workoutData.json';
import useStore from './zustand/store';
import Nav from './components/Nav';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import WorkoutTracker from './components/WorkoutTracker';

function App() {
  const user = useStore((state) => state.user);
  const fetchUser = useStore((state) => state.fetchUser);
  const initAuthListener = useStore((state) => state.initAuthListener);
  const isLoading = useStore((state) => state.isLoading);

  useEffect(() => {
    fetchUser();
    initAuthListener();
  }, [fetchUser, initAuthListener]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Nav />
      <Routes>
        <Route 
          path="/" 
          element={
            user.id ? (
              <WorkoutTracker initialData={workoutData} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/login" 
          element={
            user.id ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            user.id ? (
              <Navigate to="/" replace />
            ) : (
              <RegisterPage />
            )
          } 
        />
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </>
  );
}

export default App;
