
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap } from 'lucide-react';
import { Achievement, UserStats } from '@/types/achievements';

interface GamificationPanelProps {
  userStats: UserStats;
  achievements: Achievement[];
}

const GamificationPanel = ({ userStats, achievements }: GamificationPanelProps) => {
  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const nextLevelXP = (userStats.level + 1) * 100;
  const currentLevelXP = userStats.level * 100;
  const progressToNextLevel = ((userStats.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const recentAchievements = unlockedAchievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-400" />
        Your Progress
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level & XP */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-6 w-6 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">
                Level {userStats.level}
              </span>
            </div>
            <div className="space-y-2">
              <Progress value={progressToNextLevel} className="h-2" />
              <p className="text-xs text-gray-400">
                {userStats.totalXP - currentLevelXP} / {nextLevelXP - currentLevelXP} XP
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total XP */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-6 w-6 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">
                {userStats.totalXP}
              </span>
            </div>
            <p className="text-xs text-gray-400">Total Experience</p>
          </CardContent>
        </Card>

        {/* Achievements Count */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">
                {unlockedAchievements.length}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              of {achievements.length} Achievements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{achievement.title}</h4>
                    <p className="text-gray-400 text-sm">{achievement.description}</p>
                  </div>
                  <div className="text-yellow-400 text-sm font-semibold">
                    +{achievement.xpReward} XP
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GamificationPanel;
