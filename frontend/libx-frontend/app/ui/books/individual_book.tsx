import React from 'react';
import { Book, Genre } from '@/api/get-individual-book';  // Adjust the path as necessary
import BookImage from './book_image';  // Adjust the path as necessary

interface IndividualBookProps {
    book: Book;
}

const IndividualBook: React.FC<IndividualBookProps> = ({ book }) => {
    return (
        <div className="p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex justify-center items-center">
                    <BookImage bookId={book.id} className="w-full h-full object-cover rounded-md" />
                </div>
                <div className="md:w-2/3 flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{book.title}</h1>
                    <p className="text-lg text-gray-600 mb-2"><span className="font-semibold text-gray-700">Author:</span> {book.author}</p>
                    <p className="text-lg text-gray-600 mb-2"><span className="font-semibold text-gray-700">ISBN:</span> {book.isbn}</p>
                    <p className="text-lg text-gray-600 mb-2"><span className="font-semibold text-gray-700">Publisher:</span> {book.publisher}</p>
                    <p className="text-lg text-gray-600 mb-2"><span className="font-semibold text-gray-700">Year:</span> {book.year}</p>
                    <p className="text-lg text-gray-600 mb-2"><span className="font-semibold text-gray-700">Rating:</span> {book.rating}</p>
                    <p className="text-lg text-gray-600 mb-2">
                        <span className="font-semibold text-gray-700">Genres:</span> {book.genres.map((genre: Genre) => genre.title).join(', ')}
                    </p>
                </div>
            </div>
            <div className="mt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Description</h2>
                <p className="text-lg text-gray-600">{book.description}</p>
            </div>
        </div>
    );
}

export default IndividualBook;
