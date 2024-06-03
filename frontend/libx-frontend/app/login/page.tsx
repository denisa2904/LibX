'use client';
import Head from 'next/head';
import LoginForm from '@/app/ui/auth/login-form';

export default function LoginPage() {
    return (
        <>
            <Head>
                <title>Login</title>
                <meta name="description" content="Login to your account" />
            </Head>
            <div className="flex min-h-screen bg-gray-300 justify-center items-center">
                <div className="p-4 shadow-lg rounded-lg bg-gray-200 max-w-md w-full">
                    <h1 className="text-center text-3xl font-bold">Log In</h1>
                    <LoginForm />
                </div>
            </div>
        </>
    );
}