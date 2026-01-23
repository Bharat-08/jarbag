import { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import api, { setAccessToken } from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Try to refresh token first to get an access token
            const res = await api.post('/auth/refresh');
            setAccessToken(res.data.accessToken);
            setUser(res.data.user);
        } catch (err) {
            // If refresh fails, we are not logged in
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        return res.data;
    }, []);

    const signup = useCallback(async (email, password, name, role) => {
        const res = await api.post('/auth/signup', { email, password, name, role });
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        return res.data;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error(e);
        }
        setAccessToken(null);
        setUser(null);
    }, []);

    // Memoize the value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        user,
        loading,
        login,
        signup,
        logout
    }), [user, loading, login, signup, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
