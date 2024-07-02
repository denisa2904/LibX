'use client';
import React, { use, useEffect, useState } from 'react';
import styles from './profile.module.css';
import { getUser, updateUser } from '@/api/user';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/api/auth';

interface User {
    username: string;
    email: string;
    password: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User>({
        username: "",
        email: "",
        password: "",
    });
    const [editable, setEditable] = useState(false);
    const isAuth = useAuth().isAuthenticated;
    useEffect(() => {
        getUser().then((data) => {
            if (!data) {
                window.location.href = '/login';
                return;
            }
            setUser({
                username: data.username,
                email: data.email,
                password: data.password
            });
        });
        
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const toggleEdit = () => {
        if (editable) {
            updateUser(user).then(() => {
                console.log('User updated');
            }).catch(error => {
                console.error('Failed to update user', error);
            });
        }
        setEditable(!editable);
    }
        if (!isAuth) {
            return null;
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
