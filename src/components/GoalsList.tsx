import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Target, Calendar, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Goal {
  id: number;
  title: string;
  description?: string;
  status: string; // Changed from union type to string to match Supabase data
  target_frequency?: string;
  created_at: string;
}

const GoalsList = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const toggleGoalCompletion = async (goalId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
    
    try {
      const { error } = await supabase
        .from('goals')
        .update({ 
          status: newStatus,
          last_updated: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) {
        throw error;
      }

      setGoals(goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, status: newStatus }
          : goal
      ));

      toast({
        title: "Success",
        description: `Goal marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading your goals...</div>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <p className="mb-2">No goals yet</p>
            <p className="text-sm">Start writing journal entries to detect and track goals automatically!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Your Goals ({completedGoals.length}/{goals.length} completed)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeGoals.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Active Goals</h3>
            <div className="space-y-2">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => toggleGoalCompletion(goal.id, goal.status)}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Created {new Date(goal.created_at).toLocaleDateString()}
                      </span>
                      {goal.target_frequency && (
                        <Badge variant="outline" className="text-xs">
                          {goal.target_frequency}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedGoals.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Completed Goals</h3>
            <div className="space-y-2">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-green-50">
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => toggleGoalCompletion(goal.id, goal.status)}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-through">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-sm text-gray-600 line-through">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">Completed</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsList;
