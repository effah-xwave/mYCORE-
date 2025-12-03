import React, { useState } from 'react';
import { AuthService } from '../services/auth';
import { Loader2, ArrowRight } from 'lucide-react';

interface AuthProps {
  onSuccess: (email: string, name: string) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (isLogin) {
        res = await AuthService.login(email, password);
      } else {
        res = await AuthService.signup(email, password);
      }
      const name = email.split('@')[0];
      onSuccess(res.email, name);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const res = await AuthService.loginWithGoogle();
      const name = "Demo User";
      onSuccess(res.email, name);
    } catch (err) {
      setError('Google Auth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-navy-100 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-40" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft p-8 md:p-10 z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Growth Nexis Global" 
              className="w-24 h-24 object-contain drop-shadow-md"
              onError={(e) => {
                 // Fallback
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
             <div className="hidden w-20 h-20 bg-navy-900 rounded-2xl flex items-center justify-center shadow-glow">
                <span className="text-white text-2xl font-bold">GN</span>
             </div>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Growth Nexis Global</h1>
          <p className="text-slate-400 text-sm mt-2">
            {isLogin ? 'Sign in to access your Core' : 'Start your journey to limitless potential'}
          </p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-all"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-navy-900 text-white py-3.5 rounded-xl font-medium shadow-lg shadow-navy-900/20 hover:bg-navy-800 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs text-slate-400">or continue with</span>
            <div className="h-px bg-slate-200 flex-1" />
        </div>

        <button 
            onClick={handleGoogle}
            type="button"
            className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
             {/* Simple Google G icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
        </button>

        <p className="text-center mt-8 text-xs text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-navy-900 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}