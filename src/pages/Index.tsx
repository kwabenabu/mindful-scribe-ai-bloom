
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import OnboardingMessage from '@/components/OnboardingMessage';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStats } from '@/hooks/useUserStats';
import { useAchievements } from '@/hooks/useAchievements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  PlusCircle, 
  Calendar, 
  TrendingUp, 
  Target, 
  Settings, 
  HelpCircle,
  Trophy,
  Star,
  Zap,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const { profile, isLoading } = useUserProfile();
  const navigate = useNavigate();
  const userStats = useUserStats();
  const { achievements } = useAchievements(userStats);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there';
  const isFirstTime = profile?.is_first_time !== false;

  // Calculate progress metrics
  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const nextLevelXP = (userStats.level + 1) * 100;
  const currentLevelXP = userStats.level * 100;
  const progressToNextLevel = ((userStats.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

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
        <div className="px-4 py-6 sm:px-0 space-y-8">
          {/* Onboarding Message for first-time users */}
          <OnboardingMessage />

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

          {/* Progress Overview - Only for returning users */}
          {!isFirstTime && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Level Progress */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-blue-600" />
                    <span className="text-lg font-bold text-blue-900">
                      Level {userStats.level}
                    </span>
                  </div>
                  <Progress value={progressToNextLevel} className="h-2 mb-2" />
                  <p className="text-xs text-blue-700">
                    {userStats.totalXP - currentLevelXP} / {nextLevelXP - currentLevelXP} XP
                  </p>
                </CardContent>
              </Card>

              {/* Journal Entries */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-bold text-green-900">
                      {userStats.totalJournalEntries}
                    </span>
                  </div>
                  <p className="text-xs text-green-700">Journal Entries</p>
                  <p className="text-xs text-green-600 mt-1">
                    {userStats.currentStreak} day streak
                  </p>
                </CardContent>
              </Card>

              {/* Goals Progress */}
              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span className="text-lg font-bold text-purple-900">
                      {userStats.goalsCompleted}
                    </span>
                  </div>
                  <p className="text-xs text-purple-700">Goals Completed</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {Math.round(userStats.goalsCompletionRate)}% success rate
                  </p>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <span className="text-lg font-bold text-yellow-900">
                      {unlockedAchievements.length}
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700">Achievements</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {userStats.totalXP} total XP
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

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

          {/* Quick Actions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/journal')}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg group-hover:text-blue-600 transition-colors">
                    <PlusCircle className="h-5 w-5 text-blue-500" />
                    <span>New Entry</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Start writing your thoughts and experiences</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/insights')}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg group-hover:text-purple-600 transition-colors">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    <span>View Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Track your progress and analyze trends</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/calendar')}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg group-hover:text-green-600 transition-colors">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <span>Calendar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">View your entries in calendar format</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/faq')}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg group-hover:text-orange-600 transition-colors">
                    <HelpCircle className="h-5 w-5 text-orange-500" />
                    <span>FAQ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Get answers to common questions</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Weekly Goals & Recent Activity - Only for returning users */}
          {!isFirstTime && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weekly Goals Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    This Week's Focus
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Weekly Consistency</span>
                    <span className="text-sm font-medium">{Math.round(userStats.weeklyConsistency)}%</span>
                  </div>
                  <Progress value={userStats.weeklyConsistency} className="h-2" />
                  
                  <div className="pt-2 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Active Goals</span>
                      <span className="font-medium">{userStats.totalGoals - userStats.goalsCompleted}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Completed This Week</span>
                      <span className="font-medium text-green-600">{userStats.goalsCompleted}</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full mt-4" 
                    onClick={() => navigate('/insights')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {unlockedAchievements.length > 0 ? (
                    <div className="space-y-3">
                      {unlockedAchievements.slice(0, 3).map((achievement) => (
                        <div key={achievement.id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                          <div className="text-lg">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                            <p className="text-xs text-gray-600">{achievement.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            +{achievement.xpReward} XP
                          </Badge>
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-4" 
                        onClick={() => navigate('/insights')}
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        View All Achievements
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-2">No achievements yet</p>
                      <p className="text-xs text-gray-400">Keep journaling to unlock your first achievement!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Returning User Action Section */}
          {!isFirstTime && (
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
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
