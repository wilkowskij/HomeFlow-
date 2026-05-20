import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSearchStore } from '@/store/searchStore';
import { useJourneyStore } from '@/store/journeyStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useChatStore } from '@/store/chatStore';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Onboarding
import WelcomePage from '@/pages/onboarding/WelcomePage';
import ProfileSetupPage from '@/pages/onboarding/ProfileSetupPage';

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage';

// Search & Discovery
import SearchPage from '@/pages/search/SearchPage';
import SavedHomesPage from '@/pages/search/SavedHomesPage';
import PropertyDetailPage from '@/pages/search/PropertyDetailPage';
import ComparePage from '@/pages/search/ComparePage';

// Schedule
import SchedulePage from '@/pages/schedule/SchedulePage';
import ItineraryBuilderPage from '@/pages/schedule/ItineraryBuilderPage';
import AppointmentDetailPage from '@/pages/schedule/AppointmentDetailPage';

// Journey / Pipeline
import JourneyPage from '@/pages/journey/JourneyPage';
import StageDetailPage from '@/pages/journey/StageDetailPage';
import AgentConnectPage from '@/pages/journey/AgentConnectPage';
import PreApprovalPage from '@/pages/journey/PreApprovalPage';

// AI Chat
import ChatPage from '@/pages/chat/ChatPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/welcome" replace />;
}

function AuthLoader() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-warm-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shadow-float animate-pulse" />
        <p className="text-sm text-slate-400 font-medium">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, hasCompletedOnboarding, isLoading, initialize, user } = useAuthStore();
  const { fetchSavedHomes } = useSearchStore();
  const { fetchPipeline } = useJourneyStore();
  const { fetchAppointments } = useScheduleStore();
  const { fetchMessages } = useChatStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!user?.id) return;
    fetchSavedHomes(user.id);
    fetchPipeline(user.id);
    fetchAppointments(user.id);
    fetchMessages(user.id);
  }, [user?.id, fetchSavedHomes, fetchPipeline, fetchAppointments, fetchMessages]);

  if (isLoading) return <AuthLoader />;

  return (
    <Routes>
      {/* Public / onboarding routes */}
      <Route
        path="/welcome"
        element={
          isAuthenticated && hasCompletedOnboarding
            ? <Navigate to="/dashboard" replace />
            : isAuthenticated
              ? <Navigate to="/onboarding" replace />
              : <WelcomePage />
        }
      />
      <Route path="/onboarding" element={<ProfileSetupPage />} />

      {/* App routes (require auth) */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Search */}
        <Route path="/search" element={<SearchPage />} />
        <Route path="/saved" element={<SavedHomesPage />} />
        <Route path="/search/property/:id" element={<PropertyDetailPage />} />
        <Route path="/search/compare" element={<ComparePage />} />

        {/* Schedule */}
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/schedule/itinerary" element={<ItineraryBuilderPage />} />
        <Route path="/schedule/appointment/:id" element={<AppointmentDetailPage />} />

        {/* Journey */}
        <Route path="/journey" element={<JourneyPage />} />
        <Route path="/journey/stage/:stage" element={<StageDetailPage />} />
        <Route path="/journey/connect-agent" element={<AgentConnectPage />} />
        <Route path="/journey/pre-approval" element={<PreApprovalPage />} />

        {/* Chat */}
        <Route path="/chat" element={<ChatPage />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/welcome'} replace />}
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
