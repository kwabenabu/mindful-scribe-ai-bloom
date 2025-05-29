
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Target, Send } from 'lucide-react';
import WeeklyGoalsDialog from './WeeklyGoalsDialog';

interface SimplifiedJournalFormProps {
  onEntryCreated?: () => void;
}

const SimplifiedJournalForm: React.FC<SimplifiedJournalFormProps> = ({ onEntryCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('journals')
        .insert({
          user_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;

      setContent('');
      toast({
        title: "Entry Saved",
        description: "Your journal entry has been saved successfully"
      });

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
    </>
  );
};

export default SimplifiedJournalForm;
