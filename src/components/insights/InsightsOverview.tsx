
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStats } from '@/hooks/useUserStats';
import { Progress } from '@/components/ui/progress';

const InsightsOverview = () => {
  const userStats = useUserStats();

  const metrics = [
    { 
      label: 'Weekly Consistency', 
      value: userStats.weeklyConsistency || 0, 
      description: 'Journal entries this week',
      unit: '%'
    },
    { 
      label: 'Goals Completion', 
      value: userStats.goalsCompletionRate || 0, 
      description: 'Goals completed this month',
      unit: '%'
    },
    { 
      label: 'Current Streak', 
      value: userStats.currentStreak || 0, 
      description: 'Consecutive days',
      unit: 'days'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </span>
                <span className="text-sm text-gray-500">
                  {metric.unit}
                </span>
              </div>
              
              {metric.unit === '%' && (
                <Progress 
                  value={metric.value} 
                  className="h-2 bg-gray-200"
                />
              )}
              
              <p className="text-xs text-gray-500">
                {metric.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InsightsOverview;
