'use client';
import React, { useState, useEffect } from 'react';
import { Criteria, fetchBooksByCriteria } from '@/api/get-books'; 

const BooksComponent: React.FC = () => {
    const [books, setBooks] = useState<any[]>([]); 
    const initialCriteria: Criteria = {
        criteria: {
            author: ["J.K. Rowling"], 
            title: ["Harry Potter"],
        }
    };
    const [criteria, setCriteria] = useState<Criteria>(initialCriteria);

    useEffect(() => {
        fetchBooksByCriteria(criteria)
            .then(setBooks)
            .catch(error => console.error('Error fetching books:', error));
    }, [criteria]); // Re-fetch when criteria changes

    return (
        <div>
            <h1>Books</h1>
            {books.map(book => (
                <div key={book.id}> {/* Ensure that 'id' is a valid property of book */}
                    <h2>{book.title}</h2>
                    <p>Author: {book.author}</p>
                </div>
            ))}
        </div>
    );
}

export default BooksComponent;
