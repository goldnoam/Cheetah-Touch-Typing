
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LanguageCode, GameState, Exercise, TypingStats, LayoutVariant, HistoryEntry, ThemeMode } from './types.ts';
import { INITIAL_EXERCISES, UI_STRINGS, KEYBOARD_VARIANTS, getLayout } from './constants.ts';
import { generateExercise } from './services/geminiService.ts';
import VisualKeyboard from './VisualKeyboard.tsx';
import TypingArea from './TypingArea.tsx';
import StatsPanel from './StatsPanel.tsx';
import HistoryModal from './HistoryModal.tsx';
import { Zap, RotateCcw, ChevronRight, Globe, Cpu, Trophy, TrendingUp, Settings2, History as HistoryIcon, Volume2, VolumeX, Moon, Sun, Target, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

const App: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('he');
  const [selectedVariant, setSelectedVariant] = useState<LayoutVariant>('qwerty');
  const [currentExercise, setCurrentExercise] = useState<Exercise>(INITIAL_EXERCISES[0]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [wpmGoal, setWpmGoal] = useState<number>(40);
  const [gameState, setGameState] = useState<GameState>({
    currentExercise: INITIAL_EXERCISES[0],
    userInput: '',
    startTime: null,
    endTime: null,
    isFinished: false,
    errors: 0
  });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load state from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('cheetah_typing_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    const savedSound = localStorage.getItem('cheetah_typing_sound');
    if (savedSound !== null) setIsSoundEnabled(savedSound === 'true');
    
    const savedTheme = localStorage.getItem('cheetah_typing_theme') as ThemeMode;
    if (savedTheme) setTheme(savedTheme);

    const savedGoal = localStorage.getItem('cheetah_typing_goal');
    if (savedGoal) setWpmGoal(parseInt(savedGoal, 10));
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('cheetah_typing_history', JSON.stringify(history));
  }, [history]);

  // Save sound setting
  useEffect(() => {
    localStorage.setItem('cheetah_typing_sound', isSoundEnabled.toString());
  }, [isSoundEnabled]);

  // Save theme
  useEffect(() => {
    localStorage.setItem('cheetah_typing_theme', theme);
  }, [theme]);

  // Save goal
  useEffect(() => {
    localStorage.setItem('cheetah_typing_goal', wpmGoal.toString());
  }, [wpmGoal]);

  const playSound = useCallback((isCorrect: boolean) => {
    if (!isSoundEnabled) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    if (isCorrect) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    }
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [isSoundEnabled]);

  const currentLayout = useMemo(() => 
    getLayout(selectedLang, selectedVariant), 
    [selectedLang, selectedVariant]
  );

  const stats = useMemo<TypingStats>(() => {
    const { userInput, startTime, endTime, errors } = gameState;
    const now = Date.now();
    const durationMs = (endTime || (startTime ? now : now)) - (startTime || now);
    const charCount = userInput.length;
    const minutes = durationMs / 1000 / 60;
    const wpm = minutes > 0 ? Math.round((charCount / 5) / minutes) : 0;
    const accuracy = charCount > 0 ? Math.round(((charCount - errors) / charCount) * 100) : 100;
    return {
      wpm,
      accuracy: Math.max(0, accuracy),
      errors,
      timeInSeconds: Math.floor(durationMs / 1000),
      history: history.slice(-10).map(h => ({ wpm: h.wpm, time: h.date }))
    };
  }, [gameState, history]);

  useEffect(() => {
    if (gameState.isFinished && gameState.endTime) {
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        date: Date.now(),
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        exerciseTitle: currentExercise.title,
        language: selectedLang
      };
      setHistory(prev => {
        if (prev.find(e => e.id === newEntry.id)) return prev;
        const last = prev[prev.length - 1];
        if (last && Date.now() - last.date < 1000) return prev;
        return [...prev, newEntry];
      });
    }
  }, [gameState.isFinished, gameState.endTime, stats.wpm, stats.accuracy, currentExercise.title, selectedLang]);

  const handleInputChange = (value: string) => {
    if (gameState.isFinished) return;
    if (value.length < gameState.userInput.length) {
      setGameState(prev => ({ ...prev, userInput: value }));
      return;
    }
    let { startTime, errors } = gameState;
    if (!startTime && value.length > 0) startTime = Date.now();
    const lastCharIdx = value.length - 1;
    const isCorrect = value[lastCharIdx] === currentExercise.content[lastCharIdx];
    if (!isCorrect) errors++;
    playSound(isCorrect);
    const isFinished = value.length === currentExercise.content.length;
    setGameState(prev => ({
      ...prev,
      userInput: value,
      startTime,
      errors,
      isFinished,
      endTime: isFinished ? Date.now() : null
    }));
    if (lastCharIdx >= 0) {
      setActiveKey(value[lastCharIdx]);
      setTimeout(() => setActiveKey(null), 100);
    }
  };

  const restartGame = useCallback(() => {
    setGameState({
      currentExercise,
      userInput: '',
      startTime: null,
      endTime: null,
      isFinished: false,
      errors: 0
    });
  }, [currentExercise]);

  const clearHistory = () => {
    if (confirm(selectedLang === 'he' ? 'האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?' : 'Are you sure you want to clear all history?')) {
      setHistory([]);
    }
  };

  const changeLanguage = (lang: LanguageCode) => {
    setSelectedLang(lang);
    setAiError(false);
    if (!KEYBOARD_VARIANTS[lang]['dvorak']) setSelectedVariant('qwerty');
    const exercise = INITIAL_EXERCISES.find(e => e.language === lang) || INITIAL_EXERCISES[0];
    setCurrentExercise(exercise);
    setGameState({ ...gameState, userInput: '', startTime: null, endTime: null, isFinished: false, errors: 0 });
  };

  const handleAiExercise = async () => {
    setIsAiLoading(true);
    setAiError(false);
    const newEx = await generateExercise(selectedLang, 'intermediate');
    
    if (newEx) {
      const fullEx: Exercise = {
        id: Date.now().toString(),
        title: newEx.title || 'AI Challenge',
        content: newEx.content || '',
        language: selectedLang,
        level: 'intermediate'
      };
      setCurrentExercise(fullEx);
      restartGame();
    } else {
      setAiError(true);
    }
    setIsAiLoading(false);
  };

  const useDefaultExercise = () => {
    setAiError(false);
    const defaultEx = INITIAL_EXERCISES.find(e => e.language === selectedLang) || INITIAL_EXERCISES[0];
    setCurrentExercise(defaultEx);
    restartGame();
  };

  const isHe = selectedLang === 'he';
  const t = UI_STRINGS[isHe ? 'he' : 'en'];
  const isDarkMode = theme === 'dark';

  return (
    <div className={`min-h-screen transition-all duration-300 flex flex-col items-center py-6 md:py-12 px-4 ${isHe ? 'rtl font-assistant' : 'ltr font-sans'} ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history} 
        onClear={clearHistory}
        currentLang={selectedLang}
        theme={theme}
      />

      <header className="flex flex-col items-center mb-6 md:mb-12 text-center w-full relative">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="bg-amber-500 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg shadow-amber-500/20">
            <Zap className="text-gray-900 w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
          </div>
          <h1 className={`text-3xl md:text-6xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            {UI_STRINGS.he.title}
          </h1>
        </div>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'} text-sm md:text-lg font-medium opacity-80`}>
          {UI_STRINGS.he.tagline}
        </p>

        <div className={`absolute top-0 ${isHe ? 'left-0' : 'right-0'} flex gap-1 md:gap-2 scale-90 md:scale-100`}>
          <button 
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            className={`p-2 md:p-3 rounded-2xl border transition-all shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-amber-500' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-600'}`}
            title={isHe ? 'החלף מצב תצוגה' : 'Toggle Theme'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`p-2 md:p-3 rounded-2xl border transition-all shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-amber-500' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-600'}`}
            title={isHe ? (isSoundEnabled ? 'השתק צלילים' : 'הפעל צלילים') : (isSoundEnabled ? 'Mute Sounds' : 'Unmute Sounds')}
          >
            {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className={`p-2 md:p-3 rounded-2xl border transition-all shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-amber-500' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-600'}`}
            title={isHe ? 'היסטוריה' : 'History'}
          >
            <HistoryIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl flex flex-col items-center gap-6 md:gap-10">
        
        {/* Error Notification */}
        {aiError && (
          <div className={`w-full max-w-4xl p-4 md:p-6 rounded-2xl border animate-in slide-in-from-top-4 duration-300 flex flex-col md:flex-row items-center gap-4 ${isDarkMode ? 'bg-red-900/20 border-red-500/50' : 'bg-red-50 border-red-200'}`}>
            <AlertCircle className="text-red-500 w-10 h-10 flex-shrink-0" />
            <div className="flex-1 text-center md:text-start">
              <h4 className={`font-bold ${isDarkMode ? 'text-red-200' : 'text-red-900'}`}>{t.aiErrorTitle}</h4>
              <p className={`text-sm ${isDarkMode ? 'text-red-300/80' : 'text-red-700'}`}>{t.aiErrorDesc}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={handleAiExercise}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all"
              >
                <RefreshCw size={16} />
                {t.retry}
              </button>
              <button 
                onClick={useDefaultExercise}
                className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-bold transition-all border ${isDarkMode ? 'border-red-500/30 text-red-200 hover:bg-red-500/10' : 'border-red-200 text-red-700 hover:bg-red-100'}`}
              >
                {t.useDefault}
              </button>
              <button 
                onClick={() => setAiError(false)}
                className={`p-2 rounded-full transition-all ${isDarkMode ? 'text-red-300 hover:bg-red-500/20' : 'text-red-400 hover:bg-red-100'}`}
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Settings Bar */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 w-full">
            <div className={`p-1 rounded-xl border flex flex-wrap justify-center items-center shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
              {(Object.keys(KEYBOARD_VARIANTS) as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`
                    px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all
                    ${selectedLang === lang 
                      ? 'bg-amber-500 text-gray-900 shadow-md' 
                      : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100')}
                  `}
                >
                  {KEYBOARD_VARIANTS[lang]['qwerty']?.language.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className={`p-1 rounded-xl border flex items-center shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
              <Target size={16} className={`${isDarkMode ? 'text-gray-500' : 'text-slate-400'} mx-2`} />
              <input 
                type="number" 
                value={wpmGoal} 
                onChange={(e) => setWpmGoal(Math.max(1, parseInt(e.target.value) || 0))}
                className={`w-12 bg-transparent font-bold text-center focus:outline-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                title={t.goal}
              />
              <span className={`text-[10px] uppercase font-bold px-2 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>WPM</span>
            </div>

            <button
              onClick={handleAiExercise}
              disabled={isAiLoading}
              className={`
                flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-indigo-600 hover:bg-indigo-500 
                text-white text-xs md:text-base font-bold rounded-xl md:rounded-2xl transition-all shadow-lg 
                hover:shadow-indigo-500/40 disabled:opacity-50
              `}
            >
              {isAiLoading ? (
                <span className="animate-spin h-4 w-4 md:h-5 md:w-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <Cpu className="w-4 h-4 md:w-5 md:h-5" />
              )}
              {UI_STRINGS.he.generateAI}
            </button>
          </div>

          {KEYBOARD_VARIANTS[selectedLang]['dvorak'] && (
            <div className={`flex items-center gap-2 p-1 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-slate-200'}`}>
              <Settings2 size={16} className={`${isDarkMode ? 'text-gray-500' : 'text-slate-400'} mx-2`} />
              <button
                onClick={() => setSelectedVariant('qwerty')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${selectedVariant === 'qwerty' ? 'bg-amber-500 text-gray-900 shadow-sm' : (isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600')}`}
              >
                QWERTY
              </button>
              <button
                onClick={() => setSelectedVariant('dvorak')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${selectedVariant === 'dvorak' ? 'bg-amber-500 text-gray-900 shadow-sm' : (isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600')}`}
              >
                DVORAK
              </button>
            </div>
          )}
        </div>

        {/* Typing Section */}
        <div className="flex flex-col items-center gap-4 md:gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 px-2">
          <div className="w-full max-w-4xl flex justify-between items-center px-1">
            <h2 className={`text-base md:text-xl font-bold flex items-center gap-2 truncate ${isDarkMode ? 'text-gray-100' : 'text-slate-800'}`}>
              <ChevronRight className={`w-5 h-5 md:w-6 md:h-6 text-amber-500 ${isHe ? 'rotate-0' : 'rotate-180'}`} />
              <span className="truncate">{currentExercise.title}</span>
            </h2>
            <button 
              onClick={restartGame}
              className={`p-1.5 md:p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-amber-400 hover:bg-gray-800' : 'text-slate-400 hover:text-amber-600 hover:bg-slate-200'}`}
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <TypingArea 
            content={currentExercise.content} 
            userInput={gameState.userInput}
            onInputChange={handleInputChange}
            isFinished={gameState.isFinished}
            theme={theme}
          />

          <StatsPanel stats={stats} lang={isHe ? 'he' : 'en'} theme={theme} wpmGoal={wpmGoal} />

          <VisualKeyboard 
            layout={currentLayout} 
            activeKey={activeKey}
            languageCode={selectedLang}
            theme={theme}
          />
        </div>

        {gameState.isFinished && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-950/80 backdrop-blur-md animate-in fade-in zoom-in duration-300 p-4">
            <div className={`p-6 md:p-10 rounded-3xl border-2 shadow-2xl flex flex-col items-center gap-4 md:gap-6 max-w-sm w-full text-center ${isDarkMode ? 'bg-gray-800 border-amber-500/50' : 'bg-white border-amber-400'}`}>
              <div className="bg-amber-500/20 p-4 md:p-5 rounded-full">
                <Trophy className="text-amber-500 w-12 h-12 md:w-16 md:h-16" />
              </div>
              <h3 className={`text-3xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{t.finished}</h3>
              
              {stats.wpm >= wpmGoal && (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-500 rounded-full font-bold text-sm">
                  <Target size={14} />
                  {t.goalMet}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
                <div className={`p-3 md:p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className={`text-[10px] md:text-xs uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>{t.wpm}</div>
                  <div className="text-2xl md:text-3xl font-black text-amber-500">{stats.wpm}</div>
                </div>
                <div className={`p-3 md:p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className={`text-[10px] md:text-xs uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>{t.accuracy}</div>
                  <div className="text-2xl md:text-3xl font-black text-green-500">{stats.accuracy}%</div>
                </div>
              </div>
              <button
                onClick={restartGame}
                className="w-full py-3 md:py-4 bg-amber-500 hover:bg-amber-400 text-gray-900 font-black rounded-xl md:rounded-2xl text-lg md:text-xl shadow-lg transition-all"
              >
                {t.restart}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className={`mt-12 md:mt-20 text-xs flex flex-col items-center gap-4 px-4 text-center ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          <span className="flex items-center gap-1"><TrendingUp size={14} /> שפר ביצועים</span>
          <span className="flex items-center gap-1"><Globe size={14} /> 5+ שפות</span>
          <span className="flex items-center gap-1"><Settings2 size={14} /> QWERTY / DVORAK</span>
        </div>
        <p>© 2024 צ'יטה הקלדה עיוורת - פותח עבורך ללמוד במהירות.</p>
      </footer>
    </div>
  );
};

export default App;
