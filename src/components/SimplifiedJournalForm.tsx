
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Target, Send, Calendar } from 'lucide-react';
import WeeklyGoalsDialog from './WeeklyGoalsDialog';
import EventDetectionDialog from './calendar/EventDetectionDialog';
import { detectEventsFromText, type DetectedEvent, type EventDetectionResult } from '@/utils/eventDetection';

interface SimplifiedJournalFormProps {
  onEntryCreated?: () => void;
}

const SimplifiedJournalForm: React.FC<SimplifiedJournalFormProps> = ({ onEntryCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [detectedEvents, setDetectedEvents] = useState<EventDetectionResult>({ events: [], hasHighConfidenceEvents: false });
  const [savedJournalId, setSavedJournalId] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;

    setIsSubmitting(true);
    try {
      // Detect events from the content before saving
      const eventDetection = detectEventsFromText(content.trim());
      console.log('Detected events:', eventDetection);

      const { data: journalData, error } = await supabase
        .from('journals')
        .insert({
          user_id: user.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setContent('');
      toast({
        title: "Entry Saved",
        description: "Your journal entry has been saved successfully"
      });

      // Store the journal ID and detected events for the dialog
      setSavedJournalId(journalData.id);
      setDetectedEvents(eventDetection);

      // Show event detection dialog if events are detected
      if (eventDetection.events.length > 0) {
        console.log('Opening event detection dialog with events:', eventDetection.events);
        setShowEventDialog(true);
      }

      if (onEntryCreated) {
        onEntryCreated();
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleEventConfirmation = () => {
    setShowEventDialog(false);
    setDetectedEvents({ events: [], hasHighConfidenceEvents: false });
    setSavedJournalId(null);
    toast({
      title: "Events Processed",
      description: "Detected events have been saved for calendar integration",
    });
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind today? Share your thoughts, experiences, or reflections..."
              className="min-h-[200px] border-0 shadow-none resize-none text-lg leading-relaxed placeholder:text-gray-400 focus-visible:ring-0 font-serif"
              style={{
                fontSize: '18px',
                lineHeight: '1.8',
                fontFamily: 'Georgia, "Times New Roman", Times, serif'
              }}
            />
            
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGoals(true)}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Weekly Goals
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Cmd/Ctrl + Enter to save
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <WeeklyGoalsDialog
        isOpen={showGoals}
        onClose={() => setShowGoals(false)}
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

export default SimplifiedJournalForm;
