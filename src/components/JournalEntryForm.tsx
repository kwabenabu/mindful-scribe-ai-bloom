
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { generateTitleAndTags } from '@/utils/aiUtils';
import { detectGoalsAndTasks, type DetectedGoal, type GoalDetectionResult } from '@/utils/goalDetection';
import { detectEventsFromText, type DetectedEvent, type EventDetectionResult } from '@/utils/eventDetection';
import GoalConfirmationDialog from './GoalConfirmationDialog';
import EventDetectionDialog from './calendar/EventDetectionDialog';
import { Target, CheckSquare, Calendar, Clock } from 'lucide-react';

interface JournalEntryFormProps {
  onEntryCreated?: () => void;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onEntryCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [detectedGoals, setDetectedGoals] = useState<GoalDetectionResult>({ goals: [], tasks: [] });
  const [detectedEvents, setDetectedEvents] = useState<EventDetectionResult>({ events: [], hasHighConfidenceEvents: false });
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [confirmedGoals, setConfirmedGoals] = useState<DetectedGoal[]>([]);
  const [confirmedTasks, setConfirmedTasks] = useState<DetectedGoal[]>([]);
  const [confirmedEvents, setConfirmedEvents] = useState<DetectedEvent[]>([]);
  const [savedJournalId, setSavedJournalId] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Auto-generate title, tags, goals, and events when content reaches a reasonable length
    if (newContent.length > 50 && !isGenerating) {
      setIsGenerating(true);
      try {
        const { title, tags } = await generateTitleAndTags(newContent);
        setGeneratedTitle(title);
        setGeneratedTags(tags);

        // Detect goals and tasks
        const goalDetection = detectGoalsAndTasks(newContent);
        setDetectedGoals(goalDetection);

        // Detect events
        const eventDetection = detectEventsFromText(newContent);
        setDetectedEvents(eventDetection);
        
        if (goalDetection.goals.length > 0 || goalDetection.tasks.length > 0) {
          console.log('Detected goals and tasks:', goalDetection);
        }

        if (eventDetection.events.length > 0) {
          console.log('Detected events:', eventDetection);
        }
      } catch (error) {
        console.error('Error generating content analysis:', error);
        // Fallback to timestamp-based title
        const now = new Date();
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
        const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        setGeneratedTitle(`${dayOfWeek}, ${date}`);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleGoalConfirmation = (goals: DetectedGoal[], tasks: DetectedGoal[]) => {
    setConfirmedGoals(goals);
    setConfirmedTasks(tasks);
    setShowGoalDialog(false);
    
    if (goals.length > 0 || tasks.length > 0) {
      toast({
        title: "Goals & Tasks Confirmed",
        description: `Added ${goals.length} goals and ${tasks.length} tasks to track`,
      });
    }
  };

  const handleEventConfirmation = () => {
    setShowEventDialog(false);
    toast({
      title: "Events Processed",
      description: "Detected events have been saved for calendar integration",
    });
  };

  const saveGoalsAndTasks = async (journalId: number) => {
    try {
      // Save confirmed goals
      for (const goal of confirmedGoals) {
        const { error: goalError } = await supabase
          .from('goals')
          .insert({
            title: goal.text,
            description: `From journal entry: "${goal.text}"`,
            status: 'active',
            user_id: user?.id,
            target_frequency: goal.timeframe || null,
          });

        if (goalError) {
          console.error('Error saving goal:', goalError);
        }
      }

      // For tasks, you might want to save them to a tasks table or 
      // handle them differently. For now, we'll log them.
      if (confirmedTasks.length > 0) {
        console.log('Confirmed tasks to be handled:', confirmedTasks);
      }
    } catch (error) {
      console.error('Error saving goals and tasks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please write something in your journal entry",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create journal entries",
        variant: "destructive"
      });
      return;
    }

    // Show goal confirmation dialog if goals/tasks detected and not yet confirmed
    if ((detectedGoals.goals.length > 0 || detectedGoals.tasks.length > 0) && 
        confirmedGoals.length === 0 && confirmedTasks.length === 0) {
      setShowGoalDialog(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate final title if not already generated
      let finalTitle = generatedTitle;
      let finalTags = generatedTags;
      
      if (!finalTitle) {
        const now = new Date();
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
        const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        finalTitle = `${dayOfWeek}, ${date}`;
      }

      // Convert DetectedGoal objects to plain objects for JSON storage
      const extractedGoalsData = {
        title: finalTitle,
        tags: finalTags,
        detectedGoals: confirmedGoals.map(goal => ({
          id: goal.id,
          text: goal.text,
          type: goal.type,
          category: goal.category,
          confidence: goal.confidence,
          timeframe: goal.timeframe,
          startIndex: goal.startIndex,
          endIndex: goal.endIndex
        })),
        detectedTasks: confirmedTasks.map(task => ({
          id: task.id,
          text: task.text,
          type: task.type,
          category: task.category,
          confidence: task.confidence,
          timeframe: task.timeframe,
          startIndex: task.startIndex,
          endIndex: task.endIndex
        }))
      };

      const { data: journalData, error } = await supabase
        .from('journals')
        .insert({
          content: content.trim(),
          user_id: user.id,
          extracted_goals: extractedGoalsData
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Save the journal ID for event processing
      setSavedJournalId(journalData.id);

      // Save goals and tasks to their respective tables
      if (journalData && (confirmedGoals.length > 0 || confirmedTasks.length > 0)) {
        await saveGoalsAndTasks(journalData.id);
      }

      // Show event detection dialog if events are detected
      if (detectedEvents.events.length > 0) {
        setShowEventDialog(true);
      }

      toast({
        title: "Success",
        description: "Journal entry created successfully!"
      });

      setContent('');
      setGeneratedTitle('');
      setGeneratedTags([]);
      setDetectedGoals({ goals: [], tasks: [] });
      setDetectedEvents({ events: [], hasHighConfidenceEvents: false });
      setConfirmedGoals([]);
      setConfirmedTasks([]);
      onEntryCreated?.();
    } catch (error) {
      console.error('Error creating journal entry:', error);
      toast({
        title: "Error",
        description: "Failed to create journal entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setGeneratedTags(tags => tags.filter(tag => tag !== tagToRemove));
  };

  const hasDetectedGoals = detectedGoals.goals.length > 0 || detectedGoals.tasks.length > 0;
  const hasConfirmedGoals = confirmedGoals.length > 0 || confirmedTasks.length > 0;
  const hasDetectedEvents = detectedEvents.events.length > 0;

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>New Journal Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {generatedTitle && (
              <div className="p-3 bg-blue-50 rounded-lg border">
                <p className="text-sm text-blue-600 font-medium">Auto-generated title:</p>
                <p className="text-blue-800">{generatedTitle}</p>
              </div>
            )}
            
            <div>
              <Textarea
                placeholder="What's on your mind today? Share your thoughts, experiences, and reflections..."
                value={content}
                onChange={handleContentChange}
                className="min-h-[200px] resize-none"
                disabled={isSubmitting}
              />
            </div>

            {generatedTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">AI-generated tags:</p>
                <div className="flex flex-wrap gap-2">
                  {generatedTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Click on a tag to remove it</p>
              </div>
            )}

            {hasDetectedGoals && !hasConfirmedGoals && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-medium text-amber-800">Goals & Tasks Detected</p>
                </div>
                <p className="text-sm text-amber-700 mb-3">
                  We found {detectedGoals.goals.length} potential goals and {detectedGoals.tasks.length} tasks in your entry.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGoalDialog(true)}
                  className="text-amber-700 border-amber-300 hover:bg-amber-100"
                >
                  Review & Confirm
                </Button>
              </div>
            )}

            {hasConfirmedGoals && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-800">Ready to Track</p>
                </div>
                <p className="text-sm text-green-700">
                  {confirmedGoals.length} goals and {confirmedTasks.length} tasks will be added to your tracking system.
                </p>
              </div>
            )}

            {hasDetectedEvents && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-medium text-purple-800">Events Detected</p>
                </div>
                <p className="text-sm text-purple-700 mb-3">
                  We found {detectedEvents.events.length} potential calendar events in your entry.
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-purple-600">
                    Events will be processed after saving your journal entry
                  </span>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="text-sm text-gray-500 italic">
                Analyzing content and generating insights...
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setContent('');
                  setGeneratedTitle('');
                  setGeneratedTags([]);
                  setDetectedGoals({ goals: [], tasks: [] });
                  setDetectedEvents({ events: [], hasHighConfidenceEvents: false });
                  setConfirmedGoals([]);
                  setConfirmedTasks([]);
                }}
                disabled={isSubmitting}
              >
                Clear
              </Button>
              <Button type="submit" disabled={isSubmitting || !content.trim()}>
                {isSubmitting ? 'Saving...' : 'Save Entry'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <GoalConfirmationDialog
        isOpen={showGoalDialog}
        onClose={() => setShowGoalDialog(false)}
        detectedItems={detectedGoals}
        onConfirm={handleGoalConfirmation}
      />

      <EventDetectionDialog
        isOpen={showEventDialog}
        onClose={() => setShowEventDialog(false)}
        detectedEvents={detectedEvents.events}
        journalEntryId={savedJournalId || undefined}
        onEventsConfirmed={handleEventConfirmation}
      />
    </>
  );
};

export default JournalEntryForm;
