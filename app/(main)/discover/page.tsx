'use client';

import { useState, useEffect, Suspense } from 'react'; // Add Suspense import
import { useUser } from '@clerk/nextjs';
import PostCard from '@/components/dsicover/PostCard';
import Header from '@/components/Layout/Header/Header_';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Layout/sidebar';

interface Post {
  title: string;
  summary: string;
  quote: string;
  sources: string[];
  imageUrl: string;
  videoUrl?: string;
  id: string;
  category: string;
}

// Separate component for the Discover content that uses useSearchParams
function DiscoverContent() {
  const { user, isLoaded } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('כל הקטגוריות');
  const [categories, setCategories] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/generate-news');
        if (!res.ok) throw new Error(`שגיאת HTTP! סטטוס: ${res.status}`);
        const data = await res.json();
        const postsWithId = data.posts.map((post: Post) => ({
          ...post,
          id: post.id || `post-${data.posts.indexOf(post)}`, // Ensure ID is set
          category: post.category || 'Uncategorized', // Fallback for missing category
        }));
        setPosts(postsWithId);

        const uniqueCategories: string[] = [
          'כל הקטגוריות',
          ...Array.from(new Set(postsWithId.map((p: Post) => p.category)) as Set<string>),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isLoaded]);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'כל הקטגוריות' || post.category === selectedCategory;
    const matchesSearch = !searchQuery || post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePostClick = (id: string) => {
    router.push(`/discover/post/${id}`);
  };

  return (
    <div dir="rtl" className="bg-white min-h-screen">
      <Header />
      <Sidebar />
      <main className="max-w-[90%] mx-auto py-4">
        <h1 className="text-2xl font-sans font-light mb-2 text-right text-gray-800">
          גלו את הדגשים של <span className='text-[#0099FF]'>הכנסת</span> השבוע
        </h1>

        {loading ? (
          <p className="text-right text-gray-500 text-sm">טוען חדשות...</p>
        ) : error ? (
          <div className="text-red-600 text-right text-sm">
            <p>שגיאה בטעינת החדשות: {error}. בדקו את הקונסול לפרטים.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              נסה שוב
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <p className="text-right text-gray-500 text-sm">אין פוסטים זמינים כרגע.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => handlePostClick(post.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Main page component with Suspense boundary
export default function Discover() {
  return (
    <Suspense fallback={<div className="text-right text-gray-500 text-sm">טוען...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}