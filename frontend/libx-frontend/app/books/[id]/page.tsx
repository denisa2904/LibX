'use client';
import React, { use, useEffect, useState } from 'react';
import Head from 'next/head';
import IndividualBook from '@/app/ui/books/individual_book';
import { getIndividualBook, getRecommendedBooks, Book, getRatings, getUserRating, addRating } from '@/api/get-individual-book';
import NotFound from './not-found';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import styles from '@/app/books/books.module.css';
import BookImage from '@/app/ui/books/book_image';
import Autoplay from "embla-carousel-autoplay"
import { useAuth } from '@/api/auth';
import { isRented, rentBook, returnBook } from '@/api/actions';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '@/app/ui/button';
import CommentsSection from '@/app/ui/books/comments';

interface BookPageProps {
    params: { id: string };
}


const BookPage: React.FC<BookPageProps> = ({ params }) => {
    const [book, setBook] = useState<Book | null>(null);
    const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const{ isAuthenticated } = useAuth();
    const [isRentedBook, setIsRentedBook] = useState<boolean>(false);
    const [userRating, setUserRating] = useState<number>(0);

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
        const checkRentedStatus = async () => {
            if (book) {
                const status = await isRented(book.id);
                setIsRentedBook(status);
            }
        };

        const fetchRatings = async () => {
            const ratings = await getRatings(params.id);
            console.log(ratings);
        }

        fetchRatings();

        checkRentedStatus();

        loadData();
    }, [params.id, book?.id]);

    useEffect(() => {
        const fetchUserRating = async () => {
            if (isAuthenticated) {
                try {
                    const rating = await getUserRating(params.id);
                    setUserRating(rating);
                } catch (error) {
                    console.error('Failed to fetch user rating:', error);
                    setUserRating(0); 
                }
            }
        };
    
        if (isAuthenticated) {
            fetchUserRating();
        }
    }, [params.id, isAuthenticated]);

    if (loading) {
        return <Skeleton className="w-full h-24" />;
    }

    if (!book) {
        return <NotFound />;
    }

    const toggleRented = async () => {
        try {
            if (isRentedBook) {
                await returnBook(book.id);
                setIsRentedBook(false);
                console.log('Book returned successfully');
            } else {
                await rentBook(book.id);
                setIsRentedBook(true);
                console.log('Book rented successfully');
            }
        } catch (error) {
            console.error('Failed to update rental status:', error);
        }
    };
    
    return (
        <>
            <Head>
                <title>{book?.title} - Book Details</title>
                <meta name="description" content={`Find out more about ${book?.title}, written by ${book?.author}.`} />
            </Head>
            <IndividualBook params={params}/>
            <div className="mt-6"></div>
            {isAuthenticated ? (
                <Button
                    onClick={toggleRented}
                    className={'pl-2 pb-3 ' + (isRentedBook ? styles.returnButton : styles.rentButton)}
                    aria-label={isRentedBook ? 'Return Book' : 'Rent Book'}
                >
                    <span>{isRentedBook ? 'Return' : 'Rent'}</span>
                </Button>
            ) : null}
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
            <div className="mt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Comments:</h2>
                <CommentsSection postId={book.id} />
            </div>
        </>
    );
};

export default BookPage;
