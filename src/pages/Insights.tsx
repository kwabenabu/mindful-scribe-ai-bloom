
import React from 'react';
import Header from '@/components/Header';
import InsightsOverview from '@/components/insights/InsightsOverview';
import ProgressMetrics from '@/components/insights/ProgressMetrics';
import TrendAnalysis from '@/components/insights/TrendAnalysis';
import SentimentFeedback from '@/components/insights/SentimentFeedback';
import GamificationPanel from '@/components/insights/GamificationPanel';
import CalendarSettings from '@/components/calendar/CalendarSettings';
import CalendarEventsList from '@/components/calendar/CalendarEventsList';

const Insights = () => {
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <InsightsOverview />
              <ProgressMetrics />
              <GamificationPanel />
            </div>
            
            <div className="space-y-8">
              <TrendAnalysis />
              <SentimentFeedback />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CalendarSettings />
            <CalendarEventsList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insights;
