
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Target, TrendingUp } from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';

const ProgressMetrics = () => {
  const userStats = useUserStats();

  const getJournalStatus = () => {
    if (userStats.weeklyConsistency >= 80) return { status: 'EXCELLENT', color: 'text-green-400', bgColor: 'bg-green-900/20' };
    if (userStats.weeklyConsistency >= 60) return { status: 'GOOD', color: 'text-blue-400', bgColor: 'bg-blue-900/20' };
    if (userStats.weeklyConsistency >= 40) return { status: 'MODERATE', color: 'text-yellow-400', bgColor: 'bg-yellow-900/20' };
    return { status: 'NEEDS IMPROVEMENT', color: 'text-red-400', bgColor: 'bg-red-900/20' };
  };

  const getGoalStatus = () => {
    const rate = userStats.goalsCompletionRate || 0;
    if (rate >= 80) return { status: 'EXCELLENT', color: 'text-green-400', bgColor: 'bg-green-900/20' };
    if (rate >= 60) return { status: 'GOOD', color: 'text-blue-400', bgColor: 'bg-blue-900/20' };
    if (rate >= 40) return { status: 'MODERATE', color: 'text-yellow-400', bgColor: 'bg-yellow-900/20' };
    return { status: 'NEEDS IMPROVEMENT', color: 'text-red-400', bgColor: 'bg-red-900/20' };
  };

  const journalStatus = getJournalStatus();
  const goalStatus = getGoalStatus();

  const healthMetrics = [
    {
      title: 'JOURNAL MONITOR',
      status: journalStatus.status,
      value: `${userStats.totalJournalEntries} Entries`,
      icon: CheckCircle,
      color: journalStatus.color,
      bgColor: journalStatus.bgColor
    },
    {
      title: 'GOAL MONITOR',
      status: goalStatus.status,
      value: `${userStats.goalsCompleted}/${userStats.totalGoals || 0} Complete`,
      icon: Target,
      color: goalStatus.color,
      bgColor: goalStatus.bgColor
    }
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">
            {userStats.weeklyConsistency >= 70 ? (
              `Great consistency! You've maintained ${userStats.weeklyConsistency}% weekly journal consistency and completed ${userStats.goalsCompleted} goals. Keep up the excellent work!`
            ) : (
              `Your current weekly consistency is ${userStats.weeklyConsistency}%. Consider setting a daily journaling reminder to improve your habit formation.`
            )}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthMetrics.map((metric, index) => (
          <Card key={index} className={`${metric.bgColor} border-gray-700`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {metric.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${metric.color}`} />
                    <span className={`text-sm ${metric.color}`}>
                      {metric.status}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProgressMetrics;
