import React, { useState } from "react";
import { AuthService } from "../services/auth";
import { Loader2 } from "lucide-react";
const lumenHubHero =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"; // Premium abstract 3D background

interface AuthProps {
  onSuccess: (email: string, name: string) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let session;
      if (isLogin) {
        session = await AuthService.login(email, password);
      } else {
        session = await AuthService.signup(email, password);
      }
      const userEmail = session.user.email || email;
      const userName = session.user.user_metadata?.name || email.split("@")[0];
      onSuccess(userEmail, userName);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await AuthService.loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google Auth failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-dark-bg font-sans selection:bg-purple-100 selection:text-purple-900 text-sm">
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden md:flex w-7/12 relative overflow-hidden flex-col justify-between p-12 text-white">
        {" "}
        {/* Made wider (7/12) */}
        {/* Full Image Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={lumenHubHero}
            alt="Productivity Abstract"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-purple-900/40 mix-blend-multiply backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-transparent to-transparent"></div>
        </div>
        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-xl font-bold tracking-tight">M!Core</h2>
        </div>
        <div className="relative z-10 mt-auto">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Unlock your true
            <br />
            potential with
            <br />
            M!Core.
          </h1>
          <p className="text-lg opacity-90 font-medium max-w-md">
            Your personal productivity assistant designed to help you organize,
            focus, and achieve more.
          </p>

          <div className="flex items-center gap-4 mt-8">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-purple-500 bg-white overflow-hidden"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                    alt="user"
                  />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-purple-500 bg-purple-900/80 flex items-center justify-center text-[10px] text-white font-bold backdrop-blur-sm">
                +5k
              </div>
            </div>
            <div className="text-xs font-medium opacity-90">
              <span className="font-bold">5,000+</span> productive users
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full md:w-5/12 flex items-center justify-center p-6 relative">
        {" "}
        {/* Made slimmer (5/12) */}
        <div className="w-full max-w-[320px] space-y-6">
          {" "}
          {/* Reduced max-width further */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">
              {isLogin ? "Welcome Back" : "Sign Up"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              {isLogin
                ? "Login to continue your productivity journey"
                : "Create your M!Core account"}
            </p>
          </div>
          <button
            onClick={handleGoogle}
            className="w-full h-10 bg-[#F3F4F6] hover:bg-[#E5E7EB] dark:bg-dark-card dark:hover:bg-dark-cardHover text-gray-700 dark:text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
            </svg>
            {isLogin ? "Sign in with Google" : "Sign up with Google"}
          </button>
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
            <span className="flex-shrink-0 mx-4 text-purple-600 dark:text-purple-400 text-[10px] font-medium uppercase tracking-wider">
              or
            </span>
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
          </div>
          {error && (
            <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg text-center font-medium border border-red-100">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all dark:bg-dark-card dark:text-white placeholder:text-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all dark:bg-dark-card dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-lg font-semibold shadow-md shadow-purple-500/10 transition-all flex items-center justify-center gap-2 mt-2 text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Proceed"
              )}
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#6D28D9] dark:text-purple-400 font-bold hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
