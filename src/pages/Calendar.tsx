
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, List } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import type { Json } from '@/integrations/supabase/types';

interface JournalEntry {
  id: number;
  content: string;
  created_at: string;
  sentiment_score?: number;
  extracted_goals?: Json;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEntries = async () => {
    if (!user) return;

    try {
      const startDate = viewMode === 'week' 
        ? startOfWeek(currentDate, { weekStartsOn: 0 })
        : startOfMonth(currentDate);
      const endDate = viewMode === 'week'
        ? endOfWeek(currentDate, { weekStartsOn: 0 })
        : endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('journals')
        .select('id, content, created_at, sentiment_score, extracted_goals')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user, currentDate, viewMode]);

  const navigatePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const getDaysToRender = () => {
    if (viewMode === 'week') {
      return eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end: endOfWeek(currentDate, { weekStartsOn: 0 })
      });
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      
      return eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd
      });
    }
  };

  const getEntryForDay = (day: Date) => {
    return entries.find(entry => 
      isSameDay(new Date(entry.created_at), day)
    );
  };

  const getSentimentColor = (sentimentScore?: number) => {
    if (!sentimentScore) return 'bg-gray-100 border-gray-200';
    
    if (sentimentScore >= 0.6) return 'bg-green-100 border-green-300';
    if (sentimentScore >= 0.3) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getSentimentBadge = (sentimentScore?: number) => {
    if (!sentimentScore) return null;
    
    if (sentimentScore >= 0.6) return <Badge className="bg-green-500">Great Day</Badge>;
    if (sentimentScore >= 0.3) return <Badge className="bg-yellow-500">Good Day</Badge>;
    return <Badge className="bg-red-500">Tough Day</Badge>;
  };

  const days = getDaysToRender();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading your journal calendar...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">Journal Calendar</h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className="flex items-center gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Month
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  Week
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : 'MMM d, yyyy')}
              </h2>
              <Button variant="outline" size="sm" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              {viewMode === 'month' ? (
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {days.map((day, index) => {
                    const entry = getEntryForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <div
                        key={index}
                        className={`
                          min-h-[120px] p-2 border rounded-lg transition-colors cursor-pointer
                          ${getSentimentColor(entry?.sentiment_score)}
                          ${!isCurrentMonth ? 'opacity-40' : ''}
                          ${isToday ? 'ring-2 ring-blue-500' : ''}
                          hover:shadow-md
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm ${isToday ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                            {format(day, 'd')}
                          </span>
                          {getSentimentBadge(entry?.sentiment_score)}
                        </div>
                        
                        {entry && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-600 line-clamp-3">
                              {entry.content.substring(0, 100)}...
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {days.map((day, index) => {
                    const entry = getEntryForDay(day);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <div
                        key={index}
                        className={`
                          p-4 border rounded-lg transition-colors cursor-pointer
                          ${getSentimentColor(entry?.sentiment_score)}
                          ${isToday ? 'ring-2 ring-blue-500' : ''}
                          hover:shadow-md
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                            {format(day, 'EEEE, MMMM d')}
                          </h3>
                          {getSentimentBadge(entry?.sentiment_score)}
                        </div>
                        
                        {entry ? (
                          <p className="text-gray-700 line-clamp-2">
                            {entry.content}
                          </p>
                        ) : (
                          <p className="text-gray-400 italic">No entry for this day</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
