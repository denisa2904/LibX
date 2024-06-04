import React, { useState, useEffect } from 'react';
import { Book, Genre } from '@/api/get-individual-book';  
import BookImage from './book_image'; 
import { Heart } from 'lucide-react';
import { addFavourite, removeFavourite , isFavourite} from '@/api/actions';
import { useAuth } from '@/api/auth';
import { deleteBook } from '@/api/admin';
interface IndividualBookProps {
    book: Book;
}

const IndividualBook: React.FC<IndividualBookProps> = ({ book }) => {
    const { isAuthenticated } = useAuth();
    const { role } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false); 

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            const status = await isFavourite(book.id);
            setIsFavorited(status);
        };

        checkFavoriteStatus();
    }, [book.id]);

    const toggleFavorite = () => {
        if (isFavorited) {
            setIsFavorited(!isFavorited);
            removeFavourite(book.id);
        }
        else {
            setIsFavorited(!isFavorited);
            addFavourite(book.id);
        }
    };

    return (
        <div className="p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex justify-center items-center">
                    <BookImage bookId={book.id} className="w-full h-full object-cover rounded-md" />
                </div>
                <div className="md:w-2/3 flex flex-col">
                    <div className="flex">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">{book.title}</h1>
                        <div className="flex">
                            {isAuthenticated ?(
                            <Heart
                                size={50}
                                onClick={toggleFavorite} 
                                className={`pl-2 pb-3  ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                            >
                            </Heart>
                            ) : null}
                            {role === 'ADMIN' ? (<div className="ml-6 flex items-center  pb-3">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Edit</button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded"
                            onClick={() => deleteBook(book.id).then(() => window.location.reload())}
                            >Delete</button>
                            </div>) : null}
                        </div>
                    </div>
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
