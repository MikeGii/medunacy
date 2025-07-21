import PostDetailPage from '@/components/forum/PostDetailPage';

export default async function PostDetail({ 
  params 
}: { 
  params: Promise<{ postId: string; locale: string }> 
}) {
  const { postId } = await params;
  return <PostDetailPage postId={postId} />;
}