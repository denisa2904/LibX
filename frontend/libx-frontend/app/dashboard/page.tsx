'use client';
import React from 'react';
import {useAuth } from '@/api/auth'; // Ensure path is correct

const AuthComponent = () => {
    const { isAuthenticated, loading } = useAuth();
    return (
        <div>
            {loading ? <p>Loading...</p> : isAuthenticated ? <p>User is authenticated</p> : <p>Please login or register</p>}
        </div>
    );
};

export default AuthComponent;
