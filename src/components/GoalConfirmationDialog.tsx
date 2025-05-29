
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, CheckSquare, Clock, Tag } from 'lucide-react';
import type { DetectedGoal, GoalDetectionResult } from '@/utils/goalDetection';

interface GoalConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  detectedItems: GoalDetectionResult;
  onConfirm: (confirmedGoals: DetectedGoal[], confirmedTasks: DetectedGoal[]) => void;
}

const CATEGORY_COLORS = {
  health: 'bg-green-100 text-green-800',
  learning: 'bg-blue-100 text-blue-800',
  career: 'bg-purple-100 text-purple-800',
  personal: 'bg-pink-100 text-pink-800',
  creative: 'bg-orange-100 text-orange-800',
  financial: 'bg-yellow-100 text-yellow-800',
  home: 'bg-gray-100 text-gray-800',
  other: 'bg-slate-100 text-slate-800',
};

const CATEGORY_OPTIONS = [
  { value: 'health', label: 'Health & Fitness' },
  { value: 'learning', label: 'Learning & Education' },
  { value: 'career', label: 'Career & Work' },
  { value: 'personal', label: 'Personal & Social' },
  { value: 'creative', label: 'Creative & Arts' },
  { value: 'financial', label: 'Financial' },
  { value: 'home', label: 'Home & Lifestyle' },
  { value: 'other', label: 'Other' },
];

const GoalConfirmationDialog: React.FC<GoalConfirmationDialogProps> = ({
  isOpen,
  onClose,
  detectedItems,
  onConfirm,
}) => {
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [goalCategories, setGoalCategories] = useState<Record<string, string>>({});
  const [taskCategories, setTaskCategories] = useState<Record<string, string>>({});

  React.useEffect(() => {
    // Pre-select all detected items and set initial categories
    const goalIds = detectedItems.goals.map(g => g.id);
    const taskIds = detectedItems.tasks.map(t => t.id);
    
    setSelectedGoals(new Set(goalIds));
    setSelectedTasks(new Set(taskIds));
    
    const initialGoalCategories: Record<string, string> = {};
    const initialTaskCategories: Record<string, string> = {};
    
    detectedItems.goals.forEach(goal => {
      initialGoalCategories[goal.id] = goal.category;
    });
    
    detectedItems.tasks.forEach(task => {
      initialTaskCategories[task.id] = task.category;
    });
    
    setGoalCategories(initialGoalCategories);
    setTaskCategories(initialTaskCategories);
  }, [detectedItems]);

  const toggleGoalSelection = (goalId: string) => {
    const newSelected = new Set(selectedGoals);
    if (newSelected.has(goalId)) {
      newSelected.delete(goalId);
    } else {
      newSelected.add(goalId);
    }
    setSelectedGoals(newSelected);
  };

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const updateGoalCategory = (goalId: string, category: string) => {
    setGoalCategories(prev => ({ ...prev, [goalId]: category }));
  };

  const updateTaskCategory = (taskId: string, category: string) => {
    setTaskCategories(prev => ({ ...prev, [taskId]: category }));
  };

  const handleConfirm = () => {
    const confirmedGoals = detectedItems.goals
      .filter(goal => selectedGoals.has(goal.id))
      .map(goal => ({ ...goal, category: goalCategories[goal.id] || goal.category }));
    
    const confirmedTasks = detectedItems.tasks
      .filter(task => selectedTasks.has(task.id))
      .map(task => ({ ...task, category: taskCategories[task.id] || task.category }));
    
    onConfirm(confirmedGoals, confirmedTasks);
    onClose();
  };

  const hasDetectedItems = detectedItems.goals.length > 0 || detectedItems.tasks.length > 0;

  if (!hasDetectedItems) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Goals & Tasks Detected
          </DialogTitle>
          <p className="text-sm text-gray-600">
            We found potential goals and tasks in your journal entry. Please review and confirm which ones you'd like to track.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {detectedItems.goals.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-3">
                <Target className="h-4 w-4" />
                Goals ({detectedItems.goals.length})
              </h3>
              <div className="space-y-3">
                {detectedItems.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-3 border rounded-lg ${
                      selectedGoals.has(goal.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedGoals.has(goal.id)}
                        onCheckedChange={() => toggleGoalSelection(goal.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium text-gray-900">{goal.text}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Select
                            value={goalCategories[goal.id] || goal.category}
                            onValueChange={(value) => updateGoalCategory(goal.id, value)}
                          >
                            <SelectTrigger className="w-[180px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORY_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {goal.timeframe && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {goal.timeframe}
                            </Badge>
                          )}
                          
                          <Badge variant="outline" className="text-xs">
                            Confidence: {Math.round(goal.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detectedItems.tasks.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-3">
                <CheckSquare className="h-4 w-4" />
                Tasks ({detectedItems.tasks.length})
              </h3>
              <div className="space-y-3">
                {detectedItems.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 border rounded-lg ${
                      selectedTasks.has(task.id) ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={() => toggleTaskSelection(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium text-gray-900">{task.text}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Select
                            value={taskCategories[task.id] || task.category}
                            onValueChange={(value) => updateTaskCategory(task.id, value)}
                          >
                            <SelectTrigger className="w-[180px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORY_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Badge variant="outline" className="text-xs">
                            Confidence: {Math.round(task.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Skip
          </Button>
          <Button onClick={handleConfirm}>
            Add Selected ({selectedGoals.size + selectedTasks.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoalConfirmationDialog;
