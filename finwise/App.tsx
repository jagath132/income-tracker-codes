
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';
import Auth from './components/auth/Auth';
import Dashboard from './components/dashboard/Dashboard';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Prevent auth hooks from running if supabase is not configured
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Display a configuration message if Supabase is not initialized
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background px-4">
        <div className="w-full max-w-lg p-8 space-y-4 bg-surface dark:bg-dark-surface rounded-xl shadow-lg text-center border border-border dark:border-dark-border">
          <h1 className="text-2xl font-bold text-danger">Configuration Error</h1>
          <p className="text-text-secondary dark:text-dark-text-secondary">
            Your Supabase URL and Key are not configured.
          </p>
          <p className="text-text-secondary dark:text-dark-text-secondary">
            Please add your credentials to the <code className="bg-background dark:bg-dark-background px-1 py-0.5 rounded text-primary">services/supabase.ts</code> file.
          </p>
          <p className="text-text-secondary dark:text-dark-text-secondary text-sm">The application cannot function without valid credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary dark:bg-dark-background dark:text-dark-text-primary">
      {!session ? <Auth /> : <Dashboard key={session.user.id} session={session} />}
    </div>
  );
};

export default App;
