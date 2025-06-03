
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserStats } from '@/types/achievements';

interface WeeklyGoalsSectionProps {
  userStats: UserStats;
}

const WeeklyGoalsSection: React.FC<WeeklyGoalsSectionProps> = ({ userStats }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-500" />
          This Week's Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Weekly Consistency</span>
          <span className="text-sm font-medium">{Math.round(userStats.weeklyConsistency)}%</span>
        </div>
        <Progress value={userStats.weeklyConsistency} className="h-2" />
        
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Active Goals</span>
            <span className="font-medium">{userStats.totalGoals - userStats.goalsCompleted}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Completed This Week</span>
            <span className="font-medium text-green-600">{userStats.goalsCompleted}</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full mt-4" 
          onClick={() => navigate('/insights')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          View Detailed Analytics
        </Button>
      </CardContent>
    </Card>
  );
};

export default WeeklyGoalsSection;
