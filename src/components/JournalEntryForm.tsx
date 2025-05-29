
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { generateTitleAndTags } from '@/utils/aiUtils';

interface JournalEntryFormProps {
  onEntryCreated?: () => void;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onEntryCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Auto-generate title and tags when content reaches a reasonable length
    if (newContent.length > 50 && !isGenerating) {
      setIsGenerating(true);
      try {
        const { title, tags } = await generateTitleAndTags(newContent);
        setGeneratedTitle(title);
        setGeneratedTags(tags);
      } catch (error) {
        console.error('Error generating title and tags:', error);
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

      const { error } = await supabase
        .from('journals')
        .insert({
          content: content.trim(),
          user_id: user.id,
          extracted_goals: { title: finalTitle, tags: finalTags }
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Journal entry created successfully!"
      });

      setContent('');
      setGeneratedTitle('');
      setGeneratedTags([]);
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

  return (
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

          {isGenerating && (
            <div className="text-sm text-gray-500 italic">
              Generating title and tags...
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
  );
};

export default JournalEntryForm;
