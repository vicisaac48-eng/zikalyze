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
    try {
      // Use hash-based redirect for HashRouter compatibility
      const redirectUrl = `${window.location.origin}/#/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      // Increment user count on successful signup
      if (!error) {
        try {
          await supabase.rpc('increment_user_count');
        } catch (e) {
          console.warn('Failed to increment user count:', e);
        }
      }
      
      return { error };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred during sign up');
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred during sign in');
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Use Supabase's native password reset (built-in email delivery)
  const resetPassword = async (email: string): Promise<{ 
    error: Error | null; 
    rateLimited?: boolean; 
    retryAfter?: number 
  }> => {
    try {
      // Use hash-based redirect for HashRouter compatibility
      const redirectUrl = `${window.location.origin}/#/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        // Check for rate limit errors from Supabase
        const errorMessage = error.message || error.toString() || '';
        if (errorMessage.includes('rate limit') || error.status === 429) {
          return { 
            error, 
            rateLimited: true, 
            retryAfter: 60 // Default 1 minute retry
          };
        }
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    // Send password changed confirmation email if successful
    if (!error) {
      try {
        await supabase.functions.invoke('send-password-changed', {
          body: {}
        });
      } catch (emailError) {
        // Don't fail the password update if email fails
        console.warn('Failed to send password changed email:', emailError);
      }
    }
    
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
    updatePassword,
    updateEmail,
  };
};
