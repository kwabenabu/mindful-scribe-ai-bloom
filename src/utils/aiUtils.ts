
interface TitleAndTags {
  title: string;
  tags: string[];
}

export const generateTitleAndTags = async (content: string): Promise<TitleAndTags> => {
  // Simulate AI processing - in a real app, you'd call an AI service
  // For now, I'll create a simple algorithm that extracts meaningful information
  
  // Generate title based on content
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const firstSentence = sentences[0]?.trim() || '';
  
  let title = '';
  if (firstSentence.length > 0) {
    // Take the first few words or create a meaningful title
    const words = firstSentence.split(' ').slice(0, 6);
    title = words.join(' ').replace(/[^\w\s]/g, '').trim();
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
  }
  
  // If no meaningful title, use timestamp
  if (!title || title.length < 3) {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    title = `${dayOfWeek}, ${date}`;
  }
  
  // Generate tags based on content analysis
  const tags = extractTags(content);
  
  return { title, tags };
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
