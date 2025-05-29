export interface DetectedGoal {
  id: string;
  text: string;
  type: 'goal' | 'task';
  category: string;
  confidence: number;
  timeframe?: string;
  startIndex: number;
  endIndex: number;
}

export interface GoalDetectionResult {
  goals: DetectedGoal[];
  tasks: DetectedGoal[];
}

// Enhanced goal patterns with better comma/period handling
const GOAL_PATTERNS = [
  // Direct goal statements with improved splitting
  /(?:i want to|i'd like to|i hope to|i aim to|my goal is to|i plan to)\s+([^,.!?]+)(?:[,.!?]|$)/gi,
  // Time-based goals
  /(?:by|within|in)\s+(?:the\s+)?(?:next\s+)?(\w+\s+(?:year|month|week)s?|january|february|march|april|may|june|july|august|september|october|november|december|\d+\s+(?:years?|months?|weeks?))\s+i\s+(?:want to|will|hope to|plan to)\s+([^,.!?]+)(?:[,.!?]|$)/gi,
  // Frequency-based goals
  /i\s+(?:want to|should|need to|will)\s+([^,.!?]+?)\s+(?:every|each)\s+(day|week|month|year)/gi,
  // Achievement goals
  /i\s+(?:want to|will|hope to|plan to)\s+(learn|master|become|achieve|complete|finish|read|write|build|create)\s+([^,.!?]+)(?:[,.!?]|$)/gi,
  // Habit formation
  /i\s+(?:want to|should|need to|will)\s+(start|begin|develop|build)\s+([^,.!?]+?)\s+(?:habit|routine)/gi,
];

// Enhanced task patterns with better splitting
const TASK_PATTERNS = [
  // Today/tomorrow tasks with splitting
  /(?:today|tomorrow|this\s+(?:morning|afternoon|evening))\s+i\s+(?:need to|should|will|must)\s+([^,.!?]+)(?:[,.!?]|$)/gi,
  // Immediate actions
  /i\s+(?:need to|should|must|have to)\s+([^,.!?]+?)\s+(?:now|soon|asap|immediately|today)(?:[,.!?]|$)/gi,
  // Simple action items
  /(?:remember to|don't forget to)\s+([^,.!?]+)(?:[,.!?]|$)/gi,
  // Quick tasks
  /(?:quickly|just)\s+(?:need to|should)\s+([^,.!?]+)(?:[,.!?]|$)/gi,
];

// Categories for goals and tasks
const GOAL_CATEGORIES = {
  health: ['exercise', 'workout', 'diet', 'fitness', 'health', 'sleep', 'meditation', 'yoga'],
  learning: ['learn', 'study', 'read', 'course', 'skill', 'language', 'book', 'education'],
  career: ['job', 'work', 'career', 'promotion', 'business', 'project', 'professional'],
  personal: ['relationship', 'family', 'friend', 'social', 'hobby', 'travel', 'personal'],
  creative: ['write', 'draw', 'paint', 'music', 'art', 'create', 'design', 'craft'],
  financial: ['money', 'save', 'budget', 'invest', 'financial', 'income', 'debt'],
  home: ['house', 'home', 'clean', 'organize', 'repair', 'decorate', 'garden'],
  other: []
};

function categorizeGoal(text: string): string {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(GOAL_CATEGORIES)) {
    if (category === 'other') continue;
    
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return 'other';
}

function extractTimeframe(text: string): string | undefined {
  const timePatterns = [
    /(?:by|within|in)\s+(?:the\s+)?(?:next\s+)?(\w+\s+(?:year|month|week)s?)/gi,
    /(?:every|each)\s+(day|week|month|year)/gi,
    /(daily|weekly|monthly|yearly)/gi,
    /(january|february|march|april|may|june|july|august|september|october|november|december)/gi,
    /(\d+\s+(?:years?|months?|weeks?|days?))/gi,
  ];
  
  for (const pattern of timePatterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[1];
    }
  }
  
  return undefined;
}

function calculateConfidence(text: string, type: 'goal' | 'task'): number {
  let confidence = 0.5; // Base confidence
  
  const lowerText = text.toLowerCase();
  
  // High confidence indicators for goals
  if (type === 'goal') {
    if (lowerText.includes('want to') || lowerText.includes('goal is')) confidence += 0.3;
    if (lowerText.includes('by') || lowerText.includes('within')) confidence += 0.2;
    if (lowerText.includes('every') || lowerText.includes('daily') || lowerText.includes('weekly')) confidence += 0.2;
    if (lowerText.includes('learn') || lowerText.includes('become') || lowerText.includes('achieve')) confidence += 0.2;
  }
  
  // High confidence indicators for tasks
  if (type === 'task') {
    if (lowerText.includes('need to') || lowerText.includes('must')) confidence += 0.3;
    if (lowerText.includes('today') || lowerText.includes('tomorrow')) confidence += 0.3;
    if (lowerText.includes('remember to') || lowerText.includes("don't forget")) confidence += 0.2;
  }
  
  return Math.min(confidence, 1.0);
}

function splitItemsByPunctuation(text: string): string[] {
  // Split by commas, periods, and other separators while preserving meaningful text
  const items = text.split(/[,.;]\s*(?=\w)/)
    .map(item => item.trim())
    .filter(item => item.length > 3 && item.split(' ').length <= 10); // Filter out very short or very long items
  
  return items.length > 1 ? items : [text];
}

export function detectGoalsAndTasks(text: string): GoalDetectionResult {
  const goals: DetectedGoal[] = [];
  const tasks: DetectedGoal[] = [];
  
  // Detect goals
  GOAL_PATTERNS.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(text)) !== null) {
      const goalText = match[1] || match[2] || match[0];
      if (goalText && goalText.trim().length > 3) {
        // Split by punctuation to create separate goal items
        const splitItems = splitItemsByPunctuation(goalText.trim());
        
        splitItems.forEach((item, index) => {
          const goal: DetectedGoal = {
            id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
            text: item,
            type: 'goal',
            category: categorizeGoal(item),
            confidence: calculateConfidence(match[0], 'goal'),
            timeframe: extractTimeframe(match[0]),
            startIndex: match.index || 0,
            endIndex: (match.index || 0) + match[0].length,
          };
          goals.push(goal);
        });
      }
    }
  });
  
  // Detect tasks
  TASK_PATTERNS.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(text)) !== null) {
      const taskText = match[1] || match[0];
      if (taskText && taskText.trim().length > 3) {
        // Split by punctuation to create separate task items
        const splitItems = splitItemsByPunctuation(taskText.trim());
        
        splitItems.forEach((item, index) => {
          const task: DetectedGoal = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
            text: item,
            type: 'task',
            category: categorizeGoal(item),
            confidence: calculateConfidence(match[0], 'task'),
            startIndex: match.index || 0,
            endIndex: (match.index || 0) + match[0].length,
          };
          tasks.push(task);
        });
      }
    }
  });
  
  // Remove duplicates and overlapping matches
  const allDetections = [...goals, ...tasks];
  const filtered = allDetections.filter((item, index) => {
    return !allDetections.some((other, otherIndex) => {
      if (index >= otherIndex) return false;
      
      // Check for overlap or very similar text
      const overlap = (item.startIndex < other.endIndex && item.endIndex > other.startIndex);
      const similarText = item.text.toLowerCase() === other.text.toLowerCase();
      
      if (overlap || similarText) {
        // Keep the one with higher confidence
        return other.confidence > item.confidence;
      }
      
      return false;
    });
  });
  
  return {
    goals: filtered.filter(item => item.type === 'goal'),
    tasks: filtered.filter(item => item.type === 'task'),
  };
}
