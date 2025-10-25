// File: C:\Users\orel\Desktop\AIcumpos\app\api\posts\[id]\route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to resolve the Promise
    const resolvedParams = await params;
    const cacheFile = path.join(process.cwd(), 'public', 'posts_cache.json');
    const cacheContent = await fs.readFile(cacheFile, 'utf-8');
    const cachedData = JSON.parse(cacheContent);

    const post = cachedData.posts.find((p: any) => p.id === resolvedParams.id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}