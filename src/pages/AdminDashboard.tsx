import { useState, useEffect } from 'react';
import { LogOut, Trash2, MessageSquare, Users, Clock } from 'lucide-react';
import { supabase, Post } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateAvatarUrl } from '../utils/avatars';
import { getTimeRemaining, getRelativeTime } from '../utils/time';

interface PostWithCommentCount extends Post {
  comment_count: number;
}

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [posts, setPosts] = useState<PostWithCommentCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { signOut } = useAuth();

  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
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
      .channel('admin_posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setDeleting(postId);
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-rose-900 to-red-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Svyasa Secrets Admin
              </h1>
              <p className="text-gray-600 mt-2">Manage all secret posts</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-100 text-sm font-medium">Total Secrets</p>
                  <p className="text-4xl font-bold mt-1">{posts.length}</p>
                </div>
                <MessageSquare size={40} className="opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Total Responses</p>
                  <p className="text-4xl font-bold mt-1">
                    {posts.reduce((sum, post) => sum + post.comment_count, 0)}
                  </p>
                </div>
                <Users size={40} className="opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Active Secrets</p>
                  <p className="text-4xl font-bold mt-1">
                    {posts.filter((p) => new Date(p.expires_at) > new Date()).length}
                  </p>
                </div>
                <Clock size={40} className="opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto"></div>
            <p className="text-white mt-4">Loading posts...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={generateAvatarUrl(post.avatar_seed)}
                    alt={post.nickname}
                    className="w-14 h-14 rounded-full border-4 border-rose-400 shadow-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{post.nickname}</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {getRelativeTime(post.created_at)}
                        </span>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deleting === post.id}
                          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-rose-600">
                        <MessageSquare size={16} />
                        <span>{post.comment_count} responses</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600 font-medium">
                        <Clock size={16} />
                        <span>Expires in {getTimeRemaining(post.expires_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
