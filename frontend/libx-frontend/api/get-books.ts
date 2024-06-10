import { Book } from '@/api/get-individual-book';
export interface Criteria {
        [key: string]: string[];
}


const API_URL = 'http://localhost:9000/api/books';

export const getBooks = async (): Promise<Book[]> => {
    try {
        const response = await fetch(`${API_URL}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const books: Book[] = await response.json();
        return books;
    } catch (error) {
        console.error("Failed to fetch books:", error);
        throw error;  
    }
}

export const searchBooks = async (query: string): Promise<Book[]> => {
    try {
        const response = await fetch(`${API_URL}/search?q=${query}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const books: Book[] = await response.json();
        return books;
    } catch (error) {
        console.error("Failed to search books:", error);
        throw error;
    }
}

export async function fetchBooksByCriteria(criteria: Criteria): Promise<any[]> {
    try {
        console.log(JSON.stringify({criteria}));
        const response = await fetch(`${API_URL}/criteria`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({criteria}),
            credentials: 'include' 
        });

        if (!response.ok) {
            const message = `An error has occurred: ${response.status} - ${response.statusText}`;
            throw new Error(message);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch books by criteria:', error);
        throw error;
    }
}

export async function getBooksByGenre(genre: string): Promise<Book[]> {
    try {
        const response = await fetch(`${API_URL}/genre/${genre}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const books: Book[] = await response.json();
        return books;
    } catch (error) {
        console.error('Failed to fetch books by genre:', error);
        throw error;
    }
}

export async function fetchAuthors(): Promise<string[]> {
    try {
        const response = await fetch(`${API_URL}/authors`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch authors:', error);
        throw error;
    }
}

export async function fetchGenres(): Promise<string[]> {
    try {
        const response = await fetch(`${API_URL}/genres`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch genres:', error);
        throw error;
    }
}

export async function fetchPublishers(): Promise<string[]> {
    try {
        const response = await fetch(`${API_URL}/publishers`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch publishers:', error);
        throw error;
    }
}