'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { generateMagicUsername, usernameToEmail, emailToUsername } from '@/lib/auth-utils';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    username: string | null;
    isLoading: boolean;
    signInWithUsername: (username: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize the session
    useEffect(() => {
        let mounted = true;

        async function initializeAuth() {
            try {
                const { data: { session: existingSession } } = await supabase.auth.getSession();

                if (existingSession?.user) {
                    if (mounted) {
                        setSession(existingSession);
                        setUser(existingSession.user);
                        setUsername(existingSession.user.user_metadata?.username || emailToUsername(existingSession.user.email));
                        setIsLoading(false);
                    }
                    return;
                }

                // If no session exists, we auto-create a magic user
                const newUsername = generateMagicUsername();
                const dummyEmail = usernameToEmail(newUsername);

                // Supabase sign UP. Since we disabled email verification, it logs them in immediately.
                const { data, error } = await supabase.auth.signUp({
                    email: dummyEmail,
                    password: newUsername,
                    options: {
                        data: {
                            username: newUsername // store in raw user meta data
                        }
                    }
                });

                if (error) {
                    console.error("Auto-Registration Failed:", error.message);
                    // Fallback if needed, possibly retry or show error UI
                } else if (mounted) {
                    setSession(data.session);
                    setUser(data.user);
                    setUsername(newUsername);
                }
            } catch (err) {
                console.error("Auth init error:", err);
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        initializeAuth();

        // Listen to changes (e.g., if they sync from the settings page)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    setUsername(session.user.user_metadata?.username || emailToUsername(session.user.email));
                } else {
                    setUsername(null);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Sync a device
    const signInWithUsername = async (syncCode: string) => {
        setIsLoading(true);
        const dummyEmail = usernameToEmail(syncCode);

        // We try to sign in. The password is the username itself.
        const { data, error } = await supabase.auth.signInWithPassword({
            email: dummyEmail,
            password: syncCode
        });

        setIsLoading(false);
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        // Re-initialization (get a new random username) would require a page reload
        window.location.reload();
    };

    return (
        <AuthContext.Provider value={{ user, session, username, isLoading, signInWithUsername, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
