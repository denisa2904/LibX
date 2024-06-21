'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import IndividualBook from '@/app/ui/books/individual_book';
import { getIndividualBook, getRecommendedBooks, Book, getRatings, getUserRating} from '@/api/get-individual-book';
import NotFound from './not-found';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import styles from '@/app/books/books.module.css';
import BookImage from '@/app/ui/books/book_image';
import Autoplay from "embla-carousel-autoplay"
import { useAuth } from '@/api/auth';
import { isRented, rentBook, returnBook, getRecs } from '@/api/user';
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
declare global {
    interface Window {
      GBS_insertPreviewButtonPopup: (isbn: string, element: HTMLElement) => void;
    }
  }

const BookPage: React.FC<BookPageProps> = ({ params }) => {
    const [book, setBook] = useState<Book | null>(null);
    const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
    const [userRecs, setUserRecs] = useState<Book[]>([]);
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
                const recs = await getRecs();
                setUserRecs(recs);
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
                <div style={{ display: 'flex', alignItems: 'center', gap:6 }}>
                    {book.previews!=='No preview available.' && (
                        <Button
                            onClick={() => {
                                const popup = window.open(book.previews, '_blank', 'fullscreen=yes, scrollbars=yes');
                                if (!popup) {
                                    window.open(book.previews, '_blank');
                                }
                            }}
                            className={'p-3 ' + styles.previewButton}
                        >
                            <span>Preview</span>
                        </Button>
                    )}
                    {isAuthenticated ? (
                        <Button
                            onClick={toggleRented}
                            className={'p-3 ' + (isRentedBook ? styles.returnButton : styles.rentButton)}
                            aria-label={isRentedBook ? 'Return Book' : 'Rent Book'}
                        >
                            <span>{isRentedBook ? 'Return' : 'Rent'}</span>
                        </Button>
                    ) : null}
            </div>
            <div className="mt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Similar books:</h2>
                <Carousel className={styles.carouselContent}
                    plugins={[
                        Autoplay({
                        delay: 3000,
                        }),
                    ]}>
                    <CarouselContent className="-ml-1">
                        {recommendedBooks.map((book) => (
                            <CarouselItem key={book.id} className={styles.carousel_item_size}>
                                <div className="p-1">
                                <Card>
                                    <CardContent className={styles.bookCard}>
                                        <Link key={book.id} href={`/books/${book.id}`} passHref>
                                            <div className={styles.bookOverlay}></div>
                                            <BookImage bookId={book.id} className={styles.bookImage} />
                                            <div className={styles.bookName}>{book.title}</div>
                                        </Link>
                                    </CardContent>
                                </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselNext />
                </Carousel>
            </div>
            {isAuthenticated ? (
            <div className="mt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">You might enjoy:</h2>
                <Carousel className={styles.carouselContent}
                    plugins={[
                        Autoplay({
                        delay: 3000,
                        }),
                    ]}>
                    <CarouselContent className="-ml-1">
                        {userRecs.map((book) => (
                            <CarouselItem key={book.id} className={styles.carousel_item_size}>
                                <div className="p-1">
                                <Card>
                                    <CardContent className={styles.bookCard}>
                                        <Link key={book.id} href={`/books/${book.id}`} passHref>
                                            <div className={styles.bookOverlay}></div>
                                            <BookImage bookId={book.id} className={styles.bookImage} />
                                            <div className={styles.bookName}>{book.title}</div>
                                        </Link>
                                    </CardContent>
                                </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>) : null}
            <div className=" mt-6 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2 ">Comments:</h2>
                <CommentsSection postId={book.id} />
            </div>
        </>
    );
};

export default BookPage;
