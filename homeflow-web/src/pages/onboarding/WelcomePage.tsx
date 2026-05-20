import { useState } from 'react';
import { Home, ArrowRight, Sparkles, MapPin, Calendar, Mail, Eye, EyeOff, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    desc: 'Get personalized home recommendations that learn your preferences',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    desc: 'Optimized multi-property viewing routes in one tap',
  },
  {
    icon: MapPin,
    title: 'Pipeline Tracker',
    desc: 'Always know your exact stage and next steps',
  },
];

type EmailMode = 'hidden' | 'signin' | 'signup';

export default function WelcomePage() {
  const { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail, isLoading } = useAuthStore();

  const [emailMode, setEmailMode] = useState<EmailMode>('hidden');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setError(null);
    setSubmitting(true);

    const err =
      emailMode === 'signup'
        ? await signUpWithEmail(email, password, displayName)
        : await signInWithEmail(email, password);

    setSubmitting(false);
    if (err) {
      setError(err.message);
    } else if (emailMode === 'signup') {
      // Supabase requires email confirmation before a session is created.
      // Don't navigate — show a message and let the user confirm then sign in.
      setError('Account created! Check your email to confirm, then sign in here.');
      setEmailMode('signin');
      setPassword('');
    }
    // Sign-in success: onAuthStateChange fires → App.tsx redirects automatically.
  };

  const busy = isLoading || submitting;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0F0F0F]">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8 text-center">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mb-6 shadow-float">
          <Home size={28} className="text-white" />
        </div>

        <h1 className="font-display font-bold text-4xl text-white leading-tight text-balance mb-3">
          Find your home,{' '}
          <span className="text-brand-600">stress&#8209;free</span>
        </h1>

        <p className="text-slate-500 text-base leading-relaxed max-w-xs">
          HomeFlow is your AI co-pilot for the entire home buying journey — from first search to closing day.
        </p>

        {/* Features */}
        <div className="mt-10 space-y-4 w-full max-w-sm">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-4 rounded-2xl bg-warm-200 border border-warm-300 text-left animate-slide-up"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={17} className="text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="px-6 pb-10 space-y-3">
        {/* Google */}
        <button
          onClick={signInWithGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-warm-300 bg-warm-200 hover:bg-warm-300 hover:border-brand-500 transition-colors font-semibold text-white disabled:opacity-60"
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        {/* Apple */}
        <button
          onClick={signInWithApple}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-warm-200 border border-warm-300 hover:border-brand-500 transition-colors font-semibold text-white disabled:opacity-60"
        >
          <img src="/apple-icon.svg" alt="Apple" className="w-4 h-4 invert" />
          Continue with Apple
        </button>

        {/* Email toggle */}
        {emailMode === 'hidden' ? (
          <button
            onClick={() => setEmailMode('signup')}
            disabled={busy}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Mail size={16} />
            Sign up with Email
            <ArrowRight size={16} />
          </button>
        ) : (
          /* Email form */
          <form
            onSubmit={handleEmailSubmit}
            className="w-full rounded-2xl border border-warm-300 bg-warm-200 p-4 space-y-3 animate-fade-in"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-slate-900 text-sm">
                {emailMode === 'signup' ? 'Create account' : 'Sign in'}
              </p>
              <button
                type="button"
                onClick={() => { setEmailMode('hidden'); setError(null); }}
                className="p-1 hover:bg-warm-200 rounded-lg"
              >
                <X size={15} className="text-slate-400" />
              </button>
            </div>

            {emailMode === 'signup' && (
              <input
                className="input-base w-full text-sm"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoFocus
              />
            )}

            <input
              type="email"
              className="input-base w-full text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={emailMode === 'signin'}
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-base w-full text-sm pr-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? 'Please wait…' : emailMode === 'signup' ? 'Create account' : 'Sign in'}
            </button>

            <p className="text-center text-xs text-slate-400">
              {emailMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => { setEmailMode(emailMode === 'signup' ? 'signin' : 'signup'); setError(null); }}
                className={cn('font-semibold', 'text-brand-600 hover:text-brand-700')}
              >
                {emailMode === 'signup' ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </form>
        )}

        {emailMode === 'hidden' && (
          <button
            onClick={() => setEmailMode('signin')}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 py-2 transition-colors"
          >
            Already have an account? Sign in
          </button>
        )}
      </div>
    </div>
  );
}
