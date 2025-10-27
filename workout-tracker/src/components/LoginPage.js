import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../zustand/store';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const logIn = useStore((state) => state.logIn);
  const errorMessage = useStore((state) => state.authErrorMessage);
  const setAuthErrorMessage = useStore((state) => state.setAuthErrorMessage);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the auth error message when the component unmounts
    return () => {
      setAuthErrorMessage('');
    };
  }, [setAuthErrorMessage]);

  const handleLogIn = async (event) => {
    event.preventDefault();
    const result = await logIn(username, password);
    if (result?.success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Workout Tracker</h2>
        <form onSubmit={handleLogIn} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="auth-button">
            Log In
          </button>
        </form>
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        <div className="auth-footer">
          <p>Don't have an account?</p>
          <button 
            onClick={() => navigate('/register')} 
            className="link-button"
          >
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
