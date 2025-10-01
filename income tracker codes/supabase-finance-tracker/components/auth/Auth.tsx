import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { EyeIcon, EyeSlashIcon } from '../ui/Icons';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            setMessage({type: 'error', text: error.message});
        } else {
            setMessage({type: 'success', text: 'Check your email for the confirmation link!'});
        }
    } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setMessage({type: 'error', text: error.message});
        }
    }
    setLoading(false);
  };
  
  const toggleAuthMode = () => {
      setIsSignUp(!isSignUp);
      setMessage(null);
      setEmail('');
      setPassword('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-xl shadow-lg border border-border">
        <div>
          <h1 className="text-3xl font-bold text-center text-text-primary">Finance Tracker</h1>
          <p className="mt-2 text-center text-text-secondary">
            {isSignUp ? 'Create a new account' : 'Sign in to your account'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-border bg-background placeholder-text-secondary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password"  className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-border bg-background placeholder-text-secondary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 z-20"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </div>
        </form>
        {message && (
             <div className={`text-center p-3 rounded-md ${message.type === 'error' ? 'bg-red-100 text-danger' : 'bg-green-100 text-secondary'}`}>
                {message.text}
            </div>
        )}
        <div className="text-sm text-center">
            <button onClick={toggleAuthMode} className="font-medium text-primary hover:text-indigo-500">
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;