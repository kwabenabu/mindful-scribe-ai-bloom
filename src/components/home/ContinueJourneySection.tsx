
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContinueJourneySection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center">
      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 text-blue-500" />
            Continue your journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Keep building your journaling habit and tracking your personal growth.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/journal')}
              className="flex items-center space-x-2"
            >
              <BookOpen className="h-5 w-5" />
              <span>Continue Writing</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/insights')}
              className="flex items-center space-x-2"
            >
              <TrendingUp className="h-5 w-5" />
              <span>View Progress</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContinueJourneySection;
