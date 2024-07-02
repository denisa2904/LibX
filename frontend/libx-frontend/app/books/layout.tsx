'use client';
import React, { useState, useEffect } from 'react';
import SideNav from '@/app/ui/home/navbar';
import { fetchAuthors, fetchGenres, fetchPublishers} from '@/api/get-books';
import styles from '@/app/books/books.module.css';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

export default function Layout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [searchTerm, setSearchTerm] = useState(''); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [authors, setAuthors] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);

  useEffect(() => {
    if (isDialogOpen) {
      const fetchData = async () => {
        try {
          const authorsData = await fetchAuthors();
          const genresData = await fetchGenres();   
          const publishersData = await fetchPublishers(); 
          setAuthors(authorsData);
          setGenres(genresData);
          setPublishers(publishersData);
        } catch (error) {
          console.error('Error fetching filter data:', error);
        }
      };
      fetchData();
    }
  }, [isDialogOpen]);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const term = (event.target as HTMLInputElement).value;
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set('q', term);
      } else {
        params.delete('q');
      }
      replace(`/books?${params.toString()}`);
      setSearchTerm('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const criteria = {
      author: [formData.get('author') as string],
      genre: [formData.get('genre') as string],
      publisher: [formData.get('publisher') as string],
      rating: [formData.get('rating') as string]
    };

    localStorage.setItem('searchCriteria', JSON.stringify(criteria));

    replace('/books/criteria');
    closeDialog();
};


  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
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
            className={styles.searchInput}
          />
          {pathname === '/books' && (
            <>
              <button
                onClick={openDialog}
                className={`${styles.filterButton} ml-2 px-4 py-2 rounded bg-accent text-white hover:bg-primary`}
              >
                Filter
              </button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogTitle>Filter Books</DialogTitle>
                <DialogDescription>
                  Adjust the filters to refine your search results.
                </DialogDescription>
                <form onSubmit={handleFilterSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label htmlFor="author-select">Author:</label>
                      <select id="author-select" name="author">
                        {authors.map(author => (
                          <option key={author} value={author}>{author}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="genre-select">Genre:</label>
                      <select id="genre-select" name="genre">
                        {genres.map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="publisher-select">Publisher:</label>
                      <select id="publisher-select" name="publisher">
                        {publishers.map(publisher => (
                          <option key={publisher} value={publisher}>{publisher}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="rating">Minimum Rating:</label>
                    <input type="number" id="rating" name="rating" min="0" max="5" step="0.1" />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-accent text-white hover:bg-primary"
                    >
                      Apply Filters
                    </button>
                  </div>

                </form>
              </DialogContent>
            </Dialog>

            </>
          )}
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
