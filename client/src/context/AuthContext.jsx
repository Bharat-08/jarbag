import { createContext, useState, useEffect, useContext } from 'react';
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

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        return res.data;
    };

    const signup = async (email, password, name, role) => {
        const res = await api.post('/auth/signup', { email, password, name, role });
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error(e);
        }
        setAccessToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
