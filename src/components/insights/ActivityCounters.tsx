
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Target, Calendar, TrendingUp } from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';

const ActivityCounters = () => {
  const userStats = useUserStats();

  const activities = [
    {
      title: 'Journal Entries',
      count: userStats.totalJournalEntries,
      subtitle: 'Total written',
      trend: userStats.weeklyConsistency >= 70 ? '+15%' : 'Improving',
      icon: BookOpen,
      color: 'text-gray-600'
    },
    {
      title: 'Goals Completed',
      count: userStats.goalsCompleted,
      subtitle: `of ${userStats.totalGoals || 0} total`,
      trend: userStats.goalsCompletionRate >= 70 ? '+25%' : 'In Progress',
      icon: Target,
      color: 'text-gray-600'
    },
    {
      title: 'Current Streak',
      count: userStats.currentStreak,
      subtitle: 'Days in a row',
      trend: userStats.currentStreak === userStats.longestStreak ? 'Record!' : `Best: ${userStats.longestStreak}`,
      icon: Calendar,
      color: 'text-gray-600'
    },
    {
      title: 'Weekly Average',
      count: parseFloat((userStats.weeklyConsistency / 100 * 7).toFixed(1)),
      subtitle: 'Entries per week',
      trend: userStats.weeklyConsistency >= 50 ? '+0.8' : 'Growing',
      icon: TrendingUp,
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Activity Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {activities.map((activity, index) => (
          <Card key={index} className="bg-gray-50 border-gray-200">
            <CardContent className="p-4 text-center">
              <activity.icon className={`h-8 w-8 mx-auto mb-3 ${activity.color}`} />
              <div className={`text-3xl font-bold mb-1 text-gray-900`}>
                {activity.count}
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {activity.title}
              </h3>
              <p className="text-xs text-gray-500 mb-2">{activity.subtitle}</p>
              <div className="text-xs text-gray-600 font-medium">
                {activity.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActivityCounters;
