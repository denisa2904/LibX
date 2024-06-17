import { Book } from './get-individual-book';
import { Book_with_no_id } from '@/app/books/page';
const API_URL = 'http://localhost:9000/api/books';

export const addBook = async (bookData: Book_with_no_id): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData),
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        console.error('Add book error:', error);
        return false;
    }
}

export const updateBook = async (bookData: Book): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/${bookData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData),
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        console.error('Update book error:', error);
        return false;
    }
}

export const deleteBook = async (bookId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/${bookId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        console.log('Deleted book');
        return response.ok;
    } catch (error) {
        console.log('Error deleting book');
        console.error('Delete book error:', error);
        return false;
    }
}

export const updateBookPhoto = async (bookId: string, image: File): Promise<boolean> => {
    const formData = new FormData();
    formData.append('image', image);

    try {
        const response = await fetch(`${API_URL}/${bookId}/image`, {
            method: 'PUT',
            body: formData,
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        console.error('Update book photo error:', error);
        return false;
    }
}