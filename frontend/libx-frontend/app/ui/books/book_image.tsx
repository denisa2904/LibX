import React, { useEffect, useState } from 'react';
import { fetchImage } from '@/api/get-individual-book';  // Adjust path as necessary

interface BookImageProps {
    bookId: string;
}

const BookImage: React.FC<{ bookId: string; className?: string }> = ({ bookId, className }) => {
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
        fetchImage(bookId)
            .then(setImageUrl)
            .catch(error => console.error('Failed to load image:', error));
    }, [bookId]);

    if (!imageUrl) {
        return <p>Loading image...</p>;
    }

    return (
        <img src={imageUrl} alt="Book Cover" style={{ maxWidth: '10%', height: 'auto' }} />
    );
};

export default BookImage;
