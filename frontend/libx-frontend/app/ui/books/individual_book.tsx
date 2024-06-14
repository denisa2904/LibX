import React, { useState, useEffect } from 'react';
import { Book, fetchImage} from '@/api/get-individual-book';  
import BookImage from './book_image'; 
import { Heart } from 'lucide-react';
import { addFavourite, removeFavourite , isFavourite} from '@/api/user';
import { useAuth } from '@/api/auth';
import { deleteBook, updateBook, updateBookPhoto } from '@/api/admin';
import { getRatings, RatingResponse, addRating, getUserRating } from '@/api/get-individual-book';
import { getIndividualBook } from '@/api/get-individual-book';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import styles from '@/app/books/books.module.css';
import { notification } from 'antd';
import type { ArgsProps } from 'antd/lib/notification';
import { NotificationPlacement } from 'antd/lib/notification/interface';


interface IndividualBookProps {
    params: { id: string };
}

const IndividualBook: React.FC<IndividualBookProps> = ({ params }) => {
    const [book, setBook] = useState<Book | null>(null);
    const [editableBook, setEditableBook] = useState<Book | undefined>();
    const { isAuthenticated } = useAuth();
    const { role } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false); 
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [rating, setRating] = useState<RatingResponse>(
        {
            rating: 0,
            numberRatings: 0
        }
    );
    const [userRating, setUserRating] = useState<number>(0);
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
        const getIndividualBookData = async () => {
            const bookData = await getIndividualBook(params.id);
            setBook(bookData);
        }
        const checkFavoriteStatus = async () => {
            const status = await isFavourite(params.id);
            setIsFavorited(status);
        };
        const fetchRatings = async () => {
            const rating = await getRatings(params.id);
            setRating(rating);
        }
        getIndividualBookData();
        fetchRatings();
        checkFavoriteStatus();
    }, [params.id]);


    useEffect(() => {
        async function fetchData() {
            try {
                const bookData = await getIndividualBook(params.id);
                setBook(bookData);
                setEditableBook(bookData);
                const status = await isFavourite(params.id);
                setIsFavorited(status);
                const ratings = await getRatings(params.id);
                setRating(ratings);
                if (isAuthenticated) {
                    const userRate = await getUserRating(params.id);
                    setUserRating(userRate);
                }
            } catch (error) {
                console.error('Initialization error:', error);
            }
        }
        fetchData();
    }, [params.id, isAuthenticated]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditableBook((prev: Book | undefined) => ({ ...prev, [name]: value } as Book));
    };
    
    const handleEditBook = async () => {
        if (!editableBook) return;

        try {
            if (await updateBook(editableBook)) {
                showNotification('success', 'Book updated successfully!');
                setBook(editableBook); 
            } else {
                showNotification('error', 'Failed to update book.');
            }
        } catch (error) {
            showNotification('error', 'Failed to update book.');
            console.error('Update error:', error);
        }
    };
      
    const updateImage = async () => {
        if (!imageFile) {
            showNotification('error', 'Please select an image to upload.');
            return;
        }
        try {
            const newImageUrl = await updateBookPhoto(params.id, imageFile);
            if (newImageUrl) {
                showNotification('success', 'Image updated successfully!');
                // window.location.reload();
                setBook(prevBook => {
                    window.location.reload();
                    if (prevBook === null) return null;
                    return { ...prevBook, imageUrl: newImageUrl };
                });
            } else {
                showNotification('error', 'Failed to update image.');
            }
        } catch (error) {
            showNotification('error', 'Failed to update image.');
            console.error('Image update error:', error);
        }
    };
    
    

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setImageFile(files[0]);
            return true;
        }
        return false;
    };
      

    const toggleFavorite = () => {
        if (isFavorited) {
            setIsFavorited(!isFavorited);
            removeFavourite(params.id);
        }
        else {
            setIsFavorited(!isFavorited);
            addFavourite(params.id);
        }
    };

    const handleRating = async (newRating: number) => {
        const previousUserRating = userRating;
        setUserRating(newRating); 
    
        try {
            await addRating(params.id, newRating); 
            const updatedRatings = await getRatings(params.id); 
            setRating(updatedRatings); 
            console.log('Rating updated successfully');
        } catch (error) {
            console.error('Failed to update rating:', error);
            setUserRating(previousUserRating); 
        }
    };
    

    return (
        <div className="p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex justify-center items-center">
                    <BookImage bookId={params.id} onUpdate={handleImageChange} className="w-full h-full object-cover rounded-md" />
                </div>
                <div className="md:w-2/3 flex flex-col">
                    <div className="flex">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">{book?.title}</h1>
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
                                        <Input id="title" name="title" type="text" value={editableBook?.title} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="author" className="text-right">
                                        Author
                                        </Label>
                                        <Input id="author" name="author" type="text" value={editableBook?.author} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="isbn" className="text-right">
                                        ISBN
                                        </Label>
                                        <Input id="isbn" name="isbn" type="text" value={editableBook?.isbn} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="publisher" className="text-right">
                                        Publisher
                                        </Label>
                                        <Input id="publisher" name="publisher" type="text" value={editableBook?.publisher} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="year" className="text-right">
                                        Year
                                        </Label>
                                        <Input id="year" name ="year" type="text" value={editableBook?.year} onChange={handleInputChange} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="genres" className="text-right">
                                            Genres
                                        </Label>
                                        <Input
                                            id="genres"
                                            name="genres"
                                            type="text"
                                            value={editableBook?.genres.map(genre => genre.title).join(', ')}
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
                                                value={editableBook?.description}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                    <DialogClose asChild>
                                        <Button onClick={updateImage}>Upload Image</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button onClick={handleEditBook}>Save Changes</Button>
                                    </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <button className="bg-red-500 text-white px-4 py-2 rounded"
                            onClick={() => deleteBook(params.id).then(() => window.location.replace('/books'))}
                            >Delete</button>
                            </div>) : null}
                        </div>
                    </div>
                    <div className={styles.text_detail}>
                        <span className={styles.font_bold_detail}>Author:</span> {book?.author}
                    </div>
                    <div className={styles.text_detail}>
                        <span className={styles.font_bold_detail}>ISBN:</span> {book?.isbn}
                    </div>
                    <div className={styles.text_detail}>
                        <span className={styles.font_bold_detail}>Publisher:</span> {book?.publisher}
                    </div>
                    <div className={styles.text_detail}>
                        <span className={styles.font_bold_detail}>Year:</span> {book?.year}
                    </div>
                    <div className={styles.text_detail}>
                        <span className={styles.font_bold_detail}>Average Rating:</span> {rating?.rating} from {rating?.numberRatings} ratings
                    </div>
                    {isAuthenticated && (
                        <div className={styles.text_detail}>
                            <div className="flex items-center">
                                <span className={styles.font_bold_detail}>Your rating:</span>
                                <div className="flex items-center ml-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRating(star)}
                                            className={`text-3xl ${star <= (userRating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={styles.text_detail}>
                        <span className={styles.font_bold_detail}>Genres:</span> {book?.genres.map(genre => genre.title).join(', ')}
                    </div>
                        
                </div>
            </div>
            <div className="mt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Description</h2>
                <p className="text-lg text-gray-600">{book?.description}</p>
            </div>
        </div>
    );
}

export default IndividualBook;
