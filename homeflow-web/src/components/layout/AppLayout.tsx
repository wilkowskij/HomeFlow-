import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Calendar,
  MapPin,
  MessageCircle,
  Bell,
  User,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useChatStore } from '@/store/chatStore';

const NAV_ITEMS = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/schedule', icon: Calendar, label: 'Schedule' },
  { path: '/journey', icon: MapPin, label: 'My Journey' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading: chatLoading } = useChatStore();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 pt-safe">
        <div className="flex items-center justify-between h-14 max-w-lg mx-auto">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Home size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 tracking-tight">
              HomeFlow
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell size={20} className="text-slate-600" />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center"
            >
              <User size={16} className="text-brand-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bottom-nav-pad">
        <div className="max-w-lg mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-100 pb-safe">
        <div className="flex items-center max-w-lg mx-auto px-2 h-16">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            const isChatActive = path === '/chat' && chatLoading;

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 gap-0.5 py-2 rounded-xl transition-all duration-200',
                  active
                    ? 'text-brand-600'
                    : 'text-slate-400 hover:text-slate-600',
                )}
              >
                <div className="relative">
                  <Icon
                    size={22}
                    className={cn(
                      'transition-all duration-200',
                      active && 'scale-110',
                    )}
                    strokeWidth={active ? 2.5 : 1.75}
                  />
                  {isChatActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-all duration-200',
                    active ? 'opacity-100' : 'opacity-60',
                  )}
                >
                  {label}
                </span>

                {/* Active indicator dot */}
                {active && (
                  <span className="w-1 h-1 rounded-full bg-brand-500 -mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
