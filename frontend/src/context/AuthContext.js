import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import api from '../utils/api';

export const AuthContext = createContext();

// Custom hook for using auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = Cookies.get('token');
            if (token) {
                try {
                    const { data } = await api.get('/auth/profile');
                    setUser(data);
                } catch (error) {
                    console.error('Failed to load user profile', error);
                    Cookies.remove('token');
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            Cookies.set('token', data.token, { expires: 7 });
            setUser({
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role,
            });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
