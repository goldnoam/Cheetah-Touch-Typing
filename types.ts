
export type LanguageCode = 'he' | 'en' | 'ru' | 'es' | 'de' | 'fr' | 'zh' | 'hi';
export type LayoutVariant = 'qwerty' | 'dvorak' | 'azerty';
export type ThemeMode = 'dark' | 'light';
export type FontSize = 'sm' | 'md' | 'lg';

export interface KeyboardLayout {
  rows: string[][];
  language: string;
}

export interface Exercise {
  id: string;
  title: string;
  content: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: LanguageCode;
}

export interface HistoryEntry {
  id: string;
  date: number;
  wpm: number;
  accuracy: number;
  exerciseTitle: string;
  language: LanguageCode;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  timeInSeconds: number;
  history: { wpm: number; time: number }[];
}

export interface GameState {
  currentExercise: Exercise | null;
  userInput: string;
  startTime: number | null;
  endTime: number | null;
  isFinished: boolean;
  errors: number;
}
