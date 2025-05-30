interface DetectedEvent {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  datetime?: string;
  location?: string;
  duration?: number;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

interface EventDetectionResult {
  events: DetectedEvent[];
  hasHighConfidenceEvents: boolean;
}

const parseTimeToStandardFormat = (timeStr: string): string => {
  // Remove extra spaces and convert to lowercase
  const cleanTime = timeStr.trim().toLowerCase();
  
  // Match time patterns like "1pm", "3:30pm", "9:00 AM", etc.
  const timeMatch = cleanTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  
  if (!timeMatch) {
    return timeStr; // Return original if can't parse
  }
  
  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2] || '0');
  const period = timeMatch[3];
  
  // Convert to 24-hour format
  if (period === 'pm' && hours !== 12) {
    hours += 12;
  } else if (period === 'am' && hours === 12) {
    hours = 0;
  }
  
  // Format as HH:MM:SS
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

export const detectEventsFromText = (text: string): EventDetectionResult => {
  const events: DetectedEvent[] = [];
  const content = text.toLowerCase();
  
  // Time patterns
  const timePatterns = [
    /(?:at|@)\s*(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/gi,
    /(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm)))/gi,
    /(?:around|about)\s*(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/gi
  ];

  // Date patterns
  const datePatterns = [
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
    /(tomorrow|today|tonight)/gi,
    /(next week|this week)/gi,
    /(\d{1,2}(?:st|nd|rd|th)?(?:\s+(?:january|february|march|april|may|june|july|august|september|october|november|december))?)/gi
  ];

  // Event keywords with confidence scores
  const eventKeywords = [
    { words: ['meeting', 'conference', 'call'], confidence: 0.9 },
    { words: ['appointment', 'interview', 'session'], confidence: 0.85 },
    { words: ['dinner', 'lunch', 'breakfast'], confidence: 0.8 },
    { words: ['party', 'celebration', 'event'], confidence: 0.75 },
    { words: ['presentation', 'demo', 'pitch'], confidence: 0.8 },
    { words: ['workout', 'gym', 'exercise'], confidence: 0.7 },
    { words: ['doctor', 'dentist', 'checkup'], confidence: 0.85 },
    { words: ['class', 'training', 'workshop'], confidence: 0.8 }
  ];

  // Location patterns
  const locationPatterns = [
    /(?:at|in|@)\s+([A-Z][a-zA-Z\s]+(?:Restaurant|Cafe|Office|Building|Center|Park|Hospital|Clinic))/gi,
    /(?:at|in|@)\s+([A-Z][a-zA-Z\s]{2,20})/gi
  ];

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  sentences.forEach((sentence, sentenceIndex) => {
    const lowerSentence = sentence.toLowerCase().trim();
    
    // Check for event keywords
    for (const keywordGroup of eventKeywords) {
      for (const keyword of keywordGroup.words) {
        if (lowerSentence.includes(keyword)) {
          // Extract time information
          let timeMatch = null;
          let timeStr = '';
          for (const pattern of timePatterns) {
            const match = pattern.exec(sentence);
            if (match) {
              timeMatch = match;
              timeStr = parseTimeToStandardFormat(match[1]); // Parse to standard format
              break;
            }
          }

          // Extract date information
          let dateMatch = null;
          let dateStr = '';
          for (const pattern of datePatterns) {
            const match = pattern.exec(sentence);
            if (match) {
              dateMatch = match;
              dateStr = match[1];
              break;
            }
          }

          // Extract location
          let locationMatch = null;
          let locationStr = '';
          for (const pattern of locationPatterns) {
            const match = pattern.exec(sentence);
            if (match) {
              locationMatch = match;
              locationStr = match[1];
              break;
            }
          }

          // Generate event title
          const eventTitle = generateEventTitle(sentence, keyword);
          
          // Calculate confidence based on available information
          let confidence = keywordGroup.confidence;
          if (timeMatch) confidence += 0.1;
          if (dateMatch) confidence += 0.1;
          if (locationMatch) confidence += 0.05;
          
          // Cap confidence at 1.0
          confidence = Math.min(confidence, 1.0);

          // Only add events with reasonable confidence
          if (confidence >= 0.7) {
            const event: DetectedEvent = {
              id: `event_${sentenceIndex}_${events.length}`,
              title: eventTitle,
              description: sentence.trim(),
              date: dateStr || undefined,
              time: timeStr || undefined,
              location: locationStr || undefined,
              duration: getDefaultDuration(keyword),
              confidence: confidence,
              startIndex: text.indexOf(sentence),
              endIndex: text.indexOf(sentence) + sentence.length
            };

            // Try to parse datetime
            if (dateStr && timeStr) {
              event.datetime = parseDateTime(dateStr, timeStr);
            }

            events.push(event);
          }
        }
      }
    }
  });

  // Remove duplicate events (similar titles and times)
  const uniqueEvents = removeDuplicateEvents(events);

  return {
    events: uniqueEvents,
    hasHighConfidenceEvents: uniqueEvents.some(e => e.confidence >= 0.85)
  };
};

const generateEventTitle = (sentence: string, keyword: string): string => {
  // Try to extract a meaningful title from the sentence
  const words = sentence.split(' ');
  const keywordIndex = words.findIndex(w => w.toLowerCase().includes(keyword.toLowerCase()));
  
  if (keywordIndex !== -1) {
    // Take a few words around the keyword
    const start = Math.max(0, keywordIndex - 2);
    const end = Math.min(words.length, keywordIndex + 3);
    const titleWords = words.slice(start, end);
    
    // Capitalize first letter
    const title = titleWords.join(' ');
    return title.charAt(0).toUpperCase() + title.slice(1);
  }
  
  // Fallback to keyword-based title
  return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Event`;
};

const getDefaultDuration = (eventType: string): number => {
  const durations: { [key: string]: number } = {
    'meeting': 60,
    'conference': 120,
    'call': 30,
    'appointment': 60,
    'interview': 60,
    'session': 90,
    'dinner': 120,
    'lunch': 60,
    'breakfast': 45,
    'party': 180,
    'presentation': 45,
    'workout': 60,
    'class': 90
  };
  
  return durations[eventType.toLowerCase()] || 30;
};

const parseDateTime = (dateStr: string, timeStr: string): string => {
  const now = new Date();
  let targetDate = new Date(now);
  
  // Parse date
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = dayNames.findIndex(day => dateStr.toLowerCase().includes(day));
  
  if (dayIndex !== -1) {
    // Set to next occurrence of this day
    const currentDay = now.getDay();
    const daysAhead = (dayIndex - currentDay + 7) % 7 || 7;
    targetDate.setDate(now.getDate() + daysAhead);
  } else if (dateStr.toLowerCase().includes('tomorrow')) {
    targetDate.setDate(now.getDate() + 1);
  } else if (dateStr.toLowerCase().includes('today') || dateStr.toLowerCase().includes('tonight')) {
    // Keep today's date
  }
  
  // Parse time using the standard format time
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    
    targetDate.setHours(hours, minutes, 0, 0);
  }
  
  return targetDate.toISOString();
};

const removeDuplicateEvents = (events: DetectedEvent[]): DetectedEvent[] => {
  const seen = new Set<string>();
  return events.filter(event => {
    const key = `${event.title.toLowerCase()}_${event.date}_${event.time}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export type { DetectedEvent, EventDetectionResult };
