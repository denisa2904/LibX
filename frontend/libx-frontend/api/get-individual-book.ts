export interface Book {
    id: string;
    googleId: string;
    title: string;
    author: string;
    isbn: string;
    publisher: string;
    year: number;
    description: string;
    rating: number;
    image: {
        id: string;
        title: string;
        type: string;
    };
    genres: Genre[];
}

export interface Genre {
    title: string;
}

export interface Comments {
    content: string;
    username: string;
    created_at: string;
}

export interface CommentText {
    content: string;
}

const API_URL = 'http://localhost:9000/api/books';

export const getIndividualBook = async (bookId: string): Promise<Book> => {
    try {
        const response = await fetch(`${API_URL}/${bookId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch book with ID ${bookId}: ${response.status}`);
        }
        return await response.json() as Book;
    } catch (error) {
        console.error('Fetch book error:', error);
        throw error;  
    }
};

export async function fetchImage(bookId: string): Promise<string> {
    const url = `${API_URL}/${bookId}/image`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const imageBlob = await response.blob();
        return URL.createObjectURL(imageBlob);
    } catch (error) {
        console.error('Error fetching image:', error);
        return '';
    }
}

export async function getRecommendedBooks(bookId: string): Promise<Book[]> {
    try {
        const response = await fetch(`${API_URL}/${bookId}/recommendations`);
        if (!response.ok) {
            throw new Error(`Failed to fetch recommended books for book with ID ${bookId}: ${response.status}`);
        }
        return await response.json() as Book[];
    } catch (error) {
        console.error('Fetch recommended books error:', error);
        throw error;
    }
};

export async function getComments(bookId: string): Promise<Comments[]> {
    try {
        const response = await fetch(`${API_URL}/${bookId}/comments`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch comments for book ${bookId}: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch comments:', error);
        throw error;
    }
}

export async function addComment(bookId: string, comment: CommentText): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/${bookId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(comment)
        });

        if (!response.ok) {
            throw new Error(`Failed to add comment to book ${bookId}: ${response.status}`);
        }
    } catch (error) {
        console.error('Failed to add comment:', error);
        throw error;
    }
}

