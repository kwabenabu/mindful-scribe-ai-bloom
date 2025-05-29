
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'journal' | 'goals' | 'streak' | 'consistency';
  threshold: number;
  currentValue: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
}

export interface UserStats {
  totalJournalEntries: number;
  goalsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  weeklyConsistency: number;
  totalXP: number;
  level: number;
  totalGoals?: number;
  goalsCompletionRate?: number;
}

export interface NotificationData {
  achievement: Achievement;
  isNew: boolean;
}
