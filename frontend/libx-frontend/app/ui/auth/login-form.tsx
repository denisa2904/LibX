'use client';
import { use, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { login as logUser, useAuth } from '@/api/auth';
import { useRouter } from 'next/navigation';


const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(4, "Password must be at least 4 characters")
});

export default function LoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const { setIsAuthenticated } = useAuth();
   

    const onSubmit = async (data: any) => {
        try {
            const response = await logUser(data); 
            if(response){
                console.log('Login successful:', response);
                setErrorMessage('');
                setIsAuthenticated(true);
                router.push('/profile');
            }
            else{
                setErrorMessage('Failed to login');
                console.error('Login error:', response);
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setErrorMessage(error.message || 'Failed to login');
        }
    };

    return(
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="w-full">
                <div>
                    <label htmlFor="username" className="mb-3 mt-5 block text-xs font-medium text-gray-900">
                        Username
                    </label>
                    <div className="relative">
                        <input
                            {...register("username")}
                            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                            type="text"
                            placeholder="Enter your username"
                        />
                        <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                    </div>
                </div>
                <div>
                    <label htmlFor="password" className="mb-3 mt-5 block text-xs font-medium text-gray-900">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            {...register("password")}
                            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                            type="password"
                            placeholder="Enter your password"
                        />
                        <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <Link href = '/register'>
                    <span className="text-sm text-blue-500">Don't have an account? Create one now.</span>
                </Link>
            </div>
            <div className="flex items-center justify-between">
                <Button type="submit" className="w-full mt-5">
                    Login
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Button>
            </div>
            {errorMessage && (
                <div className="flex items-center space-x-2 text-red-500 text-sm">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    <span>{errorMessage}</span>
                </div>
            )}
        </form>
    )
}