'use client';
import React, { useEffect, useState } from 'react';
import { getBooks, searchBooks } from '@/api/get-books';
import BookImage from '@/app/ui/books/book_image';
import { Pagination } from 'antd';
import styles from './books.module.css';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { addBook } from '@/api/admin';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/api/auth';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Genre } from '@/api/get-individual-book';
import { Book } from '@/api/get-individual-book';
import { useSearchParams } from 'next/navigation';
import { notification } from 'antd';
import type { ArgsProps } from 'antd/lib/notification';
import { NotificationPlacement } from 'antd/lib/notification/interface';

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
  const [booksPerPage] = useState<number>(15);
  const [newBook, setNewBook] = useState<Book_with_no_id>({
    title: '',
    author:'',
    isbn: '',
    publisher: '',
    year: 0,
    description: '',
    rating: 0,
    genres: []
});
  const { role } = useAuth();
  const searchParams = useSearchParams();
  type NotificationType = 'success' | 'info' | 'warning' | 'error';
    const showNotification = (type:NotificationType , message:string, placement: NotificationPlacement = 'topRight') => {
        const displayTitle = type.charAt(0).toUpperCase() + type.slice(1);
        const config: ArgsProps = {
            message: displayTitle,
            description: message,
            placement,
        };
        notification[type](config);
      };

  useEffect(() => {
    const query = searchParams.get('q');
    
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const fetchedBooks = query ? await searchBooks(query) : await getBooks();
        setBooks(fetchedBooks);
      } catch (error) {
        showNotification('error', 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchParams]);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'genres') {
        const genresArray = value.split(',').map((genre, index) => ({
            title: genre.trim()
        }));
        setNewBook({ ...newBook, genres: genresArray });
    } else {
        setNewBook({ ...newBook, [name]: value });
    }
};

const handleAddBook = async () => {
  console.log(newBook);
    if (await addBook(newBook)) {
        showNotification('success', 'Book added successfully');
    } else {
        showNotification('error', 'Failed to add book');
    }
};

  if (error) return <div>Error: {error}</div>;
  if(!loading) return (
        <div className={styles.genContainer}>
        <div className={styles.bookGrid}>
            {currentBooks.map(book => (
            <Card >  
              <CardContent className={styles.bookCard}>
                  <Link key={book.id} href={`/books/${book.id}`} passHref>
                    <div className={styles.bookOverlay}></div>
                       <BookImage bookId={book.id} className={styles.bookImage} />
                    <div className={styles.bookName}>{book.title}</div>
                  </Link>
              </CardContent>
            </Card>
            ))}
        </div>
        {role === 'ADMIN' ? (<div className="ml-6 flex items-center  pb-3">
                            <Dialog>
                                <DialogTrigger asChild>
                                <button className="bg-primary text-white px-4 py-2 rounded mr-2">Add</button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                    <DialogTitle>Add book</DialogTitle>
                                    <DialogDescription>
                                        Add a book. Click save when you're done.
                                    </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="title" className="text-right">
                                        Title
                                        </Label>
                                        <Input id="title" name="title" type="text" value={newBook.title} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="author" className="text-right">
                                        Author
                                        </Label>
                                        <Input id="author" name="author" type="text" value={newBook.author} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="isbn" className="text-right">
                                        ISBN
                                        </Label>
                                        <Input id="isbn" name="isbn" type="text" value={newBook.isbn} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="publisher" className="text-right">
                                        Publisher
                                        </Label>
                                        <Input id="publisher" name="publisher" type="text" value={newBook.publisher} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="year" className="text-right">
                                        Year
                                        </Label>
                                        <Input id="year" name ="year" type="text" value={newBook.year} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="genres" className="text-right">
                                            Genres
                                        </Label>
                                        <Input
                                            id="genres"
                                            name="genres"
                                            type="text"
                                            value={newBook.genres.map(genre => genre.title).join(', ')}
                                            onChange={handleInputChange}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="description" className="text-right">Description</Label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                className="col-span-3 h-32 p-2 border rounded-md" 
                                                value={newBook.description}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button onClick={handleAddBook}>Save Changes</Button>
                                       </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            </div>) : null}
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