import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
    return (
        <main className = "flex h-full flex-col items-center justify-center gap-2">
            <FaceFrownIcon className = "h-8 w-8 text-gray-500" />
            <h2 className = "text-2xl font-semibold">404 Not found</h2>
            <p className = "text-gray-600">The book you are looking for does not exist.</p>
            <Link href = "/books">
                <a className = "text-blue-600 hover:underline">Go back to home</a>
            </Link>
        </main>
    );
}