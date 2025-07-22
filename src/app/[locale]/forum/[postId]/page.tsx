// src/app/[locale]/forum/[postId]/page.tsx
import PostDetailPage from '@/components/forum/PostDetailPage';
import { ForumProvider } from '@/contexts/ForumContext';

interface PostPageProps {
  params: Promise<{
    postId: string;
    locale: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  // Await the params as required by Next.js 15
  const { postId } = await params;
  
  return (
    <ForumProvider>
      <PostDetailPage postId={postId} />
    </ForumProvider>
  );
}