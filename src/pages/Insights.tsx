
import React from 'react';
import Header from '@/components/Header';
import InsightsOverview from '@/components/insights/InsightsOverview';
import ProgressMetrics from '@/components/insights/ProgressMetrics';
import TrendAnalysis from '@/components/insights/TrendAnalysis';
import ActivityCounters from '@/components/insights/ActivityCounters';
import GamificationPanel from '@/components/insights/GamificationPanel';
import AchievementNotification from '@/components/insights/AchievementNotification';
import SentimentFeedback from '@/components/insights/SentimentFeedback';
import GoalsList from '@/components/GoalsList';
import { useUserStats } from '@/hooks/useUserStats';
import { useAchievements } from '@/hooks/useAchievements';

const Insights = () => {
  const userStats = useUserStats();
  const { achievements, newAchievements, dismissNewAchievements } = useAchievements(userStats);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Insights</h1>
            <p className="text-gray-600">Track your progress and analyze your trends</p>
          </div>

          {/* Sentiment-Based Feedback */}
          <SentimentFeedback />

          {/* Gamification Panel */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <GamificationPanel userStats={userStats} achievements={achievements} />
          </div>

          {/* Overview Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <InsightsOverview />
          </div>

          {/* Progress Metrics */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <ProgressMetrics />
          </div>

          {/* Activity Counters */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <ActivityCounters />
          </div>

          {/* Goals Management */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <GoalsList />
          </div>

          {/* Trend Analysis */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <TrendAnalysis />
          </div>
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
