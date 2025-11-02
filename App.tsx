

import React, { useState, useEffect } from 'react';
import type { User } from './types';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import MainApp from './MainApp';
import { supabase } from './lib/supabaseClient';

type AuthView = 'login' | 'signup';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // FIX: Only proceed if the user is fully authenticated (email confirmed).
        // The `aud` (audience) claim in the JWT will be 'authenticated' after confirmation.
        // Before that, it might be 'anon', which could cause RLS policies for 'authenticated' users to fail.
        if (session.user.aud !== 'authenticated') {
          console.log('User session detected, but email not confirmed. Waiting for full authentication.');
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error.message);
          setCurrentUser(null);
        } else if (profile) {
          // Profile exists, set the user
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            profile: {
              username: profile.username,
              bio: profile.bio,
              privacy: profile.privacy,
            }
          });
        } else {
          // Profile does not exist, this might be a first-time login after signup.
          // Let's try to create a profile as a fallback for a failed DB trigger.
          const newUsername = session.user.user_metadata.username;
          if (newUsername) {
            console.warn(`Profile for user ${session.user.id} not found. Attempting to create one.`);
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                // The RLS policy requires us to explicitly set the ID to match the authenticated user.
                id: session.user.id,
                username: newUsername,
                bio: session.user.user_metadata.bio || '',
                privacy: session.user.user_metadata.privacy || 'public',
              })
              .select()
              .single();

            if (insertError) {
              console.error("Error creating profile fallback:", insertError.message);
              setCurrentUser(null);
            } else if (newProfile) {
              console.log("Successfully created fallback profile.");
              setCurrentUser({
                id: session.user.id,
                email: session.user.email,
                profile: {
                  username: newProfile.username,
                  bio: newProfile.bio,
                  privacy: newProfile.privacy,
                }
              });
            }
          } else {
              console.error(`No profile found for user ${session.user.id} and username not found in metadata. Cannot create profile.`);
              setCurrentUser(null);
          }
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error);
    setCurrentUser(null);
    setAuthView('login');
  };

  const handleProfileUpdate = async (updatedProfile: User['profile']) => {
      if (!currentUser) return;
      const { data, error } = await supabase
        .from('profiles')
        .update({
            bio: updatedProfile.bio,
            privacy: updatedProfile.privacy,
        })
        .eq('id', currentUser.id)
        .select()
        .single();
    
      if (error) {
          console.error("Error updating profile:", error);
      } else if (data) {
          setCurrentUser(prevUser => prevUser ? { ...prevUser, profile: { ...prevUser.profile, bio: data.bio, privacy: data.privacy } } : null);
      }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (authView === 'login') {
      return (
        <Login
          switchToSignUp={() => setAuthView('signup')}
        />
      );
    } else {
      return (
        <SignUp
          switchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  // Regular User Route
  return <MainApp user={currentUser} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />;
};

export default App;