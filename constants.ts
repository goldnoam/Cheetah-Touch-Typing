
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
  fr: {
    azerty: {
      language: 'Français AZERTY',
      rows: [
        ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
        ['w', 'x', 'c', 'v', 'b', 'n', ',', ';', ':', '!']
      ]
    }
  },
  zh: {
    qwerty: {
      language: '中文 (Pinyin)',
      rows: [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
      ]
    }
  },
  hi: {
    qwerty: {
      language: 'हिन्दी (InScript)',
      rows: [
        ['ौ', 'ै', 'ा', 'ी', 'ू', 'ब', 'ह', 'ग', 'द', 'ज'],
        ['ो', 'े', '्', 'ि', 'ु', 'प', 'र', 'क', 'त', 'च'],
        ['ा', 'म', 'न', 'व', 'ल', 'स', 'य', '.', '?', '/']
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
  return langConfig[variant] || langConfig['qwerty'] || (Object.values(langConfig)[0] as KeyboardLayout);
};

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: '1',
    title: "שורת הבית - בסיס",
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
  },
  {
    id: '3',
    title: 'Français - Ligne de Base',
    language: 'fr',
    level: 'beginner',
    content: 'qsdf jklm qsdf jklm q s d f j k l m salut les amis de la ligne de base'
  },
  {
    id: '4',
    title: '中文基础 - Pinyin',
    language: 'zh',
    level: 'beginner',
    content: 'ni hao ma wo hen hao xie xie ni zhong guo typing cheetah'
  },
  {
    id: '5',
    title: 'हिन्दी अभ्यास',
    language: 'hi',
    level: 'beginner',
    content: 'क ख ग घ च छ ज झ ट ठ ड ढ त थ द ध न प फ ब भ म य र ल व'
  }
];

export const UI_STRINGS = {
  he: {
    title: "צ'יטה הקלדה עיוורת",
    tagline: "הקלדה מהירה כמו צ'יטה, דיוק של נץ.",
    startPractice: 'התחל לתרגל',
    selectLanguage: 'בחר שפה',
    wpm: 'WPM',
    accuracy: 'דיוק',
    time: 'זמן',
    errors: 'שגיאות',
    restart: 'נסה שוב',
    nextLevel: 'שלב הבא',
    finished: 'סיימת!',
    layout: 'פריסת מקלדת',
    goal: 'יעד',
    goalProgress: 'התקדמות',
    fontSize: 'גודל גופן',
    history: 'היסטוריה'
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
    finished: 'Finished!',
    layout: 'Layout',
    goal: 'Goal',
    goalProgress: 'Progress',
    fontSize: 'Font Size',
    history: 'History'
  },
  zh: {
    title: '猎豹打字',
    tagline: '打字如猎豹般迅速，准确如老鹰般。',
    startPractice: '开始练习',
    selectLanguage: '选择语言',
    wpm: 'WPM',
    accuracy: '准确度',
    time: '时间',
    errors: '错误',
    restart: '重新开始',
    nextLevel: '下一级',
    finished: '完成！',
    layout: '布局',
    goal: '目标',
    goalProgress: '进度',
    fontSize: '字体大小',
    history: '历史'
  },
  hi: {
    title: 'चीता टाइपिंग',
    tagline: 'चीते की तरह तेज और बाज की तरह सटीक।',
    startPractice: 'अभ्यास शुरू करें',
    selectLanguage: 'भाषा चुनें',
    wpm: 'WPM',
    accuracy: 'सटीकता',
    time: 'समय',
    errors: 'गलतियां',
    restart: 'पुनः प्रारंभ करें',
    nextLevel: 'अगला स्तर',
    finished: 'पूरा हुआ!',
    layout: 'लेआउट',
    goal: 'लक्ष्य',
    goalProgress: 'प्रगति',
    fontSize: 'फ़ॉन्ट आकार',
    history: 'इतिहास'
  }
};
