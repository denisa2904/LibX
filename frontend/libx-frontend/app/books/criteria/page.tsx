'use client';
import React, { use, useEffect, useState } from 'react';
import { Criteria, fetchBooksByCriteria} from '@/api/get-books';
import BookImage from '@/app/ui/books/book_image';
import { Pagination } from 'antd';
import styles from '@/app/books/books.module.css';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Book } from '@/api/get-individual-book';


const BooksComponent: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [booksPerPage] = useState<number>(15);
  const [criteria, setCriteria] = useState<Criteria>(
    {
      rating: ['']
    }
  );

  useEffect(() => {
    const storedCriteria = localStorage.getItem('searchCriteria');
    if (storedCriteria) {
      setCriteria(JSON.parse(storedCriteria));
      localStorage.removeItem('searchCriteria');
    }
  }, []);

  useEffect(() => {
    fetchBooksByCriteria(criteria)
      .then(books => {
        setBooks(books);
        setLoading(false);
      })
      .catch(error => {
        setError('Failed to fetch books');
        setLoading(false);
      });
  }, [criteria]);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) return <div>Error: {error}</div>;
  if(!loading) return (
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