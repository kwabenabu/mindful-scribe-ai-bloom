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

const parseToProperDate = (dateStr: string): string => {
  const now = new Date();
  let targetDate = new Date(now);
  
  const lowerDateStr = dateStr.toLowerCase().trim();
  
  // Handle various date formats
  if (lowerDateStr === 'today') {
    // Keep today's date
    return targetDate.toISOString().split('T')[0];
  } else if (lowerDateStr === 'tomorrow') {
    targetDate.setDate(now.getDate() + 1);
    return targetDate.toISOString().split('T')[0];
  } else if (lowerDateStr === 'yesterday') {
    targetDate.setDate(now.getDate() - 1);
    return targetDate.toISOString().split('T')[0];
  } else if (lowerDateStr === 'tonight') {
    // Tonight is still today
    return targetDate.toISOString().split('T')[0];
  } else if (lowerDateStr.includes('next week')) {
    targetDate.setDate(now.getDate() + 7);
    return targetDate.toISOString().split('T')[0];
  } else if (lowerDateStr.includes('this week')) {
    return targetDate.toISOString().split('T')[0];
  }
  
  // Handle day names
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = dayNames.findIndex(day => lowerDateStr.includes(day));
  
  if (dayIndex !== -1) {
    // Set to next occurrence of this day
    const currentDay = now.getDay();
    const daysAhead = (dayIndex - currentDay + 7) % 7 || 7;
    targetDate.setDate(now.getDate() + daysAhead);
    return targetDate.toISOString().split('T')[0];
  }
  
  // If it's just a number like "1", assume it means today (common parsing error)
  if (/^\d+$/.test(lowerDateStr)) {
    return targetDate.toISOString().split('T')[0];
  }
  
  // Try to parse as a regular date
  const parsedDate = new Date(dateStr);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split('T')[0];
  }
  
  // Default to today if we can't parse it
  return targetDate.toISOString().split('T')[0];
};

export const detectEventsFromText = (text: string): EventDetectionResult => {
  const events: DetectedEvent[] = [];
  const content = text.toLowerCase();
  
  // Improved time patterns
  const timePatterns = [
    /(?:at|@)\s*(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/gi,
    /(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm)))/gi,
    /(?:around|about)\s*(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/gi
  ];

  // Enhanced date patterns
  const datePatterns = [
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
    /(tomorrow|today|tonight|yesterday)/gi,
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
    { words: ['class', 'training', 'workshop'], confidence: 0.8 },
    { words: ['sync', 'standup', 'review'], confidence: 0.85 },
    { words: ['planning', 'sprint'], confidence: 0.8 }
  ];

  // Enhanced location patterns
  const locationPatterns = [
    /(?:at|in|@)\s+([A-Z][a-zA-Z\s]+(?:Restaurant|Cafe|Office|Building|Center|Park|Hospital|Clinic))/gi,
    /(?:at|in|@)\s+the\s+([a-zA-Z\s]{2,30})/gi,
    /(?:at|in|@)\s+([A-Z][a-zA-Z\s]{2,20})/gi
  ];

  // Split text into more manageable segments for better event detection
  const segments = text.split(/[.!?;]+/).filter(s => s.trim().length > 0);

  segments.forEach((segment, segmentIndex) => {
    const lowerSegment = segment.toLowerCase().trim();
    
    // Check for event keywords
    for (const keywordGroup of eventKeywords) {
      for (const keyword of keywordGroup.words) {
        if (lowerSegment.includes(keyword)) {
          // Extract time information
          let timeMatch = null;
          let timeStr = '';
          for (const pattern of timePatterns) {
            pattern.lastIndex = 0;
            const match = pattern.exec(segment);
            if (match) {
              timeMatch = match;
              timeStr = parseTimeToStandardFormat(match[1]);
              break;
            }
          }

          // Extract date information
          let dateMatch = null;
          let dateStr = '';
          for (const pattern of datePatterns) {
            pattern.lastIndex = 0;
            const match = pattern.exec(segment);
            if (match) {
              dateMatch = match;
              dateStr = match[1];
              break;
            }
          }

          // Extract location - fixed to return proper strings
          let locationMatch = null;
          let locationStr = '';
          for (const pattern of locationPatterns) {
            pattern.lastIndex = 0;
            const match = pattern.exec(segment);
            if (match) {
              locationMatch = match;
              locationStr = match[1] ? match[1].trim() : '';
              break;
            }
          }

          // Generate improved event title
          const eventTitle = generateImprovedEventTitle(segment, keyword, timeMatch, dateMatch);
          
          // Calculate confidence based on available information
          let confidence = keywordGroup.confidence;
          if (timeMatch) confidence += 0.1;
          if (dateMatch) confidence += 0.1;
          if (locationMatch) confidence += 0.05;
          
          // Cap confidence at 1.0
          confidence = Math.min(confidence, 1.0);

          // Only add events with reasonable confidence
          if (confidence >= 0.7) {
            // Convert date to proper format if found
            const properDate = dateStr ? parseToProperDate(dateStr) : undefined;
            
            const event: DetectedEvent = {
              id: `event_${segmentIndex}_${events.length}`,
              title: eventTitle,
              description: segment.trim(),
              date: properDate,
              time: timeStr || undefined,
              location: locationStr || undefined,
              duration: getDefaultDuration(keyword),
              confidence: confidence,
              startIndex: text.indexOf(segment),
              endIndex: text.indexOf(segment) + segment.length
            };

            // Try to parse datetime if we have both date and time
            if (properDate && timeStr) {
              event.datetime = parseDateTime(properDate, timeStr);
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

const generateImprovedEventTitle = (segment: string, keyword: string, timeMatch: any, dateMatch: any): string => {
  // Try to extract context around the keyword for a better title
  const words = segment.split(' ');
  const keywordIndex = words.findIndex(w => w.toLowerCase().includes(keyword.toLowerCase()));
  
  if (keywordIndex !== -1) {
    // Look for meaningful context before and after the keyword
    const contextBefore = words.slice(Math.max(0, keywordIndex - 3), keywordIndex);
    const contextAfter = words.slice(keywordIndex + 1, Math.min(words.length, keywordIndex + 4));
    
    // Filter out time and date words from the context
    const timeWords = ['at', 'on', 'am', 'pm', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const cleanContextBefore = contextBefore.filter(w => !timeWords.some(tw => w.toLowerCase().includes(tw)));
    const cleanContextAfter = contextAfter.filter(w => !timeWords.some(tw => w.toLowerCase().includes(tw)));
    
    // Build a meaningful title
    const titleParts = [];
    if (cleanContextBefore.length > 0) {
      titleParts.push(...cleanContextBefore);
    }
    titleParts.push(keyword);
    if (cleanContextAfter.length > 0) {
      titleParts.push(...cleanContextAfter.slice(0, 2)); // Limit to 2 words after
    }
    
    const title = titleParts.join(' ');
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
    'class': 90,
    'sync': 30,
    'standup': 15,
    'review': 60,
    'planning': 90
  };
  
  return durations[eventType.toLowerCase()] || 30;
};

const parseDateTime = (dateStr: string, timeStr: string): string => {
  // Combine the date string (YYYY-MM-DD) with the time string (HH:MM:SS)
  const dateTimeStr = `${dateStr}T${timeStr}`;
  const targetDate = new Date(dateTimeStr);
  
  if (!isNaN(targetDate.getTime())) {
    return targetDate.toISOString();
  }
  
  // Fallback if parsing fails
  return new Date().toISOString();
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
