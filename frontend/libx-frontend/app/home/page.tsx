'use client';
import React, {useEffect, useState} from 'react';
import Image from 'next/image';
import styles from './home.module.css';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { useAuth } from '@/api/auth';

interface Genre {
  id: number;
  title: string;
  image_url: string;
}

export default function HomePage() {
  const genres: Genre[] = [
    {
      id: 1,
      title: 'Romance',
      image_url: '/romance.jpg',
    },
    {
      id: 2,
      title: 'Science Fiction',
      image_url: '/science_fiction.jpg',
    },
    {
      id: 3,
      title: 'Action',
      image_url: '/action.jpg',
    },
    {
      id: 4,
      title: 'Juvenile',
      image_url: '/children_book.jpg',
    },
    {
      id: 5,
      title: 'History',
      image_url: '/history_book.jpg',
    },
    {
        id: 6,
        title: 'Mystery',
        image_url: '/mystery.jpg',
    },
    {
      id: 7,
      title: 'Thriller',
      image_url: '/thriller.jpg',
    }
     
  ];
  const isAuth = useAuth().isAuthenticated;
  const [profileLink, setProfileLink] = useState('');

  useEffect(() => {
    if (isAuth === false) {
      setProfileLink('/login');
    } else {
      setProfileLink('/profile');
    }
  }, [isAuth]);

  console.log(profileLink);
  console.log(isAuth);


  return (
    <div className={styles.backgroundContainer}>
      <div className={`${styles.contentContainer} p-4 md:p-8 rounded-lg space-y-4`}>
        <div className="h-40"></div>
        <h1 className="text-4xl md:text-6xl font-bold">Welcome to LibX</h1>
        <p className="text-base md:text-lg text-gray-800">Your personal library management system.</p>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
            <Link href="/books" passHref>
          <div className={`p-4 bg-primary text-white shadow-lg hover:shadow-xl rounded-lg cursor-pointer`}>
            <h2 className="text-xl md:text-2xl font-semibold">Books</h2>
            <p>Browse and manage your book collection.</p>
          </div>
            </Link>
            {(profileLink=='/profile') ? (
                <Link href={profileLink} passHref>
                <div className={`p-4 bg-primary text-white shadow-lg hover:shadow-xl rounded-lg cursor-pointer`}>
                    <h2 className="text-xl md:text-2xl font-semibold">Profile</h2>
                    <p>View and manage your profile.</p>
                </div>
                </Link>
               ) : (
                <Link href={profileLink} passHref>
                <div className={`p-4 bg-primary text-white shadow-lg hover:shadow-xl rounded-lg cursor-pointer`}>
                    <h2 className="text-xl md:text-2xl font-semibold">Log In</h2>
                    <p>Log in or create an account.</p>
                </div>
                </Link>
               )
            }
        </div>
        <div className="h-8"></div>
        <h2 className="text-xl md:text-2xl font-semibold mt-8 md:mt-16">Genres</h2>
        <Carousel className={styles.CarouselContainer}
        plugins={
            [
                Autoplay({
                delay: 5000,
                }),
            ]
            
        }>
          <CarouselContent className="">
            {genres.map((genre, index) => (
              <CarouselItem key={index} className={styles.carousel_item_size}>
                <div className="p-1">
                    <div className={styles.genreCard}>
                    <Link key={genre.id} href={`/books/genre/${genre.title}`} passHref>
                      <Image
                        src={genre.image_url}
                        alt={genre.title}
                        layout="fill"
                        objectFit="cover"
                        className={styles.genreImage}
                      />
                      <div className={styles.genreOverlay}>{genre.title}</div>
                      </Link>
                    </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
     </div>
  );
}

