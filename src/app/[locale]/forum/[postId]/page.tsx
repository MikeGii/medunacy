// src/app/[locale]/forum/[postId]/page.tsx
import PostDetailPage from '@/components/forum/PostDetailPage';
import { ForumProvider } from '@/contexts/ForumContext';

interface PostPageProps {
  params: {
    postId: string;
    locale: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  return (
    <ForumProvider>
      <PostDetailPage postId={params.postId} />
    </ForumProvider>
  );
}