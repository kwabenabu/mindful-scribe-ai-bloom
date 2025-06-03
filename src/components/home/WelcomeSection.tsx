
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomeSectionProps {
  displayName: string;
  isFirstTime: boolean;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ displayName, isFirstTime }) => {
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {getGreeting()}, {displayName}!
        </h1>
        {isFirstTime ? (
          <div className="space-y-2">
            <p className="text-xl text-gray-600">
              Welcome to your personal journaling space
            </p>
            <p className="text-gray-500">
              Ready to start your journaling journey? Let's capture your first thoughts.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xl text-gray-600">
              Welcome back to your journal
            </p>
            <p className="text-gray-500">
              Continue capturing your thoughts, tracking your growth, and reflecting on your journey.
            </p>
          </div>
        )}
      </div>

      {/* First Time User Box */}
      {isFirstTime && (
        <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center text-blue-900">
              Ready to start journaling?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-blue-800">
              Your journal is a safe space to express yourself, track your progress, and reflect on your experiences.
              There's no right or wrong way to journal - just be authentic and let your thoughts flow.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/journal')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <BookOpen className="h-5 w-5" />
                <span>Write Your First Entry</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/settings')}
                className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Settings className="h-5 w-5" />
                <span>Set Up Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default WelcomeSection;
