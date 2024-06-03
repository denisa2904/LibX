import React from 'react';
import { Book, Genre } from '@/api/get-individual-book';  // Adjust the path as necessary
import BookImage from './book_image';  // Adjust the path as necessary

interface IndividualBookProps {
    book: Book;
}

const IndividualBook: React.FC<IndividualBookProps> = ({ book }) => {
    return (
        <div className = "flex flex-col gap-4">
            <h1 className = "text-3xl font-semibold">{book.title}</h1>
            <BookImage bookId={book.id} className="w-32 h-32 object-cover"/>
            <div className = "flex flex-col gap-2">
                <p><span className = "font-semibold">Author:</span> {book.author}</p>
                <p><span className = "font-semibold">ISBN:</span> {book.isbn}</p>
                <p><span className = "font-semibold">Publisher:</span> {book.publisher}</p>
                <p><span className = "font-semibold">Year:</span> {book.year}</p>
                <p><span className = "font-semibold">Rating:</span> {book.rating}</p>
                <p>
                    <span className="font-semibold">Genres:</span> 
                    {book.genres.map((genre: Genre) => genre.title).join(', ')}
                </p>
                <p><span className = "font-semibold">Description:</span> {book.description}</p>
            </div>
        </div>
    );
}

export default IndividualBook;

