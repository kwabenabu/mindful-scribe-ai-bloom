interface TitleAndTags {
  title: string;
  tags: string[];
}

export const generateTitleAndTags = async (content: string): Promise<TitleAndTags> => {
  // Generate AI-powered three-word summary title
  const title = generateAITitle(content);
  
  // Generate tags based on content analysis
  const tags = extractTags(content);
  
  return { title, tags };
};

const generateAITitle = (content: string): string => {
  // Check for sensitive content indicators
  const sensitiveKeywords = [
    'personal', 'private', 'secret', 'confidential', 'intimate', 'family', 'relationship',
    'depression', 'anxiety', 'therapy', 'medication', 'doctor', 'health', 'mental',
    'money', 'salary', 'debt', 'financial', 'bank', 'loan', 'income'
  ];
  
  const lowerContent = content.toLowerCase();
  const isSensitive = sensitiveKeywords.some(keyword => lowerContent.includes(keyword));
  
  if (isSensitive) {
    // Generate vague titles for sensitive content
    const vagueTitles = [
      'Personal Thoughts', 'Daily Reflection', 'Private Notes',
      'Inner Musings', 'Quiet Moments', 'Personal Journey',
      'Self Reflection', 'Mindful Thoughts', 'Inner Voice'
    ];
    return vagueTitles[Math.floor(Math.random() * vagueTitles.length)];
  }
  
  // Generate three-word summary for non-sensitive content
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const firstSentence = sentences[0]?.trim() || '';
  
  if (firstSentence.length > 0) {
    const words = firstSentence.split(' ')
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'but', 'for', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should'].includes(word.toLowerCase()))
      .slice(0, 3);
    
    if (words.length >= 2) {
      // Capitalize first letter of each word
      const capitalizedWords = words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      );
      return capitalizedWords.join(' ');
    }
  }
  
  // Fallback to activity-based titles
  const activityKeywords = {
    'Work Progress': ['work', 'job', 'office', 'meeting', 'project', 'boss', 'colleague'],
    'Family Time': ['family', 'mom', 'dad', 'sister', 'brother', 'parent', 'child'],
    'Social Moments': ['friend', 'friends', 'party', 'social', 'hang out'],
    'Travel Adventures': ['travel', 'trip', 'vacation', 'airport', 'hotel', 'explore'],
    'Fitness Journey': ['workout', 'gym', 'run', 'exercise', 'fitness', 'sport'],
    'Food Experiences': ['eat', 'food', 'restaurant', 'cook', 'meal', 'dinner'],
    'Learning Path': ['learn', 'study', 'read', 'book', 'course', 'education'],
    'Creative Flow': ['write', 'draw', 'paint', 'music', 'art', 'create']
  };
  
  for (const [title, keywords] of Object.entries(activityKeywords)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return title;
    }
  }
  
  // Final fallback to "AI Summary"
  return 'AI Summary';
};

const extractTags = (content: string): string[] => {
  const text = content.toLowerCase();
  const tags: string[] = [];
  
  // Emotion-based tags
  const emotions = {
    'happy': ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'love'],
    'sad': ['sad', 'down', 'depressed', 'upset', 'disappointed', 'hurt', 'crying'],
    'anxious': ['anxious', 'worried', 'nervous', 'stress', 'fear', 'panic'],
    'grateful': ['grateful', 'thankful', 'appreciate', 'blessed', 'lucky'],
    'angry': ['angry', 'mad', 'frustrated', 'annoyed', 'furious'],
    'peaceful': ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil']
  };
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(emotion);
    }
  }
  
  // Activity-based tags
  const activities = {
    'work': ['work', 'job', 'office', 'meeting', 'project', 'boss', 'colleague'],
    'family': ['family', 'mom', 'dad', 'sister', 'brother', 'parent', 'child'],
    'friends': ['friend', 'friends', 'hang out', 'party', 'social'],
    'travel': ['travel', 'trip', 'vacation', 'airport', 'hotel', 'explore'],
    'exercise': ['workout', 'gym', 'run', 'exercise', 'fitness', 'sport'],
    'food': ['eat', 'food', 'restaurant', 'cook', 'meal', 'dinner', 'lunch'],
    'learning': ['learn', 'study', 'read', 'book', 'course', 'education'],
    'health': ['doctor', 'medicine', 'sick', 'healthy', 'wellness']
  };
  
  for (const [activity, keywords] of Object.entries(activities)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(activity);
    }
  }
  
  // Time-based tags
  const now = new Date();
  const hour = now.getHours();
  if (hour < 12) tags.push('morning');
  else if (hour < 17) tags.push('afternoon');
  else tags.push('evening');
  
  // Remove duplicates and limit to 5 tags
  return [...new Set(tags)].slice(0, 5);
};
