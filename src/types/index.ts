export interface Baby {
  id: string;
  name: string;
  birthday: string;
  gender: 'male' | 'female';
}

export interface GrowthRecord {
  id: string;
  date: string;
  height?: number;
  weight?: number;
  headCircumference?: number;
  note?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedDate?: string;
  category: 'motor' | 'language' | 'social' | 'cognitive';
  ageMonths: number;
}

export interface FeedingRecord {
  id: string;
  type: 'breast' | 'bottle' | 'solid';
  startTime: string;
  duration?: number;
  amount?: number;
  food?: string;
  note?: string;
}

export interface SleepRecord {
  id: string;
  startTime: string;
  endTime?: string;
  quality?: 'good' | 'normal' | 'poor';
  note?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface FoodRecipe {
  id: string;
  name: string;
  ageRange: string;
  ingredients: string[];
  steps: string[];
  nutrition: string;
  tags: string[];
}
