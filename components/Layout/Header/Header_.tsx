'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { HeaderItem } from '@/types/menu';
import Logo from './Logo';
import HeaderLink from './Navigation/HeaderLink';
import MobileHeaderLink from './Navigation/MobileHeaderLink';
import { Icon } from '@iconify/react/dist/iconify.js';
import { SignIn, SignUp, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { MagnifyingGlassIcon, ImageIcon } from '@radix-ui/react-icons';
import "./css/Header.css";

const Header: React.FC = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [headerData, setHeaderData] = useState<HeaderItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const navbarRef = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLDivElement>(null);
  const signUpRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleScroll = () => {
    setSticky(window.scrollY >= 80);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (signInRef.current && !signInRef.current.contains(event.target as Node)) {
      setIsSignInOpen(false);
    }
    if (signUpRef.current && !signUpRef.current.contains(event.target as Node)) {
      setIsSignUpOpen(false);
    }
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && navbarOpen) {
      setNavbarOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navbarOpen, isSignInOpen, isSignUpOpen]);

  useEffect(() => {
    if (isSignInOpen || isSignUpOpen || navbarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isSignInOpen, isSignUpOpen, navbarOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${pathname}?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className={`header__wrapper w-[97.5%]`}>
      <div className="header">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfTL7cfyMC2Dk6zuEhFJnLihh3k-JMCGPsRQ&s" alt="" className="header__Logo" />
        <form className="header__input" onSubmit={handleSubmit}>
          <MagnifyingGlassIcon className="header__icon" />
          <input
            type="text"
            className="header__inputField"
            placeholder="חפש פוסטים לפי קטגוריה למשל ... (פוליטיקה.. )"
            value={searchQuery}
            onChange={handleSearch}
          />
          {/* <ImageIcon className="header__icon" /> */}
        </form>
      </div>
    </div>
  );
};

export default Header;