'use client';
import React, { useEffect, useState } from 'react';
import { getBooks } from '@/api/get-books';
import { Book } from '@/api/get-individual-book';
import BookImage from '@/app/ui/books/book_image';  // Adjust the path as necessary

const BooksComponent: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getBooks().then(books => {
            setBooks(books);
            setLoading(false);
        }).catch(error => {
            setError('Failed to fetch books');
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Books</h1>
            {books.map(book => (
                <div key={book.id}>
                    <h2>{book.title}</h2>
                    <p>Author: {book.author}</p>
                    <BookImage bookId={book.id} className="w-32 h-32 object-cover"/>
                </div>
            ))}
        </div>
    );
}

export default BooksComponent;
