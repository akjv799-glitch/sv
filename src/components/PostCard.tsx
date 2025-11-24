import { useState, useEffect } from 'react';
import { MessageCircle, Clock, Heart } from 'lucide-react';
import { Post } from '../lib/supabase';
import { generateAvatarUrl } from '../utils/avatars';
import { getTimeRemaining, getRelativeTime } from '../utils/time';

interface PostCardProps {
  post: Post;
  onClick: () => void;
  commentCount?: number;
}

export function PostCard({ post, onClick, commentCount = 0 }: PostCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(post.expires_at));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(post.expires_at));
    }, 60000);

    return () => clearInterval(interval);
  }, [post.expires_at]);

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] border-2 border-rose-100 hover:border-rose-300 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100/20 to-pink-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative">
        <div className="flex items-start gap-6 mb-6">
          <img
            src={generateAvatarUrl(post.avatar_seed)}
            alt={post.nickname}
            className="w-20 h-20 rounded-full border-4 border-rose-300 shadow-lg ring-4 ring-rose-100/50"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-2xl">{post.nickname}</h3>
              <span className="text-sm text-gray-500 font-medium bg-white/80 px-3 py-1 rounded-full">{getRelativeTime(post.created_at)}</span>
            </div>
          </div>
        </div>
        <p className="text-gray-800 text-xl mb-6 leading-relaxed font-medium whitespace-pre-wrap">{post.content}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-rose-600 bg-gradient-to-r from-rose-100 to-pink-100 px-5 py-3 rounded-full hover:from-rose-200 hover:to-pink-200 transition-all duration-300 shadow-md">
              <MessageCircle size={28} className="animate-bounce" />
              <span className="font-black text-xl">{commentCount}</span>
            </div>
            <div className="flex items-center gap-2 text-pink-600">
              <Heart size={18} className="fill-pink-600" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-rose-700 font-semibold bg-rose-50 px-4 py-2 rounded-full">
            <Clock size={18} />
            <span>{timeRemaining}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
