
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Achievement } from '@/types/achievements';

interface RecentAchievementsProps {
  unlockedAchievements: Achievement[];
}

const RecentAchievements: React.FC<RecentAchievementsProps> = ({ unlockedAchievements }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {unlockedAchievements.length > 0 ? (
          <div className="space-y-3">
            {unlockedAchievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                <div className="text-lg">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  +{achievement.xpReward} XP
                </Badge>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={() => navigate('/insights')}
            >
              <Trophy className="h-4 w-4 mr-2" />
              View All Achievements
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-2">No achievements yet</p>
            <p className="text-xs text-gray-400">Keep journaling to unlock your first achievement!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentAchievements;
