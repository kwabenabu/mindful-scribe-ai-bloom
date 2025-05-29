
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Heart, TrendingUp, AlertCircle, Lightbulb, Calendar, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JournalEntry {
  id: number;
  content: string;
  mood?: string;
  created_at: string;
}

interface FeedbackSuggestion {
  type: 'positive' | 'neutral' | 'concern';
  title: string;
  message: string;
  action: string;
  icon: React.ComponentType<any>;
}

const SentimentFeedback = () => {
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [feedback, setFeedback] = useState<FeedbackSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchRecentEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, content, mood, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7);

      if (error) throw error;
      setRecentEntries(data || []);
    } catch (error) {
      console.error('Error fetching recent entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSentiment = (entries: JournalEntry[]): FeedbackSuggestion[] => {
    const suggestions: FeedbackSuggestion[] = [];
    
    if (entries.length === 0) {
      suggestions.push({
        type: 'neutral',
        title: 'Start Your Journey',
        message: 'Begin by writing your first journal entry to track your emotional patterns.',
        action: 'Write your first entry',
        icon: BookOpen
      });
      return suggestions;
    }

    // Analyze mood patterns
    const moods = entries.filter(e => e.mood).map(e => e.mood);
    const positiveMoods = moods.filter(m => ['happy', 'excited', 'grateful', 'peaceful'].includes(m || ''));
    const negativeMoods = moods.filter(m => ['sad', 'anxious', 'frustrated', 'angry'].includes(m || ''));

    // Check writing consistency
    const daysWritten = new Set(entries.map(e => new Date(e.created_at).toDateString())).size;
    
    if (daysWritten >= 5) {
      suggestions.push({
        type: 'positive',
        title: 'Excellent Consistency!',
        message: `You've written ${daysWritten} days this week. Your commitment to self-reflection is paying off.`,
        action: 'Keep up the great work',
        icon: TrendingUp
      });
    } else if (daysWritten >= 3) {
      suggestions.push({
        type: 'neutral',
        title: 'Good Progress',
        message: `You've written ${daysWritten} days this week. Try to write a little more regularly for better insights.`,
        action: 'Set a daily reminder',
        icon: Calendar
      });
    } else {
      suggestions.push({
        type: 'concern',
        title: 'Write More Regularly',
        message: 'Regular journaling helps you better understand your patterns and emotions.',
        action: 'Schedule daily writing time',
        icon: AlertCircle
      });
    }

    // Analyze sentiment trends
    if (positiveMoods.length > negativeMoods.length) {
      suggestions.push({
        type: 'positive',
        title: 'Positive Mindset',
        message: 'Your recent entries show a predominantly positive outlook. This is wonderful for your mental well-being.',
        action: 'Share your gratitude',
        icon: Heart
      });
    } else if (negativeMoods.length > positiveMoods.length) {
      suggestions.push({
        type: 'concern',
        title: 'Emotional Support',
        message: 'Your recent entries suggest you might be going through a challenging time. Consider self-care activities.',
        action: 'Practice mindfulness',
        icon: AlertCircle
      });
    }

    // Content-based suggestions
    const combinedContent = entries.map(e => e.content.toLowerCase()).join(' ');
    
    if (combinedContent.includes('stress') || combinedContent.includes('overwhelm')) {
      suggestions.push({
        type: 'concern',
        title: 'Stress Management',
        message: 'You mentioned feeling stressed recently. Consider incorporating relaxation techniques.',
        action: 'Try breathing exercises',
        icon: Lightbulb
      });
    }

    if (combinedContent.includes('goal') || combinedContent.includes('achieve')) {
      suggestions.push({
        type: 'positive',
        title: 'Goal-Oriented Thinking',
        message: 'You\'re showing great focus on your goals and achievements. Keep this momentum!',
        action: 'Set new challenges',
        icon: TrendingUp
      });
    }

    return suggestions;
  };

  useEffect(() => {
    fetchRecentEntries();
  }, [user]);

  useEffect(() => {
    if (recentEntries.length > 0) {
      const suggestions = analyzeSentiment(recentEntries);
      setFeedback(suggestions);
    }
  }, [recentEntries]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Analyzing your recent entries...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Personalized Insights & Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback.map((item, index) => (
          <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border bg-gray-50">
            <item.icon className={`h-5 w-5 mt-0.5 ${
              item.type === 'positive' ? 'text-green-600' : 
              item.type === 'concern' ? 'text-orange-600' : 'text-blue-600'
            }`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <Badge variant={
                  item.type === 'positive' ? 'default' : 
                  item.type === 'concern' ? 'destructive' : 'secondary'
                }>
                  {item.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.message}</p>
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs"
              >
                {item.action}
              </Button>
            </div>
          </div>
        ))}
        
        {feedback.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Write more entries to receive personalized insights and suggestions.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentFeedback;
