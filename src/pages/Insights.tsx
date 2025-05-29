
import React from 'react';
import Header from '@/components/Header';
import InsightsOverview from '@/components/insights/InsightsOverview';
import ProgressMetrics from '@/components/insights/ProgressMetrics';
import TrendAnalysis from '@/components/insights/TrendAnalysis';
import SentimentFeedback from '@/components/insights/SentimentFeedback';
import GamificationPanel from '@/components/insights/GamificationPanel';
import { useUserStats } from '@/hooks/useUserStats';
import { useAchievements } from '@/hooks/useAchievements';

const Insights = () => {
  const userStats = useUserStats();
  const { achievements } = useAchievements(userStats);

  console.log('Insights component rendering', { userStats, achievements });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Insights & Analytics
            </h1>
            <p className="text-gray-600">
              Track your progress, analyze trends, and get personalized insights
            </p>
          </div>
          
          {/* Separated sections with clear visual hierarchy */}
          <div className="space-y-12">
            {/* Overview Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Overview
              </h2>
              <InsightsOverview />
            </section>

            {/* Progress Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Progress Metrics
              </h2>
              <ProgressMetrics />
            </section>

            {/* Analytics Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Trend Analysis
              </h2>
              <TrendAnalysis />
            </section>

            {/* Sentiment Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Sentiment Analysis
              </h2>
              <SentimentFeedback />
            </section>

            {/* Achievements Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Achievements & Progress
              </h2>
              <GamificationPanel userStats={userStats} achievements={achievements} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;
