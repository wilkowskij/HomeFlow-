import { useNavigate } from 'react-router-dom';
import { Home, ArrowRight, Sparkles, MapPin, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { generateId } from '@/utils/cn';

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

export default function WelcomePage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSignIn = (method: 'google' | 'apple' | 'email') => {
    // TODO: implement real OAuth flow
    setUser({
      id: generateId('user'),
      email: `demo@homeflow.app`,
      displayName: 'Demo User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    navigate('/onboarding');
  };

  const handleGuest = () => {
    setUser({
      id: generateId('guest'),
      email: 'guest@homeflow.app',
      displayName: 'Guest',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8 text-center">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mb-6 shadow-float">
          <Home size={28} className="text-white" />
        </div>

        <h1 className="font-display font-bold text-4xl text-slate-900 leading-tight text-balance mb-3">
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
              className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 text-left animate-slide-up"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
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
        <button
          onClick={() => handleSignIn('google')}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 transition-colors font-semibold text-slate-700"
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <button
          onClick={() => handleSignIn('apple')}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 transition-colors font-semibold text-white"
        >
          <img src="/apple-icon.svg" alt="Apple" className="w-4 h-4 invert" />
          Continue with Apple
        </button>

        <button
          onClick={() => handleSignIn('email')}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          Sign up with Email
          <ArrowRight size={16} />
        </button>

        <button
          onClick={handleGuest}
          className="w-full text-center text-sm text-slate-400 hover:text-slate-600 py-2 transition-colors"
        >
          Continue as guest (limited access)
        </button>
      </div>
    </div>
  );
}
