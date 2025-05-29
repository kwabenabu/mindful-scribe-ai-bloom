
import React from 'react';
import Header from '@/components/Header';
import InsightsOverview from '@/components/insights/InsightsOverview';
import ProgressMetrics from '@/components/insights/ProgressMetrics';
import TrendAnalysis from '@/components/insights/TrendAnalysis';
import ActivityCounters from '@/components/insights/ActivityCounters';

const Insights = () => {
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

          {/* Overview Section */}
          <InsightsOverview />

          {/* Progress Metrics */}
          <ProgressMetrics />

          {/* Activity Counters */}
          <ActivityCounters />

          {/* Trend Analysis */}
          <TrendAnalysis />
        </div>
      </main>
    </div>
  );
};

export default Insights;
