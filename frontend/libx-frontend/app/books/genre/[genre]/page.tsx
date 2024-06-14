'use client';
import React, { useEffect, useRef, useState } from 'react';
import { getBooksByGenre } from '@/api/get-books';
import BookImage from '@/app/ui/books/book_image';
import { Pagination } from 'antd';
import styles from '@/app/books/books.module.css';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Book } from '@/api/get-individual-book';
import { useAuth } from '@/api/auth';
import path from 'path';
import { usePathname } from 'next/navigation';


const BooksComponent: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [booksPerPage] = useState<number>(15);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const genre = pathname.split('/').pop();
    console.log(genre);

    if (genre) {
      getBooksByGenre(genre)
        .then(fetchedBooks => {
          setBooks(fetchedBooks);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch books:', error);
          setLoading(false);
        });
    }

  }, []);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };


  if (error) return <div>Error: {error}</div>;
  if(!loading && isAuthenticated ) return (
        <div>
            <div className={styles.bookGrid}>
                {currentBooks.map(book => (
                <Link key={book.id} href={`/books/${book.id}`} passHref>
                <Card style={{ cursor: 'pointer' }}>  
                <CardContent className={styles.bookCard}>
                    <div className={styles.bookOverlay}></div>
                    <BookImage bookId={book.id} className={styles.bookImage}/>
                    <div className={styles.bookName}>{book.title}</div>
                </CardContent>
                </Card>
            </Link>
                ))}
            </div>
        <div className={styles.paginationWrapper}>
        <Pagination
            current={currentPage}
            total={books.length}
            pageSize={booksPerPage}
            onChange={onPageChange}
            showSizeChanger={false}
        />
        </div>
        </div>
    );
};

export default BooksComponent;