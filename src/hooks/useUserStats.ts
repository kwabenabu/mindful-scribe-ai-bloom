
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
          const dates = recentEntries.map(entry => 
            new Date(entry.created_at).toDateString()
          );
          const uniqueDates = [...new Set(dates)];
          
          // Calculate current streak
          for (let i = 0; i < uniqueDates.length; i++) {
            const entryDate = new Date(uniqueDates[i]);
            const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === i) {
              currentStreak++;
            } else {
              break;
            }
          }

          // Calculate longest streak
          for (let i = 0; i < uniqueDates.length; i++) {
            if (i === 0 || 
                Math.abs(new Date(uniqueDates[i]).getTime() - new Date(uniqueDates[i-1]).getTime()) 
                <= 24 * 60 * 60 * 1000) {
              tempStreak++;
              longestStreak = Math.max(longestStreak, tempStreak);
            } else {
              tempStreak = 1;
            }
          }
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
          weeklyConsistency,
          totalXP,
          level
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  return stats;
};
