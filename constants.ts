
import { LanguageCode, KeyboardLayout, Exercise, LayoutVariant } from './types.ts';

export const KEYBOARD_VARIANTS: Record<LanguageCode, Partial<Record<LayoutVariant, KeyboardLayout>>> = {
  he: {
    qwerty: {
      language: 'עברית',
      rows: [
        ['/', "'", 'ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'],
        ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף', ','],
        ['ז', 'ס', 'ב', 'נ', 'מ', 'צ', 'ת', 'ץ', '.', 'ת']
      ]
    }
  },
  en: {
    qwerty: {
      language: 'English QWERTY',
      rows: [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
      ]
    },
    dvorak: {
      language: 'English Dvorak',
      rows: [
        ["'", ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l'],
        ['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's'],
        [';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z']
      ]
    }
  },
  ru: {
    qwerty: {
      language: 'Русский',
      rows: [
        ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
        ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
        ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.']
      ]
    }
  },
  es: {
    qwerty: {
      language: 'Español',
      rows: [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-']
      ]
    }
  },
  de: {
    qwerty: {
      language: 'Deutsch',
      rows: [
        ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
        ['y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-']
      ]
    }
  }
};

export const getLayout = (lang: LanguageCode, variant: LayoutVariant): KeyboardLayout => {
  const langConfig = KEYBOARD_VARIANTS[lang];
  return langConfig[variant] || langConfig['qwerty'] || Object.values(langConfig)[0] as KeyboardLayout;
};

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: '1',
    title: 'שורת הבית - בסיס',
    language: 'he',
    level: 'beginner',
    content: 'כך כך דג דג דג כד כד שד שד שד עכ עכ עכ לחי לחי לחי חלח חלח חלח שדגכ עיהל'
  },
  {
    id: '2',
    title: 'English Home Row',
    language: 'en',
    level: 'beginner',
    content: 'asdf asdf jkl; jkl; asdf jkl; a s d f j k l ; sad lad fad dad salsa flask alfalfa'
  }
];

export const UI_STRINGS = {
  he: {
    title: "צ'יטה הקלדה עיוורת",
    tagline: "הקלדה מהירה כמו צ'יטה, דיוק של נץ.",
    startPractice: 'התחל לתרגל',
    selectLanguage: 'בחר שפה',
    wpm: 'מילים לדקה',
    accuracy: 'דיוק',
    time: 'זמן',
    errors: 'שגיאות',
    restart: 'נסה שוב',
    nextLevel: 'שלב הבא',
    generateAI: 'צור תרגיל AI',
    loading: 'טוען...',
    finished: 'סיימת!',
    layout: 'פריסת מקלדת',
    goal: 'יעד WPM',
    goalMet: 'הגעת ליעד!',
    goalProgress: 'התקדמות ליעד',
    aiErrorTitle: 'התרחשה שגיאה ביצירת התרגיל',
    aiErrorDesc: 'לא הצלחנו ליצור תרגיל AI כרגע. בדוק את החיבור לאינטרנט או נסה שוב.',
    retry: 'נסה שוב',
    useDefault: 'השתמש בברירת מחדל'
  },
  en: {
    title: 'Cheetah Typing',
    tagline: 'Type fast like a cheetah, accurate like a hawk.',
    startPractice: 'Start Practice',
    selectLanguage: 'Select Language',
    wpm: 'WPM',
    accuracy: 'Accuracy',
    time: 'Time',
    errors: 'Errors',
    restart: 'Restart',
    nextLevel: 'Next Level',
    generateAI: 'AI Generate',
    loading: 'Loading...',
    finished: 'Finished!',
    layout: 'Keyboard Layout',
    goal: 'WPM Goal',
    goalMet: 'Goal Reached!',
    goalProgress: 'Goal Progress',
    aiErrorTitle: 'AI Generation Failed',
    aiErrorDesc: "We couldn't generate an AI exercise right now. Please check your connection or try again.",
    retry: 'Retry',
    useDefault: 'Use Default'
  }
};
