'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs'; // Assuming Clerk for authentication
import { useParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import  Sidebar  from '@/components/Layout/sidebar';

interface Post {
  title: string;
  summary: string;
  quote: string;
  sources: string[];
  imageUrl: string;
  videoUrl?: string;
}

export default function PostPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, isLoaded } = useUser(); // Using Clerk instead of Supabase auth
  const [prompt, setPrompt] = useState('');
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (!data.post) throw new Error('Post not found');
        setPost(data.post);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, isLoaded]);

  if (loading) return <p>Loading post...</p>;
  if (error || !post) return <p className="text-red-600">Error: {error || 'Post not found'}</p>;

  const startChat = () => {
    if (!prompt.trim()) return alert('Enter a question');
    const chatId = uuidv4();
    localStorage.setItem(`chat-${chatId}`, JSON.stringify({ post, initialPrompt: prompt }));
    window.location.href = `/chat/${chatId}`; // Using window.location for simplicity
  };

  return (
    <div className="card max-w-2xl mx-auto p-4" dir="rtl">
      <Sidebar />
      <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
      <p className="mb-2">{post.summary}</p>
      <blockquote className="my-2 italic text-sm">{post.quote}</blockquote>
      <img src={post.imageUrl} alt={post.title} className="rounded w-full h-48 object-cover mb-2" />
      {post.videoUrl && <iframe src={post.videoUrl} className="mt-2 w-full h-32" allowFullScreen />}
      <h3 className="mt-2 font-bold text-lg">Sources</h3>
      <ul className="list-disc pl-4 mb-2">
        {post.sources.map((src, i) => <li key={i}><a href={src} target="_blank" className="text-blue-600 text-sm">{src}</a></li>)}
      </ul>
      <div className="mt-4">
        <h3 className="font-bold text-lg">Ask AI About This Post</h3>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Explain more..."
          className="w-full p-2 border rounded mt-1 text-sm"
        />
        <button onClick={startChat} className="mt-1 bg-blue-600 text-white p-1 rounded text-sm">Start Chat</button>
      </div>
    </div>
  );
}