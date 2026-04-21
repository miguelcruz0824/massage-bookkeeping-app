import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import Login from '@/components/Login';
import { AppProvider } from '@/contexts/AppContext';
import { Leaf, Loader2 } from 'lucide-react';

const Index: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a3028] to-[#2d4a3e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-300 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Leaf className="w-8 h-8 text-[#1a3028]" />
          </div>
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Not logged in — show login page
  if (!session) {
    return <Login />;
  }

  // Logged in — show app
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default Index;