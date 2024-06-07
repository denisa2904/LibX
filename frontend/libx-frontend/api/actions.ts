import { useState, useEffect, useCallback } from 'react';
import { Book } from './get-individual-book';
const API_URL = 'http://localhost:9000/api/users';

export interface User {
    password: string;
    id: string;
    username: string;
    email: string;
    role: string;
}

export interface UserUpdate {
    username?: string;
    email?: string;
    password?: string;
}

const handleResponse = (response: Response) => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
}

export const rentBook = async (bookId : string) => {
    const response = await fetch(`${API_URL}/rented`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ id: bookId })
    });

    if (response.ok) {
        console.log('Book rented successfully');
    } else {
        console.error('Failed to rent book');
    }
};

export const getRentals = async (): Promise<Book[]> => {
    try {
        const response = await fetch(`${API_URL}/rented`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch rented books: ${response.status}`);
        }
        return await response.json() as Book[];
    } catch (error) {
        console.error('Fetch rented books error:', error);
        throw error;
    }
}

export const isRented = async (bookId : string) => {
    const response = await fetch(`${API_URL}/rented/${bookId}`, {
        method: 'GET',
        credentials: 'include'
    });

    if (response.ok) {
        return true;
    } else {
        return false;
    }
}

export const addFavourite = async (bookId : string) => {
    const response = await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ id: bookId })
    });

    if (response.ok) {
        console.log('Book added to favourites successfully');
    } else {
        console.error('Failed to add book to favourites');
    }
}

export const getFavourites = async (): Promise<Book[]> => {
    try {
        const response = await fetch(`${API_URL}/favorites`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch favourite books: ${response.status}`);
        }
        return await response.json() as Book[];
    } catch (error) {
        console.error('Fetch favourite books error:', error);
        throw error;
    }
}

export const removeFavourite = async (bookId : string) => {
    const response = await fetch(`${API_URL}/favorites/${bookId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ id: bookId })
    });

    if (response.ok) {
        console.log('Book removed from favourites successfully');
    } else {
        console.error('Failed to remove book from favourites');
    }
}

export const isFavourite = async (bookId : string) => {
    const response = await fetch(`${API_URL}/favorites/${bookId}`, {
        method: 'GET',
        credentials: 'include'
    });

    if (response.ok) {
        return true;
    } else {
        return false;
    }
}

export const getUser = async (): Promise<User> => {
    try {
        const response = await fetch(`${API_URL}/self`,{
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status}`);
        }
        return await response.json() as User;
    } catch (error) {
        console.error('Fetch user error:', error);
        throw error;  
    }
};

export const updateUser = async (user: UserUpdate): Promise<UserUpdate> => {
    try {
        const response = await fetch(`${API_URL}/updateSelf`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        if (!response.ok) {
            throw new Error(`Failed to update user: ${response.status}`);
        }
        return await response.json() as UserUpdate;
    } catch (error) {
        console.error('Update user error:', error);
        throw error;  
    }
};
