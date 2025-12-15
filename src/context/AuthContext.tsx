import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/api';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (token && savedUser) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Failed to parse user from storage", e);
                localStorage.removeItem("user");
            }
        }
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common.Authorization;
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
