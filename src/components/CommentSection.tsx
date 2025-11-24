import { useState } from 'react';
import { Send, Heart, MessageCircle } from 'lucide-react';
import { Comment } from '../lib/supabase';
import { generateAvatarUrl } from '../utils/avatars';
import { getRelativeTime } from '../utils/time';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (nickname: string, content: string) => Promise<void>;
}

export function CommentSection({ comments, onAddComment }: CommentSectionProps) {
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(nickname.trim(), content.trim());
      setNickname('');
      setContent('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-white via-rose-50/50 to-pink-50/50 rounded-3xl p-8 shadow-xl border-2 border-rose-200">
        <div className="flex items-center gap-3 mb-6">
          <Heart size={28} className="text-rose-600 fill-rose-600" />
          <h3 className="text-2xl font-bold text-gray-900">Share Your Feelings</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your nickname..."
            maxLength={30}
            required
            className="w-full px-5 py-4 border-2 border-rose-200 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-200 transition-all outline-none text-lg bg-white/80 backdrop-blur-sm"
          />
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Express your thoughts..."
              rows={4}
              maxLength={500}
              required
              className="w-full px-5 py-4 border-2 border-rose-200 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-200 transition-all outline-none resize-none text-lg bg-white/80 backdrop-blur-sm leading-relaxed"
            />
            <div className="text-right text-sm text-gray-600 mt-2 font-medium">
              {content.length}/500
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !nickname.trim() || !content.trim()}
            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <Send size={20} />
            {isSubmitting ? 'Posting...' : 'Post Response'}
          </button>
        </form>
      </div>

      <div className="space-y-5">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <MessageCircle size={28} className="text-rose-600" />
          Responses ({comments.length})
        </h3>
        {comments.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-xl border-2 border-rose-100">
            <Heart size={64} className="mx-auto text-rose-200 mb-4" />
            <p className="text-gray-600 text-lg font-medium">No responses yet. Be the first to share your feelings!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-rose-100 hover:border-rose-200"
            >
              <div className="flex items-start gap-5">
                <img
                  src={generateAvatarUrl(comment.avatar_seed)}
                  alt={comment.nickname}
                  className="w-16 h-16 rounded-full border-4 border-rose-300 shadow-md flex-shrink-0 ring-2 ring-rose-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 text-xl">{comment.nickname}</h4>
                    <span className="text-sm text-gray-500 font-medium bg-white/80 px-3 py-1 rounded-full">
                      {getRelativeTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-800 leading-relaxed text-lg">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
