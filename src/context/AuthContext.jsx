import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const lastFetchedEmail = useRef(null);

    const fetchProfileByEmail = async (email) => {
        if (!email || email === lastFetchedEmail.current) return;

        lastFetchedEmail.current = email; // Mark as fetching/fetched

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email);

            if (error) {
                console.error('Error fetching user profile:', error);
                // On error, maybe we want to allow retry later? 
                // For now, keeping it blocked to prevent loop panic.
            } else if (data && data.length > 0) {
                setUserProfile(data[0]);
            }
        } catch (err) {
            console.error("Unexpected error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user?.email) {
                fetchProfileByEmail(session.user.email);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const newEmail = session?.user?.email;

            // Only update if session actually changed meaningfully
            if (session?.access_token !== session?.access_token) {
                setSession(session);
                setUser(session?.user ?? null);
            } else {
                // Even if token is same, ensure state is synced
                setSession(session);
                setUser(session?.user ?? null);
            }

            if (newEmail) {
                fetchProfileByEmail(newEmail);
            } else {
                setUserProfile(null);
                lastFetchedEmail.current = null; // Reset on logout
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password, username, typeIndividual) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                },
            },
        });

        if (error) {
            console.error("SignUp Error:", error);
            throw error;
        }

        if (data.user) {
            const { error: dbError } = await supabase
                .from('users')
                .insert([
                    {
                        email: email,
                        username: username,
                        password: 'hashed_placeholder',
                        typeIndividual: typeIndividual,
                    },
                ]);

            if (dbError) {
                console.error("Error creating user profile:", dbError);
                throw dbError;
            }
        }
        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("SignIn Error:", error);
            throw error;
        }

        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("SignOut Error:", error);
        }
    };

    const value = {
        session,
        user,
        userProfile,
        signUp,
        signIn,
        signOut,
        loading
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
