
import { useState, useEffect } from 'react';
import { Achievement, UserStats } from '@/types/achievements';

export const useAchievements = (userStats: UserStats) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  const achievementDefinitions: Omit<Achievement, 'currentValue' | 'isUnlocked' | 'unlockedAt'>[] = [
    {
      id: 'first_entry',
      title: 'First Steps',
      description: 'Write your first journal entry',
      icon: '✍️',
      category: 'journal',
      threshold: 1,
      xpReward: 10
    },
    {
      id: 'journal_5',
      title: 'Getting Started',
      description: 'Write 5 journal entries',
      icon: '📝',
      category: 'journal',
      threshold: 5,
      xpReward: 25
    },
    {
      id: 'journal_10',
      title: 'Dedicated Writer',
      description: 'Write 10 journal entries',
      icon: '📚',
      category: 'journal',
      threshold: 10,
      xpReward: 50
    },
    {
      id: 'journal_25',
      title: 'Prolific Author',
      description: 'Write 25 journal entries',
      icon: '🏆',
      category: 'journal',
      threshold: 25,
      xpReward: 100
    },
    {
      id: 'first_goal',
      title: 'Goal Getter',
      description: 'Complete your first goal',
      icon: '🎯',
      category: 'goals',
      threshold: 1,
      xpReward: 15
    },
    {
      id: 'goals_5',
      title: 'Achiever',
      description: 'Complete 5 goals',
      icon: '⭐',
      category: 'goals',
      threshold: 5,
      xpReward: 75
    },
    {
      id: 'streak_3',
      title: 'Getting Consistent',
      description: 'Maintain a 3-day streak',
      icon: '🔥',
      category: 'streak',
      threshold: 3,
      xpReward: 20
    },
    {
      id: 'streak_7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '💪',
      category: 'streak',
      threshold: 7,
      xpReward: 50
    },
    {
      id: 'streak_30',
      title: 'Habit Master',
      description: 'Maintain a 30-day streak',
      icon: '👑',
      category: 'streak',
      threshold: 30,
      xpReward: 200
    }
  ];

  useEffect(() => {
    // Only process achievements if userStats has meaningful data
    if (!userStats || typeof userStats.totalJournalEntries === 'undefined') {
      return;
    }

    const updatedAchievements = achievementDefinitions.map(def => {
      let currentValue = 0;
      
      switch (def.category) {
        case 'journal':
          currentValue = userStats.totalJournalEntries || 0;
          break;
        case 'goals':
          currentValue = userStats.goalsCompleted || 0;
          break;
        case 'streak':
          currentValue = userStats.currentStreak || 0;
          break;
        case 'consistency':
          currentValue = userStats.weeklyConsistency || 0;
          break;
      }

      const wasUnlocked = achievements.find(a => a.id === def.id)?.isUnlocked || false;
      const isUnlocked = currentValue >= def.threshold;
      
      return {
        ...def,
        currentValue,
        isUnlocked,
        unlockedAt: isUnlocked && !wasUnlocked ? new Date() : undefined
      };
    });

    // Find newly unlocked achievements
    const newlyUnlocked = updatedAchievements.filter(
      achievement => achievement.isUnlocked && 
      !achievements.find(a => a.id === achievement.id)?.isUnlocked
    );

    setAchievements(updatedAchievements);
    
    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);
    }
  }, [userStats, achievements]);

  const dismissNewAchievements = () => {
    setNewAchievements([]);
  };

  return {
    achievements,
    newAchievements,
    dismissNewAchievements
  };
};
