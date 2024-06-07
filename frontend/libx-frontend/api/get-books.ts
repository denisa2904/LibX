import { Book } from '@/api/get-individual-book';
export interface Criteria {
    criteria: {
        [key: string]: string[];
    };
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
        throw error;  // Rethrowing the error to handle it in the component where this function is called
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
        const response = await fetch(`${API_URL}/criteria`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(criteria),
            credentials: 'include' // Assuming cookies are needed for session management
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