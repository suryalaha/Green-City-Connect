import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';
import Card from '../ui/Card';

// SVG Icon Components for password visibility toggle
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);


const LoginScreen: React.FC = () => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = () => {
    let isValid = true;
    
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    
    // In a real app, you would validate credentials against a server
    const sampleUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      address: '123 Green St, Eco City, 12345',
    };
    login(sampleUser);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background">
      <Card className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary dark:text-dark-primary">
          Green City Connect
        </h1>
        <form onSubmit={handleLogin} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${emailError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary border-gray-300 dark:border-gray-600'}`}
              placeholder="you@example.com"
              required
              aria-invalid={!!emailError}
              aria-describedby="email-error"
            />
            {emailError && <p id="email-error" className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${passwordError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary border-gray-300 dark:border-gray-600'}`}
                placeholder="••••••••"
                required
                aria-invalid={!!passwordError}
                aria-describedby="password-error"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordError && <p id="password-error" className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-primary dark:bg-dark-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            Login
          </button>
        </form>
      </Card>
    </div>
  );
};

export default LoginScreen;