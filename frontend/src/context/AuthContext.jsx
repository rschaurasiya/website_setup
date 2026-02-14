import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            return null;
        }
    });
    // Initialize loading based on whether we have a user in storage
    // If we have a user, we are optimistically "ready" (loading=false)
    // We will still sync in the background.
    const [loading, setLoading] = useState(!localStorage.getItem('user'));

    useEffect(() => {
        // Use dynamic import for Firebase auth to avoid circular dependencies if any
        import('../firebase').then(({ auth }) => {
            import('firebase/auth').then(({ onAuthStateChanged }) => {
                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    console.log('AuthContext: onAuthStateChanged', firebaseUser ? firebaseUser.uid : 'No User');

                    if (firebaseUser) {
                        // PREVENT DOUBLE SYNC:
                        // If we already have a user in state/storage and it matches the Firebase UID, we don't need to sync again immediately.
                        // This allows login() to handle the initial sync (and error reporting) explicitly.
                        const currentStoredUser = JSON.parse(localStorage.getItem('user'));
                        if (user && user.firebaseUid === firebaseUser.uid) {
                            console.log("AuthContext: User already synced in state. Skipping background sync.");
                            setLoading(false);
                            return;
                        }
                        if (currentStoredUser && currentStoredUser.firebaseUid === firebaseUser.uid) {
                            console.log("AuthContext: User found in storage. Restoring state.");
                            setUser(currentStoredUser);
                            setLoading(false);
                            // We could do a strict sync validation here if needed, but for now trust storage to avoid loops.
                            return;
                        }

                        // We have a firebase user but no local user -> Sync is needed (e.g. Page Reload)
                        if (!user) setLoading(true);

                        try {
                            // Sync with backend to get role and full profile
                            const userBackend = await authService.firebaseSignup({
                                name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                                email: firebaseUser.email,
                                firebaseUid: firebaseUser.uid,
                                profile_photo: firebaseUser.photoURL
                            });
                            console.log('AuthContext: Backend Sync Success (Reload)', userBackend);
                            setUser(userBackend);
                            localStorage.setItem('user', JSON.stringify(userBackend));
                        } catch (error) {
                            console.error("Failed to sync auth state:", error);
                            // ... existing error handling ...
                            if (!user) {
                                localStorage.removeItem('user');
                                localStorage.removeItem('token');
                                setUser(null);
                            }
                        } finally {
                            setLoading(false);
                        }
                    } else {
                        // ... existing logout logic ...
                        console.log('AuthContext: User Logged Out');
                        setUser(null);
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        setLoading(false);
                    }
                });
                return () => unsubscribe();
            });
        });
    }, []);

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } catch (error) {
            console.error("Logout failed:", error);
            // Force local cleanup anyway
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
        // Also update local storage if needed, though simple state update is safer for session
        // Depending on authService implementation, we might want to update the stored token/user data there too.
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
            localStorage.setItem('user', JSON.stringify({ ...currentUser, ...userData }));
        }
    };

    const firebaseSignup = async (userData) => {
        // userData contains { name, email, firebaseUid, creator_reason, ... }
        try {
            const response = await authService.firebaseSignup(userData);
            setUser(response);
            // Save to local storage same as login
            localStorage.setItem('user', JSON.stringify(response));
            if (response.token) localStorage.setItem('token', response.token);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            // 1. Firebase Login
            const { user: firebaseUser } = await import('../firebase').then(module =>
                import('firebase/auth').then(authModule =>
                    authModule.signInWithEmailAndPassword(module.auth, email, password)
                )
            );

            // 2. Explicit Sync (so we can catch errors in UI)
            const userBackend = await firebaseSignup({
                name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                email: firebaseUser.email,
                firebaseUid: firebaseUser.uid,
                profile_photo: firebaseUser.photoURL
            });

            // Set user immediately so onAuthStateChanged sees it and skips
            setUser(userBackend);
            return userBackend;

        } catch (error) {
            console.error("Login/Sync Context Error:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            setUser,
            logout,
            updateUser,
            firebaseSignup,
            login,
            loading,
            user // Expose user directly for consumers
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export { AuthContext };
