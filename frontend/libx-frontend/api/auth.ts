import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:9000/api/auth';

export interface AuthData {
    username: string;
    email: string;
    password: string;
}

const handleResponse = (response: Response) => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
}

export const register = async (userData: AuthData): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
            credentials: 'include'
        });
        return handleResponse(response).ok;
    } catch (error) {
        console.error('Registration error:', error);
        return false;
    }
};

export const login = async (userData: AuthData): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
            credentials: 'include'
        });
        return handleResponse(response).ok;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
};

export const logout = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include' 
        });

        return response.ok; 
    } catch (error) {
        console.error('Logout error:', error);
        return false;
    }
};

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const verifyUser = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/check`, {
                method: 'GET',
                credentials: 'include'
            });
            // handleResponse(response);
            // setIsAuthenticated(response.ok);
            const text = await response.text();
            setIsAuthenticated(text === 'User is authenticated');
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        verifyUser();
    }, [verifyUser]);

    return { isAuthenticated, setIsAuthenticated, loading, setLoading, verifyUser };
};
