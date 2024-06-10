import React, { useState, useEffect } from 'react';
import { Book, Genre } from '@/api/get-individual-book';  
import BookImage from './book_image'; 
import { Heart } from 'lucide-react';
import { addFavourite, removeFavourite , isFavourite} from '@/api/actions';
import { useAuth } from '@/api/auth';
import { deleteBook, updateBook, updateBookPhoto } from '@/api/admin';
import { getRatings, RatingResponse } from '@/api/get-individual-book';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
interface IndividualBookProps {
    book: Book;
    onRatingUpdate?: (newRating: number) => Promise<void>;
}

const IndividualBook: React.FC<IndividualBookProps> = ({ book }) => {
    const { isAuthenticated } = useAuth();
    const { role } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false); 
    const [editableBook, setEditableBook] = useState<Book>(book);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [rating, setRating] = useState<RatingResponse>(
        {
            rating: 0,
            numberRatings: 0
        }
    );
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            const status = await isFavourite(book.id);
            setIsFavorited(status);
        };
        const fetchRatings = async () => {
            const rating = await getRatings(book.id);
            setRating(rating);
        }
        fetchRatings();
        checkFavoriteStatus();
    }, [book.id]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'genres') {
            const genresArray = value.split(',').map((genre, index) => ({
                title: genre.trim()
            }));
            setEditableBook({ ...editableBook, genres: genresArray });
        } else {
            setEditableBook({ ...editableBook, [name]: value });
        }
    };
    
    const handleEditBook = async () => {
        if (await updateBook(editableBook)) {
            alert("Book updated successfully!");
            window.location.reload();
        } else {
            alert("Failed to update the book.");
        }
    };
    
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImageFile(event.target.files[0]);
        }
    };
    const updateImage = async () => {
        if (!imageFile) {
            alert("Please select an image file first.");
            return;
        }
        const success = await updateBookPhoto(book.id, imageFile);
        if (success) {
            alert("Image updated successfully!");
            window.location.reload();
        } else {
            alert("Failed to update image.");
        }
    };

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
                            <Dialog>
                                <DialogTrigger asChild>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Edit</button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                    <DialogTitle>Edit profile</DialogTitle>
                                    <DialogDescription>
                                        Edit this book's details here. Click save when you're done.
                                    </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="image" className="text-right">
                                            Book Image
                                        </Label>
                                        <Input id="image" name="image" type="file" onChange={handleImageChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="title" className="text-right">
                                        Title
                                        </Label>
                                        <Input id="title" name="title" type="text" value={editableBook.title} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="author" className="text-right">
                                        Author
                                        </Label>
                                        <Input id="author" name="author" type="text" value={editableBook.author} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="isbn" className="text-right">
                                        ISBN
                                        </Label>
                                        <Input id="isbn" name="isbn" type="text" value={editableBook.isbn} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="publisher" className="text-right">
                                        Publisher
                                        </Label>
                                        <Input id="publisher" name="publisher" type="text" value={editableBook.publisher} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="year" className="text-right">
                                        Year
                                        </Label>
                                        <Input id="year" name ="year" type="text" value={editableBook.year} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="genres" className="text-right">
                                            Genres
                                        </Label>
                                        <Input
                                            id="genres"
                                            name="genres"
                                            type="text"
                                            value={editableBook.genres.map(genre => genre.title).join(', ')}
                                            onChange={handleInputChange}
                                            className="col-span-3"
                                        />
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="description" className="text-right">Description</Label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                className="col-span-3 h-32 p-2 border rounded-md" // Set height, padding, border, and rounding as needed
                                                value={editableBook.description}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                    <Button onClick={updateImage}>Upload Image</Button>
                                    <Button onClick={handleEditBook}>Save Changes</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <button className="bg-red-500 text-white px-4 py-2 rounded"
                            onClick={() => deleteBook(book.id).then(() => window.location.replace('/books'))}
                            >Delete</button>
                            </div>) : null}
                        </div>
                    </div>
                    <p className="text-lg text-gray-600 mb-2"><span className="font-semibold text-gray-700">Author:</span> {book.author}</p>
                    <p className="text-lg text-gray-600 mb-2"><span className="font-semibold text-gray-700">ISBN:</span> {book.isbn}</p>
                    <p className="text-lg text-gray-600 mb-2"><span className="font-semibold text-gray-700">Publisher:</span> {book.publisher}</p>
                    <p className="text-lg text-gray-600 mb-2"><span className="font-semibold text-gray-700">Year:</span> {book.year}</p>
                    <p className="text-lg text-gray-600 mb-2"><span className="font-semibold text-gray-700">Rating:</span> {rating?.rating} from {rating?.numberRatings} ratings</p>
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
