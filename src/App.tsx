import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ForumHome } from './pages/ForumHome';
import { PostDetail } from './pages/PostDetail';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

type View =
  | { type: 'forum' }
  | { type: 'post'; postId: string }
  | { type: 'admin-login' }
  | { type: 'admin-dashboard' };

function AppContent() {
  const [view, setView] = useState<View>({ type: 'forum' });
  const { user, loading } = useAuth();

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin-secret-login') {
      if (user) {
        setView({ type: 'admin-dashboard' });
      } else {
        setView({ type: 'admin-login' });
      }
    }
  }, [user]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin-secret-login') {
        if (user) {
          setView({ type: 'admin-dashboard' });
        } else {
          setView({ type: 'admin-login' });
        }
      } else {
        setView({ type: 'forum' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  const navigateToPost = (postId: string) => {
    setView({ type: 'post', postId });
    window.history.pushState({}, '', '/');
  };

  const navigateToForum = () => {
    setView({ type: 'forum' });
    window.history.pushState({}, '', '/');
  };

  const navigateToAdminDashboard = () => {
    setView({ type: 'admin-dashboard' });
    window.history.pushState({}, '', '/admin-secret-login');
  };

  const handleLogout = () => {
    setView({ type: 'admin-login' });
    window.history.pushState({}, '', '/admin-secret-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (view.type === 'admin-login') {
    return <AdminLogin onLoginSuccess={navigateToAdminDashboard} />;
  }

  if (view.type === 'admin-dashboard') {
    return user ? <AdminDashboard onLogout={handleLogout} /> : <AdminLogin onLoginSuccess={navigateToAdminDashboard} />;
  }

  if (view.type === 'post') {
    return <PostDetail postId={view.postId} onBack={navigateToForum} />;
  }

  return <ForumHome onPostClick={navigateToPost} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
