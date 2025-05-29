
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUserStats } from '@/hooks/useUserStats';

const InsightsOverview = () => {
  const userStats = useUserStats();

  const metrics = [
    { 
      label: 'JOURNAL', 
      value: userStats.weeklyConsistency, 
      color: 'text-cyan-400',
      progressColor: 'bg-cyan-400',
      description: 'Weekly consistency'
    },
    { 
      label: 'GOALS', 
      value: userStats.goalsCompletionRate || 0, 
      color: 'text-green-400',
      progressColor: 'bg-green-400',
      description: 'Completion rate'
    },
    { 
      label: 'STREAK', 
      value: userStats.currentStreak, 
      color: 'text-blue-400',
      progressColor: 'bg-blue-400',
      description: 'Current days',
      isDecimal: true,
      maxValue: Math.max(userStats.longestStreak, 30)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 mx-auto relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (metric.isDecimal ? 
                      metric.value / (metric.maxValue || 20) : 
                      metric.value / 100))}`}
                    className={metric.color}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${metric.color}`}>
                    {metric.isDecimal ? metric.value : `${metric.value}%`}
                  </span>
                </div>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-1">{metric.label}</h3>
            <p className="text-xs text-gray-500">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InsightsOverview;
