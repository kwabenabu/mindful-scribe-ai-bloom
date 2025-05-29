
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Target, Calendar, TrendingUp } from 'lucide-react';

const ActivityCounters = () => {
  const activities = [
    {
      title: 'Journal Entries',
      count: 23,
      subtitle: 'This month',
      trend: '+15%',
      icon: BookOpen,
      color: 'text-cyan-400'
    },
    {
      title: 'Goals Completed',
      count: 8,
      subtitle: 'This week',
      trend: '+25%',
      icon: Target,
      color: 'text-green-400'
    },
    {
      title: 'Streak Days',
      count: 12,
      subtitle: 'Current streak',
      trend: 'Record!',
      icon: Calendar,
      color: 'text-purple-400'
    },
    {
      title: 'Weekly Average',
      count: 4.2,
      subtitle: 'Entries per week',
      trend: '+0.8',
      icon: TrendingUp,
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Activity Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {activities.map((activity, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <activity.icon className={`h-8 w-8 mx-auto mb-3 ${activity.color}`} />
              <div className={`text-3xl font-bold mb-1 ${activity.color}`}>
                {activity.count}
              </div>
              <h3 className="text-sm font-medium text-white mb-1">
                {activity.title}
              </h3>
              <p className="text-xs text-gray-400 mb-2">{activity.subtitle}</p>
              <div className="text-xs text-green-400 font-medium">
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
