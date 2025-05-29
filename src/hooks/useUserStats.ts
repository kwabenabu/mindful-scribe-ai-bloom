
import { useState, useEffect } from 'react';
import { UserStats } from '@/types/achievements';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUserStats = (): UserStats => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalJournalEntries: 0,
    goalsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyConsistency: 0,
    totalXP: 0,
    level: 1
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Fetch journal entries count
        const { count: journalCount } = await supabase
          .from('journals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch completed goals count
        const { count: goalsCount } = await supabase
          .from('goals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed');

        // Fetch total goals count for completion rate
        const { count: totalGoalsCount } = await supabase
          .from('goals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch recent journal entries for streak calculation
        const { data: recentEntries } = await supabase
          .from('journals')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30);

        // Calculate streak
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        if (recentEntries && recentEntries.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const dates = recentEntries.map(entry => {
            const date = new Date(entry.created_at);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
          });
          
          const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
          
          // Calculate current streak
          for (let i = 0; i < uniqueDates.length; i++) {
            const daysDiff = Math.floor((today.getTime() - uniqueDates[i]) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === i) {
              currentStreak++;
            } else {
              break;
            }
          }

          // Calculate longest streak
          tempStreak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            const daysDiff = Math.floor((uniqueDates[i-1] - uniqueDates[i]) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
              tempStreak++;
              longestStreak = Math.max(longestStreak, tempStreak);
            } else {
              tempStreak = 1;
            }
          }
          longestStreak = Math.max(longestStreak, tempStreak);
        }

        // Calculate weekly consistency (entries in last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { count: weeklyEntries } = await supabase
          .from('journals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', weekAgo.toISOString());

        const weeklyConsistency = Math.min(100, ((weeklyEntries || 0) / 7) * 100);

        // Calculate XP and level based on activities
        const totalXP = (journalCount || 0) * 5 + (goalsCount || 0) * 15 + currentStreak * 2;
        const level = Math.floor(totalXP / 100) + 1;

        setStats({
          totalJournalEntries: journalCount || 0,
          goalsCompleted: goalsCount || 0,
          currentStreak,
          longestStreak,
          weeklyConsistency: Math.round(weeklyConsistency),
          totalXP,
          level,
          totalGoals: totalGoalsCount || 0,
          goalsCompletionRate: totalGoalsCount ? Math.round(((goalsCount || 0) / totalGoalsCount) * 100) : 0
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  return stats;
};
