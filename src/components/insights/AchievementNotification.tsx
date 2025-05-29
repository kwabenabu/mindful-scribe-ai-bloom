
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Achievement } from '@/types/achievements';
import { X, Trophy } from 'lucide-react';

interface AchievementNotificationProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

const AchievementNotification = ({ achievements, onDismiss }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (achievements.length > 0) {
      setIsVisible(true);
      setCurrentIndex(0);
    }
  }, [achievements]);

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
      setCurrentIndex(0);
    }, 300);
  };

  if (!isVisible || achievements.length === 0) return null;

  const currentAchievement = achievements[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 border-none max-w-md w-full animate-in zoom-in-50 duration-500">
        <CardContent className="p-6 text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 right-2 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="mb-4">
            <Trophy className="h-12 w-12 mx-auto text-white mb-2" />
            <h2 className="text-2xl font-bold text-white">Achievement Unlocked!</h2>
          </div>
          
          <div className="bg-white/20 rounded-lg p-4 mb-4">
            <div className="text-4xl mb-2">{currentAchievement.icon}</div>
            <h3 className="text-xl font-bold text-white mb-1">
              {currentAchievement.title}
            </h3>
            <p className="text-white/90 text-sm mb-2">
              {currentAchievement.description}
            </p>
            <div className="text-yellow-200 font-semibold">
              +{currentAchievement.xpReward} XP
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            {achievements.length > 1 && (
              <div className="text-white/80 text-sm mb-4">
                {currentIndex + 1} of {achievements.length}
              </div>
            )}
          </div>
          
          <Button
            onClick={handleNext}
            className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-6"
          >
            {currentIndex < achievements.length - 1 ? 'Next' : 'Awesome!'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementNotification;
