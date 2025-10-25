import Link from 'next/link';

interface Post {
  title: string;
  summary: string;
  imageUrl: string;
  id: string;
  category: string;
}

export default function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <div
      className="card border border-[#8888881A] rounded-lg overflow-hidden bg-white cursor-pointer"
      dir="rtl"
      onClick={onClick}
    >
      <img
        src={post.imageUrl}
        alt={post.title}
        className="w-full h-24 object-cover"
        onError={(e) => {
          e.currentTarget.src =
            'https://via.placeholder.com/300x200?text=כנסת';
        }}
      />
      <div className="p-2 text-right">
        <span className="text-xs text-[#0099FF] font-semibold mb-1">{post.category}</span>
        <h3 className="text-base font-sans font-light mb-1">{post.title}</h3>
        <p className="text-xs text-gray-600 mb-2">{post.summary.substring(0, 75)}...</p>
        <Link
          href={`/discover/post/${post.id}`}
          className="text-[#0099FF] text-xs hover:underline font-medium"
        >
          קרא עוד
        </Link>
      </div>
    </div>
  );
}