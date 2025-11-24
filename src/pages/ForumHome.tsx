import { useState, useEffect } from 'react';
import { Plus, Users, MessageSquare, TrendingUp, Heart } from 'lucide-react';
import { supabase, Post } from '../lib/supabase';
import { PostCard } from '../components/PostCard';
import { CreatePostModal } from '../components/CreatePostModal';

interface PostWithCommentCount extends Post {
  comment_count: number;
}

export function ForumHome({ onPostClick }: { onPostClick: (postId: string) => void }) {
  const [posts, setPosts] = useState<PostWithCommentCount[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'recent' | 'trending'>('recent');

  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithCounts = await Promise.all(
        (postsData || []).map(async (post) => {
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          return { ...post, comment_count: count || 0 };
        })
      );

      setPosts(postsWithCounts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    const interval = setInterval(() => {
      fetchPosts();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const displayedPosts = viewMode === 'trending'
    ? [...posts].sort((a, b) => b.comment_count - a.comment_count)
    : posts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 p-6 rounded-full shadow-2xl animate-pulse transform hover:scale-110 transition-transform duration-300">
              <Heart size={56} className="text-white fill-white" />
            </div>
          </div>
          <h1 className="text-8xl font-black mb-6 bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 bg-clip-text text-transparent drop-shadow-sm leading-tight">
            Svyasa Secrets
          </h1>
          <p className="text-gray-700 text-2xl font-medium italic mb-10">
            Where hearts whisper and secrets bloom
          </p>
          <div className="flex items-center justify-center gap-12">
            <div className="flex items-center gap-3 text-rose-600 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
              <Users size={22} />
              <span className="font-semibold text-lg">{posts.length} Secrets</span>
            </div>
            <div className="flex items-center gap-3 text-pink-600 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
              <MessageSquare size={22} />
              <span className="font-semibold text-lg">24h to confess</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setViewMode('recent')}
            className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              viewMode === 'recent'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xl scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
            }`}
          >
            <MessageSquare size={24} />
            Recent
          </button>
          <button
            onClick={() => setViewMode('trending')}
            className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              viewMode === 'trending'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xl scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
            }`}
          >
            <TrendingUp size={24} />
            Trending
          </button>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white py-6 rounded-3xl font-bold text-2xl hover:shadow-2xl transition-all duration-300 mb-8 flex items-center justify-center gap-3 transform hover:scale-[1.02] hover:from-rose-700 hover:via-pink-700 hover:to-red-700"
        >
          <Plus size={32} />
          Share Your Secret
        </button>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading secrets...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100">
            <Heart size={72} className="mx-auto text-rose-200 mb-4" />
            <p className="text-gray-600 text-xl font-medium">No secrets yet. Be the first to share your heart!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {displayedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => onPostClick(post.id)}
                commentCount={post.comment_count}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={fetchPosts}
        />
      )}
    </div>
  );
}
