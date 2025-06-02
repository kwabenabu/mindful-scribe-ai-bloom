
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { analyzeSentiment, getSentimentLabel } from '@/utils/sentimentAnalysis';
import { Loader2, Send } from 'lucide-react';

interface SimplifiedJournalFormProps {
  onEntryCreated?: () => void;
}

const SimplifiedJournalForm: React.FC<SimplifiedJournalFormProps> = ({ onEntryCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSentiment, setPreviewSentiment] = useState<{ score: number; keywords: string[] } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleContentChange = (value: string) => {
    setContent(value);
    
    // Show live sentiment preview for longer texts
    if (value.length > 50) {
      const sentiment = analyzeSentiment(value);
      setPreviewSentiment(sentiment);
    } else {
      setPreviewSentiment(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create journal entries",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your journal entry",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Analyze sentiment
      const sentimentResult = analyzeSentiment(content);
      
      const { data, error } = await supabase
        .from('journals')
        .insert({
          content: content.trim(),
          user_id: user.id,
          sentiment_score: sentimentResult.score,
          sentiment_keywords: sentimentResult.keywords,
          sentiment_analysis_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating journal entry:', error);
        throw error;
      }

      console.log('Journal entry created successfully:', data);
      
      toast({
        title: "Journal entry created",
        description: `Your entry has been saved with ${getSentimentLabel(sentimentResult.score).toLowerCase()} sentiment`,
      });

      setContent('');
      setPreviewSentiment(null);
      
      if (onEntryCreated) {
        onEntryCreated();
      }
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            New Journal Entry
            {previewSentiment && (
              <Badge 
                className={`
                  ${previewSentiment.score >= 0.6 ? 'bg-green-500' : 
                    previewSentiment.score >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'}
                `}
              >
                {getSentimentLabel(previewSentiment.score)} ({Math.round(previewSentiment.score * 100)}%)
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="What's on your mind today? Share your thoughts, experiences, or reflections..."
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-[200px] resize-none"
                disabled={isSubmitting}
              />
            </div>
            
            {previewSentiment && previewSentiment.keywords.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Detected keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {previewSentiment.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Save Entry
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedJournalForm;
