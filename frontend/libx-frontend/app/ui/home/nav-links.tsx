'use client';
import {HomeIcon} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { BookOpen, LogIn, User2Icon, LogOut } from 'lucide-react';
import { useAuth, logout } from '@/api/auth';


const links = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'Books', href: '/books', icon: BookOpen },
];

const NavLinks: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      window.location.reload();
    } else {
      alert('Logout failed!');
    }
  };

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-secondary hover:text-green-900 md:flex-none md:justify-start md:p-2 md:px-3',
              { 'bg-secondary primary-green': pathname === link.href },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
        {isAuthenticated ? (
        <>
          <Link
            key="Profile"
            href="/dashboard"
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-secondary hover:text-green-900 md:flex-none md:justify-start md:p-2 md:px-3',
              { 'bg-secondary primary-green': pathname === '/dashboard' },
            )}
          >
            <User2Icon className="w-6" />
            <p className="hidden md:block">Profile</p>
          </Link>
          <button
            onClick={handleLogout}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-secondary hover:text-green-900 md:flex-none md:justify-start md:p-2 md:px-3'
            )}
          >
            <LogOut className="w-6" />
            <p className="hidden md:block">Logout</p>
          </button>
        </>
      ) : (
        <Link
          key="Log In"
          href="/login"
          className={clsx(
            'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-secondary hover:text-green-900 md:flex-none md:justify-start md:p-2 md:px-3',
            { 'bg-secondary primary-green': pathname === '/login' },
          )}
        >
          <LogIn className="w-6" />
          <p className="hidden md:block">Log In</p>
        </Link>
      )}
    </>
  );
};

export default NavLinks;