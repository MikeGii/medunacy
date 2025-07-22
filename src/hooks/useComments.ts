import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ForumComment } from '@/types/forum.types';
import { FORUM_CONSTANTS } from '@/utils/forum.constants';

export function useComments(postId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!user || !postId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: commentsData, error: fetchError } = await supabase
        .from('forum_comments')
        .select(`
          *,
          users!user_id (
            user_id,
            first_name,
            last_name,
            role
          )
        `)
        .eq('post_id', postId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch likes for comments
      const commentIds = commentsData?.map(c => c.id) || [];
      const { data: likesData } = await supabase
        .from('forum_likes')
        .select('comment_id, user_id')
        .in('comment_id', commentIds)
        .not('comment_id', 'is', null);

      // Transform comments
      const transformedComments: ForumComment[] = (commentsData || []).map(comment => {
        const commentLikes = likesData?.filter(l => l.comment_id === comment.id) || [];
        const userHasLiked = commentLikes.some(l => l.user_id === user.id);

        return {
          ...comment,
          user: comment.users,
          likes_count: commentLikes.length,
          user_has_liked: userHasLiked,
        };
      });

      setComments(transformedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(FORUM_CONSTANTS.ERROR_KEYS.FETCH_COMMENTS);
    } finally {
      setLoading(false);
    }
  }, [postId, user]);

  // Create comment
  const createComment = useCallback(async (content: string) => {
    if (!user || !postId || !content.trim()) {
      return { success: false, error: 'Invalid input' };
    }

    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('forum_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
        })
        .select(`
          *,
          users!user_id (
            user_id,
            first_name,
            last_name,
            role
          )
        `)
        .single();

      if (insertError) throw insertError;

      const newComment: ForumComment = {
        ...data,
        user: data.users,
        likes_count: 0,
        user_has_liked: false,
      };

      setComments(prev => [newComment, ...prev]);
      return { success: true, data: newComment };

    } catch (err) {
      console.error('Error creating comment:', err);
      setError(FORUM_CONSTANTS.ERROR_KEYS.CREATE_COMMENT);
      return { success: false, error: err };
    }
  }, [user, postId]);

  // Update comment
  const updateComment = useCallback(async (commentId: string, content: string) => {
    if (!user || !content.trim()) {
      return { success: false, error: 'Invalid input' };
    }

    try {
      const { error: updateError } = await supabase
        .from('forum_comments')
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId);

      if (updateError) throw updateError;

      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? { ...comment, content: content.trim() }
          : comment
      ));

      return { success: true };

    } catch (err) {
      console.error('Error updating comment:', err);
      setError(FORUM_CONSTANTS.ERROR_KEYS.UPDATE_COMMENT);
      return { success: false, error: err };
    }
  }, [user]);

  // Delete comment
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error: deleteError } = await supabase.rpc('soft_delete_comment', {
        comment_id: commentId,
      });

      if (deleteError) throw deleteError;

      if (data && !data.success) {
        throw new Error(data.error || 'Failed to delete comment');
      }

      setComments(prev => prev.filter(c => c.id !== commentId));
      return { success: true };

    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(FORUM_CONSTANTS.ERROR_KEYS.DELETE_COMMENT);
      return { success: false, error: err };
    }
  }, [user]);

  // Toggle like
  const toggleCommentLike = useCallback(async (commentId: string) => {
    if (!user) return;

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    try {
      if (comment.user_has_liked) {
        await supabase
          .from('forum_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        setComments(prev => prev.map(c =>
          c.id === commentId
            ? { ...c, likes_count: Math.max(0, c.likes_count - 1), user_has_liked: false }
            : c
        ));
      } else {
        await supabase
          .from('forum_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });

        setComments(prev => prev.map(c =>
          c.id === commentId
            ? { ...c, likes_count: c.likes_count + 1, user_has_liked: true }
            : c
        ));
      }
    } catch (err) {
      console.error('Error toggling comment like:', err);
      await fetchComments();
    }
  }, [user, comments, fetchComments]);

  // Load comments on mount
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
    clearError: () => setError(null),
  };
}