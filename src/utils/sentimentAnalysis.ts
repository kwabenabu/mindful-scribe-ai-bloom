
// Simple sentiment analysis utility
// In a production app, you might want to use a more sophisticated API like OpenAI or Google Cloud

interface SentimentResult {
  score: number; // 0-1 where 0 is negative, 0.5 is neutral, 1 is positive
  keywords: string[];
}

// Simple keyword-based sentiment analysis
const POSITIVE_WORDS = [
  'happy', 'joy', 'excited', 'love', 'amazing', 'wonderful', 'great', 'excellent',
  'fantastic', 'beautiful', 'perfect', 'brilliant', 'awesome', 'incredible',
  'delighted', 'thrilled', 'grateful', 'blessed', 'successful', 'accomplished',
  'proud', 'confident', 'optimistic', 'peaceful', 'relaxed', 'satisfied',
  'content', 'cheerful', 'enthusiastic', 'motivated', 'inspired', 'energetic'
];

const NEGATIVE_WORDS = [
  'sad', 'angry', 'frustrated', 'disappointed', 'worried', 'anxious', 'stressed',
  'depressed', 'upset', 'hurt', 'pain', 'difficult', 'terrible', 'awful',
  'horrible', 'hate', 'disgusted', 'annoyed', 'irritated', 'exhausted',
  'overwhelmed', 'confused', 'lost', 'hopeless', 'lonely', 'scared',
  'afraid', 'nervous', 'embarrassed', 'ashamed', 'guilty', 'regret'
];

export function analyzeSentiment(text: string): SentimentResult {
  const words = text.toLowerCase().split(/\s+/);
  const foundKeywords: string[] = [];
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    // Remove punctuation
    const cleanWord = word.replace(/[^\w]/g, '');
    
    if (POSITIVE_WORDS.includes(cleanWord)) {
      positiveCount++;
      if (!foundKeywords.includes(cleanWord)) {
        foundKeywords.push(cleanWord);
      }
    } else if (NEGATIVE_WORDS.includes(cleanWord)) {
      negativeCount++;
      if (!foundKeywords.includes(cleanWord)) {
        foundKeywords.push(cleanWord);
      }
    }
  });

  // Calculate sentiment score
  const totalSentimentWords = positiveCount + negativeCount;
  let score = 0.5; // Default neutral

  if (totalSentimentWords > 0) {
    // Score ranges from 0 to 1
    score = positiveCount / totalSentimentWords;
  }

  // Adjust score based on text length and sentiment word density
  const textLength = words.length;
  const sentimentDensity = totalSentimentWords / textLength;
  
  // If there are very few sentiment words relative to text length, lean towards neutral
  if (sentimentDensity < 0.05) {
    score = 0.4 + (score * 0.2); // Pull towards neutral
  }

  return {
    score: Math.max(0, Math.min(1, score)), // Ensure score is between 0 and 1
    keywords: foundKeywords.slice(0, 10) // Limit to first 10 keywords
  };
}

export function getSentimentLabel(score: number): string {
  if (score >= 0.6) return 'Positive';
  if (score >= 0.4) return 'Neutral';
  return 'Negative';
}

export function getSentimentColor(score: number): string {
  if (score >= 0.6) return 'green';
  if (score >= 0.4) return 'yellow';
  return 'red';
}
