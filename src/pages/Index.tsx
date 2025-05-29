
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, PlusCircle, Calendar, TrendingUp, Target, Settings, HelpCircle } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const { profile, isLoading } = useUserProfile();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there';
  const isFirstTime = profile?.is_first_time !== false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="text-center mb-8">
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
            <div className="mb-8">
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
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/journal')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <PlusCircle className="h-5 w-5 text-blue-500" />
                  <span>New Entry</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Start writing your thoughts and experiences</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/insights')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <span>Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Track your progress and analyze trends</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/calendar')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <span>Calendar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">View your entries in calendar format</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/faq')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-orange-500" />
                  <span>FAQ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Get answers to common questions</p>
              </CardContent>
            </Card>
          </div>

          {/* Returning User Section */}
          {!isFirstTime && (
            <div className="text-center">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">Continue your journey</CardTitle>
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
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
