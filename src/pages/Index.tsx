
import React from 'react';
import Header from '@/components/Header';
import OnboardingMessage from '@/components/OnboardingMessage';
import TaskCompletionDialog from '@/components/TaskCompletionDialog';
import WelcomeSection from '@/components/home/WelcomeSection';
import ProgressOverview from '@/components/home/ProgressOverview';
import QuickActions from '@/components/home/QuickActions';
import WeeklyGoalsSection from '@/components/home/WeeklyGoalsSection';
import RecentAchievements from '@/components/home/RecentAchievements';
import ContinueJourneySection from '@/components/home/ContinueJourneySection';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStats } from '@/hooks/useUserStats';
import { useAchievements } from '@/hooks/useAchievements';

const Index = () => {
  const { user } = useAuth();
  const { profile, isLoading } = useUserProfile();
  const userStats = useUserStats();
  const { achievements } = useAchievements(userStats);
  const [showTaskDialog, setShowTaskDialog] = React.useState(false);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there';
  const isFirstTime = profile?.is_first_time !== false;

  // Calculate progress metrics
  const unlockedAchievements = achievements.filter(a => a.isUnlocked);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          {/* Onboarding Message for first-time users */}
          <OnboardingMessage />

          {/* Welcome Section */}
          <WelcomeSection displayName={displayName} isFirstTime={isFirstTime} />

          {/* Progress Overview - Only for returning users */}
          {!isFirstTime && (
            <ProgressOverview 
              userStats={userStats} 
              unlockedAchievementsCount={unlockedAchievements.length} 
            />
          )}

          {/* Quick Actions */}
          <QuickActions onShowTaskDialog={() => setShowTaskDialog(true)} />

          {/* Weekly Goals & Recent Activity - Only for returning users */}
          {!isFirstTime && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <WeeklyGoalsSection userStats={userStats} />
              <RecentAchievements unlockedAchievements={unlockedAchievements} />
            </div>
          )}

          {/* Returning User Action Section */}
          {!isFirstTime && <ContinueJourneySection />}
        </div>
      </main>

      <TaskCompletionDialog
        isOpen={showTaskDialog}
        onClose={() => setShowTaskDialog(false)}
      />
    </div>
  );
};

export default Index;
