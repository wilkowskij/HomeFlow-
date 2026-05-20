import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Onboarding
import WelcomePage from '@/pages/onboarding/WelcomePage';
import ProfileSetupPage from '@/pages/onboarding/ProfileSetupPage';

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage';

// Search & Discovery
import SearchPage from '@/pages/search/SearchPage';
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

// AI Chat
import ChatPage from '@/pages/chat/ChatPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/welcome" replace />;
}

export default function App() {
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();

  return (
    <Routes>
      {/* Public / onboarding routes */}
      <Route
        path="/welcome"
        element={
          isAuthenticated && hasCompletedOnboarding
            ? <Navigate to="/dashboard" replace />
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

        {/* Chat */}
        <Route path="/chat" element={<ChatPage />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? '/dashboard' : '/welcome'}
            replace
          />
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
