'use client';
import React, { useState } from 'react';
import SideNav from '@/app/ui/home/navbar';
import styles from '@/app/books/books.module.css'; // Adjust the import path according to your structure
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import path from 'path';

export default function Layout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const term = (event.target as HTMLInputElement).value;
      const params = new URLSearchParams(searchParams);
      if (term) {
        console.log(`Searching for ${term}`);
        params.set('q', term);
      } else {
        params.delete('q');
      }
      replace(`/books?${params.toString()}`);
      setSearchTerm(''); // Clear the input field after search
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputElement = event.target as HTMLInputElement;
    setSearchTerm(inputElement.value); // Update searchTerm state on every change
  };

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full md:w-64 md:flex md:flex-col md:min-h-screen">
        <SideNav />
      </div>
      <div className="flex flex-col flex-grow">
        <div className={`${styles.searchContainer} bg-gray-100 shadow-md`}>
            <input
              type="text"
              placeholder="Search books"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyPress={handleSearch}
              className={styles.searchInput} />
              {pathname === '/books' && (
              <button
                onClick={() => {/* Implement filter logic */}}
                className={`${styles.filterButton} ml-2 px-4 py-2 rounded bg-accent text-white hover:bg-primary`}
              >
                Filter
              </button>
            )}
          </div>
          <div className="flex-grow p-6 overflow-y-auto">
              {children}
            </div>
      </div>
    </div>
  );
}
