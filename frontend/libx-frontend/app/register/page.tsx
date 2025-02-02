'use client';
import Head from 'next/head';
import RegisterForm from '@/app/ui/auth/register-form';  
import styles from '@/app/register/page.module.css';

export default function RegisterPage() {
    return (
        <>
            <Head>
                <title>Register</title>
                <meta name="description" content="Sign up for a new account" />
            </Head>
            <div className={"flex justify-center items-center"+styles.container}>
                <div className="p-4 shadow-lg rounded-lg bg-gray-200 max-w-md w-full">
                    <h1 className="text-center text-3xl font-bold">Sign Up</h1>
                    <RegisterForm />
                </div>
            </div>
        </>
    );
}