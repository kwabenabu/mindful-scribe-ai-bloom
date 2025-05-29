
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Target, Plus, CheckCircle2 } from 'lucide-react';
import { startOfWeek, format } from 'date-fns';

interface WeeklyGoal {
  id: string;
  goal_text: string;
  is_completed: boolean;
  week_start_date: string;
}

interface WeeklyGoalsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const WeeklyGoalsDialog: React.FC<WeeklyGoalsDialogProps> = ({ isOpen, onClose }) => {
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd');

  useEffect(() => {
    if (isOpen && user) {
      fetchWeeklyGoals();
    }
  }, [isOpen, user]);

  const fetchWeeklyGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', currentWeekStart)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching weekly goals:', error);
      toast({
        title: "Error",
        description: "Failed to load weekly goals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addGoal = async () => {
    if (!user || !newGoal.trim()) return;

    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('weekly_goals')
        .insert({
          user_id: user.id,
          goal_text: newGoal.trim(),
          week_start_date: currentWeekStart,
          is_completed: false
        })
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [...prev, data]);
      setNewGoal('');

      toast({
        title: "Goal Added",
        description: "Your weekly goal has been added successfully"
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to add goal",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const toggleGoal = async (goalId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('weekly_goals')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev =>
        prev.map(goal =>
          goal.id === goalId
            ? { ...goal, is_completed: isCompleted }
            : goal
        )
      );

      toast({
        title: isCompleted ? "Goal Completed!" : "Goal Updated",
        description: isCompleted 
          ? "Congratulations on completing your goal!" 
          : "Goal status updated"
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

  const completedCount = goals.filter(goal => goal.is_completed).length;
  const totalCount = goals.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Weekly Goals
          </DialogTitle>
          <DialogDescription>
            Week of {format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'MMM d, yyyy')}
            {totalCount > 0 && (
              <span className="block mt-1">
                {completedCount} of {totalCount} completed
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new goal */}
          <div className="flex space-x-2">
            <Input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a new weekly goal..."
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            />
            <Button
              onClick={addGoal}
              disabled={!newGoal.trim() || isAdding}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Goals list */}
          {isLoading ? (
            <div className="text-center text-gray-500 py-4">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No goals for this week yet. Add one above!
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    checked={goal.is_completed}
                    onCheckedChange={(checked) =>
                      toggleGoal(goal.id, checked as boolean)
                    }
                  />
                  <Label
                    className={`flex-1 cursor-pointer ${
                      goal.is_completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-900'
                    }`}
                  >
                    {goal.goal_text}
                  </Label>
                  {goal.is_completed && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Progress indicator */}
          {totalCount > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyGoalsDialog;
