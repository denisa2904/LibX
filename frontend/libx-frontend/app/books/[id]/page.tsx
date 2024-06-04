'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import IndividualBook from '@/app/ui/books/individual_book';
import { getIndividualBook, getRecommendedBooks, Book } from '@/api/get-individual-book';
import NotFound from './not-found';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import styles from '@/app/books/books.module.css';
import BookImage from '@/app/ui/books/book_image';
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface BookPageProps {
    params: { id: string };
}


const BookPage: React.FC<BookPageProps> = ({ params }) => {
    const [book, setBook] = useState<Book | null>(null);
    const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedBook = await getIndividualBook(params.id);
                setBook(fetchedBook);
                const recommended = await getRecommendedBooks(params.id);
                setRecommendedBooks(recommended);
                setLoading(false);
            } catch (error) {
                console.error('Failed to load data:', error);
                setLoading(false);
            }
        };

        loadData();
    }, [params.id]);

    if (loading) {
        return <Skeleton className="w-full h-24" />;
    }

    if (!book) {
        return <NotFound />;
    }

    return (
        <>
            <Head>
                <title>{book?.title} - Book Details</title>
                <meta name="description" content={`Find out more about ${book?.title}, written by ${book?.author}.`} />
            </Head>
            <IndividualBook book={book} />
            <div className="mt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">You might like:</h2>
                <Carousel className='lg:align-items center'
                    plugins={[
                        Autoplay({
                        delay: 2000,
                        }),
                    ]}>
                    <CarouselContent className="-ml-1">
                        {recommendedBooks.map((book) => (
                            <CarouselItem key={book.id} className="pl-1 md:basis-1/5 lg:basis-1/5">
                                <div className="p-1">
                                <Link key={book.id} href={`/books/${book.id}`} passHref>
                                <Card>
                                    <CardContent className={styles.bookCard}>
                                        <div className={styles.bookOverlay}></div>
                                        <BookImage bookId={book.id} className={styles.bookImage} />
                                        <div className={styles.bookName}>{book.title}</div>
                                    </CardContent>
                                </Card>
                                </Link>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </>
    );
};

export default BookPage;
