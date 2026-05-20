import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Heart,
  Calendar,
  MapPin,
  MessageCircle,
  Bell,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { useChatStore } from '@/store/chatStore';
import { useSearchStore } from '@/store/searchStore';

const NAV_ITEMS = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/saved', icon: Heart, label: 'Saved' },
  { path: '/schedule', icon: Calendar, label: 'Schedule' },
  { path: '/journey', icon: MapPin, label: 'Journey' },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading: chatLoading } = useChatStore();
  const { savedHomes, savedPrices } = useSearchStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const priceDropCount = savedHomes.filter((p) => savedPrices[p.id] && p.price < savedPrices[p.id]!).length;
  const hasAlerts = priceDropCount > 0;

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-warm-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass border-b border-warm-200 px-4 pt-safe">
        <div className="flex items-center justify-between h-14 max-w-lg mx-auto">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Home size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-[#2c2c2c] tracking-tight">
              HomeFlow
            </span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/chat')}
              className={cn(
                'relative p-2 rounded-xl transition-colors',
                location.pathname.startsWith('/chat') ? 'text-brand-600 bg-brand-50' : 'text-[#5c5c5c] hover:bg-warm-100',
              )}
            >
              <MessageCircle size={20} />
              {chatLoading && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="relative p-2 rounded-xl hover:bg-warm-100 transition-colors text-[#5c5c5c]"
              >
                <Bell size={20} />
                {hasAlerts && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 top-10 z-40 w-72 bg-white rounded-2xl shadow-xl border border-warm-200 overflow-hidden animate-fade-in">
                    <div className="px-4 py-3 border-b border-warm-100">
                      <p className="font-semibold text-sm text-slate-900">Notifications</p>
                    </div>
                    {priceDropCount > 0 ? (
                      <button
                        onClick={() => { setShowNotifications(false); navigate('/saved'); }}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-warm-50 text-left transition-colors"
                      >
                        <span className="text-lg">🎉</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {priceDropCount} price {priceDropCount === 1 ? 'drop' : 'drops'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Homes you saved have dropped in price
                          </p>
                        </div>
                      </button>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-slate-400">No new alerts</p>
                        <p className="text-xs text-slate-300 mt-1">Save homes to get price drop alerts</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
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
      <nav className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-warm-200 pb-safe">
        <div className="flex items-center max-w-lg mx-auto px-2 h-16">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            const savedBadge = path === '/saved' && savedHomes.length > 0;

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 gap-0.5 py-2 rounded-xl transition-all duration-200',
                  active
                    ? 'text-brand-600'
                    : 'text-[#b8b2a6] hover:text-[#5c5c5c]',
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
                  {savedBadge && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 bg-pink-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center px-0.5">
                      {savedHomes.length}
                    </span>
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
