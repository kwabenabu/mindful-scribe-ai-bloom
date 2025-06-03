
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Target, Trophy, Star } from 'lucide-react';
import { UserStats } from '@/types/achievements';

interface ProgressOverviewProps {
  userStats: UserStats;
  unlockedAchievementsCount: number;
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({ userStats, unlockedAchievementsCount }) => {
  // Calculate progress metrics
  const nextLevelXP = (userStats.level + 1) * 100;
  const currentLevelXP = userStats.level * 100;
  const progressToNextLevel = ((userStats.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Level Progress */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-bold text-blue-900">
              Level {userStats.level}
            </span>
          </div>
          <Progress value={progressToNextLevel} className="h-2 mb-2" />
          <p className="text-xs text-blue-700">
            {userStats.totalXP - currentLevelXP} / {nextLevelXP - currentLevelXP} XP
          </p>
        </CardContent>
      </Card>

      {/* Journal Entries */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            <span className="text-lg font-bold text-green-900">
              {userStats.totalJournalEntries}
            </span>
          </div>
          <p className="text-xs text-green-700">Journal Entries</p>
          <p className="text-xs text-green-600 mt-1">
            {userStats.currentStreak} day streak
          </p>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span className="text-lg font-bold text-purple-900">
              {userStats.goalsCompleted}
            </span>
          </div>
          <p className="text-xs text-purple-700">Goals Completed</p>
          <p className="text-xs text-purple-600 mt-1">
            {Math.round(userStats.goalsCompletionRate)}% success rate
          </p>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="text-lg font-bold text-yellow-900">
              {unlockedAchievementsCount}
            </span>
          </div>
          <p className="text-xs text-yellow-700">Achievements</p>
          <p className="text-xs text-yellow-600 mt-1">
            {userStats.totalXP} total XP
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressOverview;
