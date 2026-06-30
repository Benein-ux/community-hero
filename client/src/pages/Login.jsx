import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, useAuth } from '../lib/firebase';
import { LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-deep)]" style={{ padding: 'clamp(16px, 4vw, 48px)' }}>
      <div
        className="relative w-full max-w-md rounded-[16px] border border-[var(--border-default)] overflow-hidden"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, var(--accent) 0%, transparent 50%), radial-gradient(circle at 75% 50%, var(--accent-bright) 0%, transparent 50%)'
          }}
        />
        <div className="relative p-8 sm:p-10 flex flex-col items-center text-center">
          <h1
            className="text-3xl sm:text-4xl font-bold text-[var(--accent)] mb-3"
            style={{ fontFamily: '"Sora", sans-serif' }}
          >
            CommunityHero
          </h1>
          <p className="text-[var(--fg-muted)] mb-8 max-w-sm leading-relaxed">
            Report civic issues, upvote community concerns, and track them to resolution.
          </p>
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-semibold text-base transition-all hover:brightness-110 active:brightness-90"
            style={{ backgroundColor: 'var(--accent)', color: '#11141A' }}
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
