'use client';
import React, { useEffect, useState } from 'react';
import styles from './profile.module.css';
import { useAuth } from '@/api/auth';
import { getUser, updateUser } from '@/api/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import Link from 'next/link';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}

export default function ProfilePage() {
    const user: User = {
        id: "1",
        username: "John Doe",
        email: "john.doe@yahoo.com",
        role: "USER"
    }
    const isAuth = useAuth();

    if (!isAuth) {
        window.location.href = '/login';
    }

    useEffect(() => {
        getUser().then((data) => {
            console.log(data);
            user.username = data.username;
            user.email = data.email;
            user.id = data.id;
            user.role = data.role;
        });
    }, []);

    const [editable, setEditable] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateUser({ ...user, [name]: value });
    };

    const toggleEdit = () => {
        setEditable(!editable);
    }

    return (
        <div className={styles.profileContainer}>
            <div className={styles.header}>
                <h1 className={styles.profileName}>{user.username}</h1>
                <Button onClick={toggleEdit} className={styles.editButton}>{editable ? 'Save' : 'Edit'}</Button>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">Username</Label>
                <Input id="username" name="username" type="text" value={user.username} disabled={!editable} onChange={handleInputChange} className="col-span-3" />
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" value={user.email} disabled={!editable} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className={styles.actions}>
                <Link href="/favorites">
                    <Button className={styles.favoritesButton}>Favorites</Button>
                </Link>
                <Link href="/rented">
                    <Button className={styles.rentedButton}>Rented Books</Button>
                </Link>
            </div>
        </div>
    );
}
