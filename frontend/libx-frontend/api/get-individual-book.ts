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
    // id: string;
    title: string;
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
    const url = `http://localhost:9000/api/books/${bookId}/image`;

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

export default getIndividualBook;

