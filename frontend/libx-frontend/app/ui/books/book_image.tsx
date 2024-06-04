import React, { useEffect, useState } from 'react';
import { fetchImage } from '@/api/get-individual-book';  
import { Skeleton } from "@/components/ui/skeleton"

const BookImage: React.FC<{ bookId: string; className?: string }> = ({ bookId, className }) => {
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
        fetchImage(bookId)
            .then(setImageUrl)
            .catch(error => console.error('Failed to load image:', error));
    }, [bookId]);

    if (!imageUrl) {
        return <div className="flex flex-col space-y-3">
            <Skeleton className="h-[280px] w-[180px] rounded-xl" />
        </div>
    }

    return (
        <img src={imageUrl} alt="Book Cover" style={{ width: 200, height: 300 }} />
    );
};

export default BookImage;
