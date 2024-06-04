'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import IndividualBook from '@/app/ui/books/individual_book';
import { getIndividualBook, Book } from '@/api/get-individual-book';
import NotFound from './not-found'; // Ensure this path is correct

interface BookPageProps {
    params: { id: string };
}

export default function BookPage({ params }: BookPageProps) {
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBook() {
            try {
                const fetchedBook = await getIndividualBook(params.id);
                setBook(fetchedBook);
                setLoading(false);
            } catch (error) {
                console.error('Failed to load book details:', error);
                setLoading(false);
            }
        }

        fetchBook();
    }, [params.id]);

    if (loading) {
        return <p>Loading...</p>; // Consider a more robust loading component or UI indicator
    }

    if (!book) {
        return <NotFound />; 
    }

    return (
        <>
            <Head>
                <title>{book.title} - Book Details</title>
                <meta name="description" content={`Find out more about ${book.title}, written by ${book.author}.`} />
            </Head>
            <IndividualBook book={book} />
        </>
    );
}
