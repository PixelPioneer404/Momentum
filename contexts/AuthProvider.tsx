// providers/AuthProvider.tsx
import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useEffect, useState } from 'react';
import { getMockUserWithScenario, isDevelopmentMode } from '../lib/devConfig';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if development mode is enabled
    if (isDevelopmentMode()) {
      console.log('🚧 Development mode enabled - using mock user');
      const mockUserData = getMockUserWithScenario();
      console.log('🚧 Mock user metadata:', mockUserData.user_metadata);
      
      // Create a mock user object that matches the Supabase User type structure
      const devUser = {
        id: mockUserData.id,
        email: mockUserData.email,
        app_metadata: {},
        user_metadata: mockUserData.user_metadata,
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        phone: undefined,
        confirmation_sent_at: undefined,
        confirmed_at: new Date().toISOString(),
        recovery_sent_at: undefined,
        new_email: undefined,
        invited_at: undefined,
        action_link: undefined,
        email_change_sent_at: undefined,
        new_phone: undefined,
        phone_change_sent_at: undefined,
        phone_confirmed_at: undefined,
        email_change_confirm_status: 0,
        banned_until: undefined,
        identities: []
      } as unknown as User;
      
      // Create a mock session for development mode
      const mockSession = {
        access_token: 'dev-access-token',
        refresh_token: 'dev-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: devUser
      } as unknown as Session;
      
      setUser(devUser);
      setSession(mockSession); // Create mock session for dev mode
      setLoading(false);
      return;
    }

    // get initial session
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
      setLoading(false);
    })();

    // subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthProvider - Auth state change:', event, !!session);
      setSession(session ?? null);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
