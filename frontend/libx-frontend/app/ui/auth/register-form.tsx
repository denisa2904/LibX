'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { register as registerUser } from '@/api/auth';

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export default function RegisterForm() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit = async (data: any) => {
        try {
            const response = await registerUser(data); 
            console.log('Registration successful:', response);
            setErrorMessage('');
        } catch (error: any) {
            console.error('Registration error:', error);
            setErrorMessage(error.message || 'Failed to register');
        }
    };


  return (
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
                placeholder="Choose a unique username"
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="mb-3 mt-5 block text-xs font-medium text-gray-900">
              Email
            </label>
            <div className="relative">
              <input
                {...register("email")}
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                type="email"
                placeholder="Enter your email address"
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
                    placeholder="Enter password"
                />
                <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
        </div>
        <Button type="submit" className="mt-4 w-full">
          Register <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        {errorMessage && (
          <div className="flex h-8 items-center space-x-1">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">{errorMessage}</p>
          </div>
        )}
      </div>
    </form>
  );
}

