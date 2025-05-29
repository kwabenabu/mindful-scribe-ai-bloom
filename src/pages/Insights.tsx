
import React from 'react';
import Header from '@/components/Header';
import InsightsOverview from '@/components/insights/InsightsOverview';
import ProgressMetrics from '@/components/insights/ProgressMetrics';
import TrendAnalysis from '@/components/insights/TrendAnalysis';
import ActivityCounters from '@/components/insights/ActivityCounters';
import GamificationPanel from '@/components/insights/GamificationPanel';
import AchievementNotification from '@/components/insights/AchievementNotification';
import GoalsList from '@/components/GoalsList';
import { useUserStats } from '@/hooks/useUserStats';
import { useAchievements } from '@/hooks/useAchievements';

const Insights = () => {
  const userStats = useUserStats();
  const { achievements, newAchievements, dismissNewAchievements } = useAchievements(userStats);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">INSIGHTS</h1>
            <p className="text-gray-400">Track your progress and analyze your trends</p>
          </div>

          {/* Gamification Panel */}
          <GamificationPanel userStats={userStats} achievements={achievements} />

          {/* Overview Section */}
          <InsightsOverview />

          {/* Progress Metrics */}
          <ProgressMetrics />

          {/* Activity Counters */}
          <ActivityCounters />

          {/* Goals Management */}
          <div className="bg-white rounded-lg p-6">
            <GoalsList />
          </div>

          {/* Trend Analysis */}
          <TrendAnalysis />
        </div>
      </main>

      {/* Achievement Notifications */}
      <AchievementNotification 
        achievements={newAchievements}
        onDismiss={dismissNewAchievements}
      />
    </div>
  );
};

export default Insights;
