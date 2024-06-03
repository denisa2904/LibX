import { Book } from '@/api/get-individual-book';

export const getBooks = async (): Promise<Book[]> => {
    try {
        const response = await fetch('http://localhost:9000/api/books');
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
