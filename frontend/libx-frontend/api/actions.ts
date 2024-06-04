import { useState, useEffect, useCallback } from 'react';
import { Book } from './get-individual-book';
const API_URL = 'http://localhost:9000/api/users';

export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
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
