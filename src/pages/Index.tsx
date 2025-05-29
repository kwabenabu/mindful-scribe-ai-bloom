
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, PlusCircle, Calendar, TrendingUp } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to your Journal App!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Hello, {user?.email}
            </p>
            <p className="text-gray-500">
              Capture your thoughts, track your growth, and reflect on your journey.
            </p>
          </div>

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

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/journal')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <span>View Entries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Read and manage your journal entries</p>
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span>Calendar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Coming soon - track your writing habits</p>
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <span>Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Coming soon - analyze your writing patterns</p>
              </CardContent>
            </Card>
          </div>

          {/* Get Started Section */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to start journaling?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Your journal is a safe space to express yourself, track your progress, and reflect on your experiences.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/journal')}
                  className="flex items-center space-x-2"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Go to Journal</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
