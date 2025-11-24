import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Trash2, Heart } from 'lucide-react';
import { supabase, Post, Comment } from '../lib/supabase';
import { generateAvatarUrl, generateRandomSeed } from '../utils/avatars';
import { getTimeRemaining, getRelativeTime } from '../utils/time';
import { CommentSection } from '../components/CommentSection';
import { useAuth } from '../contexts/AuthContext';

interface PostDetailProps {
  postId: string;
  onBack: () => void;
}

export function PostDetail({ postId, onBack }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        alert('Post not found or has expired');
        onBack();
        return;
      }

      setPost(data);
      setTimeRemaining(getTimeRemaining(data.expires_at));
    } catch (error) {
      console.error('Error fetching post:', error);
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();

    const commentsChannel = supabase
      .channel('comments_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      if (post) {
        setTimeRemaining(getTimeRemaining(post.expires_at));
      }
    }, 60000);

    return () => {
      supabase.removeChannel(commentsChannel);
      clearInterval(interval);
    };
  }, [postId]);

  const handleAddComment = async (nickname: string, content: string) => {
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      nickname,
      content,
      avatar_seed: generateRandomSeed(),
    });

    if (error) throw error;
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      alert('Post deleted successfully');
      onBack();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-rose-600 hover:text-rose-800 mb-6 font-bold transition-colors bg-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl"
        >
          <ArrowLeft size={22} />
          Back to Secrets
        </button>

        <div className="bg-gradient-to-br from-white via-rose-50/50 to-pink-50/50 backdrop-blur-sm rounded-3xl p-10 shadow-2xl mb-10 border-2 border-rose-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-red-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-start gap-8 mb-8">
              <img
                src={generateAvatarUrl(post.avatar_seed)}
                alt={post.nickname}
                className="w-28 h-28 rounded-full border-4 border-rose-300 shadow-xl ring-4 ring-rose-100/50"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-4xl font-bold text-gray-900">{post.nickname}</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 font-medium bg-white/80 px-4 py-2 rounded-full shadow-sm">
                      {getRelativeTime(post.created_at)}
                    </span>
                    {user && (
                      <button
                        onClick={handleDeletePost}
                        className="text-red-500 hover:text-red-700 transition-colors bg-red-50 p-3 rounded-full hover:bg-red-100"
                        title="Delete post"
                      >
                        <Trash2 size={22} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-rose-700 font-bold mb-6 bg-rose-50 px-4 py-2 rounded-full inline-flex">
                  <Clock size={20} />
                  <span className="text-lg">Expires in {timeRemaining}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-rose-100">
              <p className="text-gray-800 text-2xl leading-relaxed whitespace-pre-wrap font-medium">
                {post.content}
              </p>
            </div>
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-6 py-3 rounded-full shadow-md">
                <Heart size={24} className="fill-rose-600" />
                <span className="font-bold text-lg">Romantic Secret</span>
              </div>
            </div>
          </div>
        </div>

        <CommentSection comments={comments} onAddComment={handleAddComment} />
      </div>
    </div>
  );
}
