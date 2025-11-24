import { useState } from 'react';
import { X, Send, Heart, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateRandomSeed } from '../utils/avatars';
import { validatePostContent } from '../utils/abuseFilter';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

export function CreatePostModal({ onClose, onPostCreated }: CreatePostModalProps) {
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    setError(null);
    const validation = validatePostContent(nickname.trim(), content.trim());

    if (!validation.valid) {
      setError(validation.message || 'Invalid content');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: dbError } = await supabase.from('posts').insert({
        nickname: nickname.trim(),
        content: content.trim(),
        avatar_seed: generateRandomSeed(),
      });

      if (dbError) throw dbError;

      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
      <div className="bg-gradient-to-br from-white via-rose-50/50 to-pink-50/50 rounded-3xl shadow-2xl max-w-2xl w-full p-10 transform transition-all animate-slideUp border-2 border-rose-200">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-3 rounded-full">
              <Heart size={32} className="text-white fill-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Share Your Secret
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-rose-600 transition-colors bg-rose-50 hover:bg-rose-100 p-2 rounded-full"
          >
            <X size={32} />
          </button>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">
              Your Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter any nickname..."
              maxLength={30}
              required
              className="w-full px-5 py-4 border-2 border-rose-200 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-200 transition-all outline-none text-lg bg-white/80 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">
              What's in your heart?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your deepest feelings anonymously..."
              rows={8}
              maxLength={1000}
              required
              className="w-full px-5 py-4 border-2 border-rose-200 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-200 transition-all outline-none resize-none text-lg bg-white/80 backdrop-blur-sm leading-relaxed"
            />
            <div className="text-right text-sm text-gray-600 mt-2 font-medium">
              {content.length}/1000
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !nickname.trim() || !content.trim()}
            className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-[1.02]"
          >
            <Send size={24} />
            {isSubmitting ? 'Sharing Your Secret...' : 'Share Anonymously'}
          </button>
        </form>
      </div>
    </div>
  );
}
