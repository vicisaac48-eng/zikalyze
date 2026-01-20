import { useState, useEffect, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initialized.current) return;
    initialized.current = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // Update state synchronously
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // New custom password reset using edge function
  const resetPassword = async (email: string): Promise<{ 
    error: Error | null; 
    rateLimited?: boolean; 
    retryAfter?: number 
  }> => {
    try {
      const response = await supabase.functions.invoke('request-password-reset', {
        body: { email }
      });
      
      if (response.error) {
        return { error: response.error };
      }
      
      // Check for rate limit error in response data
      if (response.data?.error && response.data?.retryAfter) {
        return { 
          error: new Error(response.data.error), 
          rateLimited: true, 
          retryAfter: response.data.retryAfter 
        };
      }
      
      if (response.data?.error) {
        return { error: new Error(response.data.error) };
      }
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Verify reset token and set new password
  const verifyResetToken = async (token: string, email: string, newPassword: string) => {
    try {
      const response = await supabase.functions.invoke('verify-reset-token', {
        body: { token, email, newPassword }
      });
      
      if (response.error) {
        return { error: response.error, data: null };
      }
      
      if (response.data?.error) {
        return { error: new Error(response.data.error), data: null };
      }
      
      return { error: null, data: response.data };
    } catch (err) {
      return { error: err as Error, data: null };
    }
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const updateEmail = async (newEmail: string) => {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    verifyResetToken,
    updatePassword,
    updateEmail,
  };
};
