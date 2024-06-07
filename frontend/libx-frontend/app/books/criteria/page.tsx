'use client';
import React, { useEffect, useState } from 'react';
import { Criteria, fetchBooksByCriteria} from '@/api/get-books';
import BookImage from '@/app/ui/books/book_image';
import { Pagination } from 'antd';
import styles from '@/app/books/books.module.css';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Genre } from '@/api/get-individual-book';
import { Book } from '@/api/get-individual-book';

export interface Book_with_no_id {
    title: string;
    author: string;
    isbn: string;
    publisher: string;
    year: number;
    description: string;
    rating: number;
    genres: Genre[];
}

const BooksComponent: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [booksPerPage] = useState<number>(30);
  const initialCriteria: Criteria = {
    author: ["J.K. Rowling"], 
    title: ["Harry Potter"]
  };
  const [criteria, setCriteria] = useState<Criteria>(initialCriteria);
  useEffect(() => {
    setLoading(true);
    fetchBooksByCriteria(criteria)
      .then(books => {
        setBooks(books);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
        setError('Failed to load books.');
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