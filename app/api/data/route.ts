// app/api/data/route.ts
import { NextResponse } from 'next/server';
import { HeaderItem } from '@/types/menu';
import { featureddata } from '@/types/featureddata';

const headerData: HeaderItem[] = [
  { label: 'Chat', href: '/chat' },
  { label: 'FAQ', href: '#FAQ' },
  { label: 'Docs', href: '/documentation' },
];

const FeaturedData: featureddata[] = [
  { heading: 'Brand design for a computer brand.', imgSrc: '/images/featured/feat1.jpg' },
  { heading: 'Mobile app 3d wallpaper.', imgSrc: '/images/featured/feat2.jpg' },
  { heading: 'Brand design for a computer brand.', imgSrc: '/images/featured/feat1.jpg' },
  { heading: 'Mobile app 3d wallpaper.', imgSrc: '/images/featured/feat2.jpg' },
];

export const GET = async () => {
  try {
    console.log('API /api/data called');
    return NextResponse.json({ headerData, FeaturedData });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};