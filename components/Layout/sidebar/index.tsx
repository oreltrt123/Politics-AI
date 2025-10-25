'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { HeaderItem } from '@/types/menu';
import "@/components/Layout/sidebar/css/sidebar.css"
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Link } from 'lucide-react';

const Sidebar: React.FC = () => {
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
    <div className="">
<div className="area"></div><nav className="main-menu">
            <ul>
                <li>
                    <a href="/">
                        <i className="fa fa-home fa-2x"></i>
                        <span className="nav-text">
                           בית
                        </span>
                    </a>
                  
                </li>
                <li className="has-subnav">
                    <a href="/chat">
                        <i className="fa fa-globe fa-2x"></i>
                        <span className="nav-text">
                            צ'אט
                        </span>
                    </a>
                    
                </li>
            </ul>

            <ul className="logout">
                <li className='has-subnav'>
              <SignedOut>
                <Link
                  href="#"
                  className="bg-transparent border border-primary text-primary px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white"
                  onClick={() => {
                    setIsSignInOpen(true)
                    setNavbarOpen(false)
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="#"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  onClick={() => {
                    setIsSignUpOpen(true)
                    setNavbarOpen(false)
                  }}
                >
                  Sign Up
                </Link>
              </SignedOut>
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  userProfileMode="modal"
                  userProfileProps={{
                    appearance: {
                      elements: {
                        card: 'bg-white rounded-lg shadow-lg',
                      },
                    },
                  }}
                />
              </SignedIn>
                </li>  
            </ul>
        </nav>
    </div>
  );
};

export default Sidebar;