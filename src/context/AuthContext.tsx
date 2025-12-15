import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData?: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            // Try to decode user from token or use stored user
            // For this MVP, we might need to store user details separately if encoded in token
            // or assume the user object is set during login.
            // Let's try to restore user from localStorage if we saved it there
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user", e);
                }
            } else {
                // Optional: Decode token here if needed
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    // Construct a basic user from payload if possible
                    if (payload.sub && !user) {
                        setUser({ email: payload.sub, name: payload.name || payload.sub.split('@')[0], role: payload.role || 'PARTICIPANT' } as User);
                    }
                } catch (e) {
                    // invalid token
                }
            }
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    }, [token]);

    const login = (newToken: string, userData?: User) => {
        setToken(newToken);
        if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            // If no user data provided, try to extract from token immediately
            try {
                const payload = JSON.parse(atob(newToken.split('.')[1]));
                const extractedUser = {
                    email: payload.sub,
                    name: payload.name || payload.sub, // Fallback
                    role: payload.role || 'PARTICIPANT'
                } as User;
                setUser(extractedUser);
                localStorage.setItem('user', JSON.stringify(extractedUser));
            } catch (e) {
                console.error("Could not extract user from token");
            }
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
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
