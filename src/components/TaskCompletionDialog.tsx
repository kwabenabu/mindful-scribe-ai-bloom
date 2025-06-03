import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckSquare, Target, Calendar, Trophy } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  type: 'goal' | 'task';
  category: string;
  timeframe?: string;
}

interface TaskCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const TaskCompletionDialog: React.FC<TaskCompletionDialogProps> = ({ isOpen, onClose }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      fetchTasks();
    }
  }, [isOpen, user]);

  const fetchTasks = async () => {
    try {
      // Fetch goals from the goals table
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .neq('status', 'completed');

      if (goalsError) throw goalsError;

      // Fetch tasks from journal entries (extracted_goals)
      const { data: journalsData, error: journalsError } = await supabase
        .from('journals')
        .select('id, extracted_goals')
        .eq('user_id', user?.id)
        .not('extracted_goals', 'is', null);

      if (journalsError) throw journalsError;

      // Process goals from database
      const dbTasks: Task[] = (goalsData || []).map(goal => ({
        id: `goal-${goal.id}`,
        text: goal.title || goal.description || '',
        completed: goal.status === 'completed',
        type: 'goal' as const,
        category: 'personal',
        timeframe: goal.target_frequency
      }));

      // Process tasks from journal entries
      const journalTasks: Task[] = [];
      (journalsData || []).forEach(journal => {
        const extractedGoals = journal.extracted_goals as any;
        if (extractedGoals?.detectedGoals) {
          extractedGoals.detectedGoals.forEach((goal: any) => {
            journalTasks.push({
              id: `journal-goal-${journal.id}-${goal.id}`,
              text: goal.text,
              completed: false,
              type: goal.type || 'goal',
              category: goal.category || 'other',
              timeframe: goal.timeframe
            });
          });
        }
        if (extractedGoals?.detectedTasks) {
          extractedGoals.detectedTasks.forEach((task: any) => {
            journalTasks.push({
              id: `journal-task-${journal.id}-${task.id}`,
              text: task.text,
              completed: false,
              type: task.type || 'task',
              category: task.category || 'other',
              timeframe: task.timeframe
            });
          });
        }
      });

      setTasks([...dbTasks, ...journalTasks]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    
    // Update local state immediately
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === taskId ? { ...t, completed: newCompleted } : t
      )
    );

    // Update database if it's a goal from the goals table
    if (taskId.startsWith('goal-')) {
      const goalIdString = taskId.replace('goal-', '');
      const goalId = parseInt(goalIdString, 10);
      
      if (isNaN(goalId)) {
        console.error('Invalid goal ID:', goalIdString);
        return;
      }
      
      try {
        const { error } = await supabase
          .from('goals')
          .update({ 
            status: newCompleted ? 'completed' : 'active',
            last_updated: new Date().toISOString()
          })
          .eq('id', goalId);

        if (error) throw error;

        toast({
          title: newCompleted ? "Task Completed!" : "Task Reopened",
          description: newCompleted 
            ? "Great job completing your task!" 
            : "Task marked as not completed",
        });
      } catch (error) {
        console.error('Error updating goal:', error);
        // Revert local state on error
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === taskId ? { ...t, completed: !newCompleted } : t
          )
        );
        toast({
          title: "Error",
          description: "Failed to update task status",
          variant: "destructive"
        });
      }
    } else {
      // For journal-extracted tasks, just show success message
      toast({
        title: newCompleted ? "Task Completed!" : "Task Reopened",
        description: newCompleted 
          ? "Great job completing your task!" 
          : "Task marked as not completed",
      });
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Your Tasks & Goals
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading your tasks...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Progress Overview</span>
                <Badge variant="outline">
                  {completedCount}/{totalCount} completed
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* Tasks List */}
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks or goals found</p>
                <p className="text-sm text-gray-400">Start journaling to automatically detect your goals!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      task.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {task.type === 'goal' ? (
                            <><Target className="h-3 w-3 mr-1" />Goal</>
                          ) : (
                            <><CheckSquare className="h-3 w-3 mr-1" />Task</>
                          )}
                        </Badge>
                        {task.timeframe && (
                          <Badge variant="secondary" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {task.timeframe}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {task.category}
                        </Badge>
                      </div>
                    </div>
                    {task.completed && (
                      <Trophy className="h-5 w-5 text-yellow-500 mt-1" />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskCompletionDialog;
