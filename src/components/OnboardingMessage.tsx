
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Target, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingMessageProps {
  onDismiss?: () => void;
}

const OnboardingMessage: React.FC<OnboardingMessageProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkShouldShowOnboarding();
  }, [user]);

  const checkShouldShowOnboarding = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Check if user has any journal entries
      const { data: journalData, error: journalError } = await supabase
        .from('journals')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (journalError) {
        console.error('Error checking journals:', journalError);
        setIsLoading(false);
        return;
      }

      // Check if user profile indicates they're first time
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('is_first_time')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError);
      }

      // Show onboarding if user has no journal entries AND is marked as first time
      const hasJournalEntries = journalData && journalData.length > 0;
      const isFirstTime = !profileData || profileData.is_first_time !== false;
      
      setIsVisible(!hasJournalEntries && isFirstTime);
    } catch (error) {
      console.error('Error in onboarding check:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    navigate('/journal');
    setIsVisible(false);
    onDismiss?.();
  };

  const handleDismiss = async () => {
    try {
      // Update user profile to mark they've seen onboarding
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: user?.id,
          is_first_time: false,
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    
    setIsVisible(false);
    onDismiss?.();
  };

  if (isLoading || !isVisible) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <BookOpen className="h-16 w-16 text-blue-500" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        <CardTitle className="text-2xl text-blue-900">
          Ready to Start Journaling?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <p className="text-blue-800 text-lg leading-relaxed">
          Welcome to your personal journaling space! This is where you'll capture your thoughts, 
          track your goals, and reflect on your journey.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg border border-blue-200">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <h3 className="font-medium text-blue-900">Write Freely</h3>
            <p className="text-sm text-blue-700">Express your thoughts and experiences</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg border border-purple-200">
            <Target className="h-8 w-8 text-purple-500" />
            <h3 className="font-medium text-purple-900">Track Goals</h3>
            <p className="text-sm text-purple-700">We'll automatically detect your goals</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg border border-green-200">
            <Calendar className="h-8 w-8 text-green-500" />
            <h3 className="font-medium text-green-900">Build Habits</h3>
            <p className="text-sm text-green-700">Develop a consistent journaling routine</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-8"
          >
            <BookOpen className="h-5 w-5" />
            <span>Start Writing Your First Entry</span>
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={handleDismiss}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-sm text-blue-600 mt-4">
          💡 Tip: There's no wrong way to journal - just be authentic and let your thoughts flow!
        </p>
      </CardContent>
    </Card>
  );
};

export default OnboardingMessage;
