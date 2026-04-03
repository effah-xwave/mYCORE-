import React, { useState } from 'react';
import { AuthService } from '../services/auth';
import { Loader2, ArrowRight, Mail, KeyRound, CheckCircle2, ChevronLeft } from 'lucide-react';

interface AuthProps {
  onSuccess: (email: string, name: string) => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password';

export default function Auth({ onSuccess }: AuthProps) {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (view === 'forgot-password') {
          await AuthService.resetPassword(email);
          setSuccessMsg('If an account exists, a reset link has been sent to your email.');
      } else {
          let res: any;
          if (view === 'login') {
            res = await AuthService.login(email, password);
          } else {
            res = await AuthService.signup(email, password);
          }
          const name = email.split('@')[0];
          onSuccess(res.user.email || '', name);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await AuthService.loginWithGoogle();
      onSuccess(res.email || '', res.user_metadata.name);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked by browser. Please allow popups for this site.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Login cancelled.');
      } else {
        setError(err.message || 'Google Auth failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchView = (newView: AuthView) => {
      setView(newView);
      setError('');
      setSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center p-6 relative overflow-hidden isolate transition-colors duration-500">
      {/* Refined Ambient Background with Animation */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[70vw] h-[70vw] bg-blue-300/30 dark:bg-blue-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[70vw] h-[70vw] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
          <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[50vw] h-[50vw] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[80px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-3xl"></div>
      </div>

      <div className="w-full max-w-[400px] bg-white/70 dark:bg-dark-card/70 backdrop-blur-xl rounded-[2.5rem] shadow-apple border border-white/60 dark:border-white/10 p-8 md:p-10 z-10 animate-scale-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative group">
                <div className="absolute inset-0 bg-navy-900 dark:bg-blue-600 rounded-[1.5rem] blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative w-24 h-24 bg-white dark:bg-dark-card rounded-[1.5rem] flex items-center justify-center shadow-apple overflow-hidden transition-transform duration-500 hover:scale-105 border border-white/50 dark:border-white/5">
                    <img 
                      src="https://drive.google.com/thumbnail?id=1Cn2hUpBxHLJ_6QmG8JYxJ9mjAgpDJa5f&sz=w256" 
                      alt="myCORE" 
                      className="w-16 h-16 object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                    />
                    <span className="hidden text-3xl font-bold text-navy-900 dark:text-white tracking-tighter">CORE</span>
                </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">Growth Nexis Global</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[15px] font-medium mt-2">
            {view === 'login' && 'Sign in to access myCORE'}
            {view === 'signup' && 'Design your limitless potential'}
            {view === 'forgot-password' && 'Recover your account'}
          </p>
        </div>

        {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-xs font-semibold rounded-xl text-center border border-red-100 dark:border-red-900/30 animate-fade-in">
                {error}
            </div>
        )}

        {successMsg && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium rounded-xl text-center border border-green-100 dark:border-green-900/30 animate-fade-in flex flex-col items-center gap-2">
                <CheckCircle2 size={24} />
                {successMsg}
            </div>
        )}

        {view !== 'forgot-password' || !successMsg ? (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 relative">
                <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 pl-11 bg-[#F2F2F7]/80 dark:bg-dark-bg/50 hover:bg-[#F2F2F7] dark:hover:bg-dark-bg border-none rounded-xl text-[15px] text-navy-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-navy-900/10 dark:focus:ring-blue-500/30 focus:bg-white dark:focus:bg-dark-bg focus:shadow-sm transition-all outline-none"
                placeholder="Email address"
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            
            {view !== 'forgot-password' && (
                <div className="space-y-1 relative">
                    <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-12 pl-11 bg-[#F2F2F7]/80 dark:bg-dark-bg/50 hover:bg-[#F2F2F7] dark:hover:bg-dark-bg border-none rounded-xl text-[15px] text-navy-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-navy-900/10 dark:focus:ring-blue-500/30 focus:bg-white dark:focus:bg-dark-bg focus:shadow-sm transition-all outline-none"
                    placeholder="Password"
                    />
                    <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            )}

            {view === 'login' && (
                <div className="flex justify-end">
                    <button 
                        type="button" 
                        onClick={() => switchView('forgot-password')}
                        className="text-xs font-semibold text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        Forgot Password?
                    </button>
                </div>
            )}

            <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-navy-900 dark:bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-navy-900/20 dark:shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] hover:bg-navy-800 dark:hover:bg-blue-500 transition-all flex items-center justify-center gap-2 text-[15px]"
            >
                {loading ? <Loader2 size={20} className="animate-spin" /> : (
                <>
                    {view === 'login' && 'Sign In'}
                    {view === 'signup' && 'Create Account'}
                    {view === 'forgot-password' && 'Send Reset Link'}
                    {view !== 'forgot-password' && <ArrowRight size={16} strokeWidth={2.5} />}
                </>
                )}
            </button>
            </form>
        ) : (
             <button 
                onClick={() => switchView('login')}
                className="w-full h-12 bg-slate-100 dark:bg-dark-bg text-navy-900 dark:text-white rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-dark-cardHover transition-all flex items-center justify-center gap-2"
             >
                Back to Sign In
             </button>
        )}

        {view !== 'forgot-password' && (
            <>
                <div className="my-8 flex items-center gap-4">
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Or</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                </div>

                <button 
                    onClick={handleGoogle}
                    type="button"
                    className="w-full h-12 bg-white/80 dark:bg-dark-bg border border-slate-200/60 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-white dark:hover:bg-dark-cardHover active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-[15px] shadow-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>
            </>
        )}

        {view === 'forgot-password' && !successMsg && (
             <div className="mt-8 text-center">
                <button 
                    onClick={() => switchView('login')}
                    className="text-sm font-semibold text-slate-500 hover:text-navy-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                    <ChevronLeft size={16} /> Back to Sign In
                </button>
             </div>
        )}

        {view !== 'forgot-password' && (
            <p className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
            {view === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
                onClick={() => switchView(view === 'login' ? 'signup' : 'login')}
                className="text-navy-900 dark:text-white font-bold hover:underline decoration-2 underline-offset-4"
            >
                {view === 'login' ? 'Sign Up' : 'Log In'}
            </button>
            </p>
        )}
      </div>
    </div>
  );
}