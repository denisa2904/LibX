'use client';
import React from 'react';
import SideNav from '@/app/ui/home/navbar';
import { AuthProvider } from '@/context/authcontext';

const Home = () => {
    return (
        <AuthProvider>
            <div>
                <main className="my-8">
                    {/* <CarouselDemo /> */}
                </main>
            </div>
        </AuthProvider>
    );
};

export default Home;
