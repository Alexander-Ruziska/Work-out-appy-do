import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../zustand/store';
import './LoginPage.css'; // Reuse the same styles

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const register = useStore((state) => state.register);
  const errorMessage = useStore((state) => state.authErrorMessage);
  const setAuthErrorMessage = useStore((state) => state.setAuthErrorMessage);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear messages when component unmounts
    return () => {
      setAuthErrorMessage('');
      setSuccessMessage('');
    };
  }, [setAuthErrorMessage]);

  const handleRegister = async (event) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setAuthErrorMessage('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      setAuthErrorMessage('Password must be at least 6 characters long!');
      return;
    }

    if (username.length < 3) {
      setAuthErrorMessage('Username must be at least 3 characters long!');
      return;
    }

    // Check for valid username (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setAuthErrorMessage('Username can only contain letters, numbers, and underscores!');
      return;
    }

    const result = await register(username, password);
    if (result?.success) {
      setSuccessMessage(result.message);
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username (letters, numbers, _)"
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
              placeholder="Create a password (min 6 characters)"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="auth-button">
            Register
          </button>
        </form>
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        <div className="auth-footer">
          <p>Already have an account?</p>
          <button 
            onClick={() => navigate('/login')} 
            className="link-button"
          >
            Login Here
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
