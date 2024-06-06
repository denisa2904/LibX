'use client';
import React from 'react';
import SideNav from '@/app/ui/home/navbar';
import styles from '@/app/books/books.module.css'; // Adjust the import path according to your structure
import { useDebouncedCallback } from 'use-debounce';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Layout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    if(term){
      console.log(`Searching for ${term}`);
      params.set('q', term);
    }
    else{
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);
  
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full md:w-64 md:flex md:flex-col md:min-h-screen">
        <SideNav />
      </div>
      <div className="flex flex-col flex-grow">
        <div className={`${styles.searchContainer} bg-gray-100 shadow-md`}>
          <input type="text" placeholder="Search books"
          onChange={(e) => handleSearch(e.target.value)} 
          className={styles.searchInput} />
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
