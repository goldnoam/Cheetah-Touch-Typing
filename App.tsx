
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LanguageCode, GameState, Exercise, TypingStats, LayoutVariant, HistoryEntry, ThemeMode, FontSize } from './types.ts';
import { INITIAL_EXERCISES, UI_STRINGS, KEYBOARD_VARIANTS, getLayout } from './constants.ts';
import VisualKeyboard from './VisualKeyboard.tsx';
import TypingArea from './TypingArea.tsx';
import StatsPanel from './StatsPanel.tsx';
import HistoryModal from './HistoryModal.tsx';
import { 
  Zap, RotateCcw, Globe, Trophy, TrendingUp, Settings2, 
  History as HistoryIcon, Volume2, VolumeX, Moon, Sun, 
  Target, Type as TypeIcon, Pause, Play, RefreshCw,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';

const App: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('he');
  const [selectedVariant, setSelectedVariant] = useState<LayoutVariant>('qwerty');
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [currentExercise, setCurrentExercise] = useState<Exercise>(INITIAL_EXERCISES[0]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [wpmGoal, setWpmGoal] = useState<number>(40);
  const [isPaused, setIsPaused] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentExercise: INITIAL_EXERCISES[0],
    userInput: '',
    startTime: null,
    endTime: null,
    isFinished: false,
    errors: 0
  });
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Native Browser TTS
  const speak = useCallback((text: string) => {
    if (!isSoundEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang === 'he' ? 'he-IL' : 'en-US';
    utterance.rate = 1.2;
    window.speechSynthesis.speak(utterance);
  }, [isSoundEnabled, selectedLang]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('cheetah_typing_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    const savedSound = localStorage.getItem('cheetah_typing_sound');
    if (savedSound !== null) setIsSoundEnabled(savedSound === 'true');
    const savedTheme = localStorage.getItem('cheetah_typing_theme') as ThemeMode;
    if (savedTheme) setTheme(savedTheme || 'dark');
    const savedGoal = localStorage.getItem('cheetah_typing_goal');
    if (savedGoal) setWpmGoal(parseInt(savedGoal, 10));
    const savedFontSize = localStorage.getItem('cheetah_typing_fontsize') as FontSize;
    if (savedFontSize) setFontSize(savedFontSize);
  }, []);

  useEffect(() => { localStorage.setItem('cheetah_typing_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('cheetah_typing_sound', isSoundEnabled.toString()); }, [isSoundEnabled]);
  useEffect(() => { localStorage.setItem('cheetah_typing_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('cheetah_typing_goal', wpmGoal.toString()); }, [wpmGoal]);
  useEffect(() => { localStorage.setItem('cheetah_typing_fontsize', fontSize); }, [fontSize]);

  const playFeedbackSound = useCallback((isCorrect: boolean) => {
    if (!isSoundEnabled) return;
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    if (isCorrect) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
    }
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [isSoundEnabled]);

  const currentLayout = useMemo(() => getLayout(selectedLang, selectedVariant), [selectedLang, selectedVariant]);

  const stats = useMemo<TypingStats>(() => {
    const { userInput, startTime, endTime, errors } = gameState;
    const now = Date.now();
    const durationMs = (endTime || (startTime ? now : now)) - (startTime || now);
    const charCount = userInput.length;
    const minutes = durationMs / 1000 / 60;
    const wpm = minutes > 0 ? Math.round((charCount / 5) / minutes) : 0;
    const accuracy = charCount > 0 ? Math.round(((charCount - errors) / charCount) * 100) : 100;
    return {
      wpm, accuracy: Math.max(0, accuracy), errors, timeInSeconds: Math.floor(durationMs / 1000),
      history: history.slice(-10).map(h => ({ wpm: h.wpm, time: h.date }))
    };
  }, [gameState, history]);

  const handleInputChange = (value: string) => {
    if (gameState.isFinished || isPaused) return;
    
    if (value.length < gameState.userInput.length) {
      setGameState(prev => ({ ...prev, userInput: value }));
      return;
    }
    
    let { startTime, errors } = gameState;
    if (!startTime && value.length > 0) startTime = Date.now();
    const lastCharIdx = value.length - 1;
    const isCorrect = value[lastCharIdx] === currentExercise.content[lastCharIdx];
    if (!isCorrect) errors++;
    playFeedbackSound(isCorrect);
    
    const isFinished = value.length === currentExercise.content.length;
    setGameState(prev => ({ ...prev, userInput: value, startTime, errors, isFinished, endTime: isFinished ? Date.now() : null }));
    
    if (lastCharIdx >= 0) {
      setActiveKey(value[lastCharIdx]);
      setTimeout(() => setActiveKey(null), 100);
    }
  };

  const restartGame = useCallback(() => {
    setGameState({ currentExercise, userInput: '', startTime: null, endTime: null, isFinished: false, errors: 0 });
    setIsPaused(false);
    speak("Reset");
  }, [currentExercise, speak]);

  const togglePause = () => {
    if (gameState.startTime && !gameState.isFinished) {
      setIsPaused(!isPaused);
      speak(isPaused ? "Resumed" : "Paused");
    }
  };

  const changeLanguage = (lang: LanguageCode) => {
    setSelectedLang(lang);
    let variant: LayoutVariant = 'qwerty';
    if (lang === 'fr') variant = 'azerty';
    setSelectedVariant(variant);
    const exercise = INITIAL_EXERCISES.find(e => e.language === lang) || INITIAL_EXERCISES[0];
    setCurrentExercise(exercise);
    setGameState({ currentExercise: exercise, userInput: '', startTime: null, endTime: null, isFinished: false, errors: 0 });
    setIsPaused(false);
    speak(`Switched to ${lang}`);
  };

  const isHe = selectedLang === 'he';
  const t = UI_STRINGS[selectedLang] || UI_STRINGS.en;
  const isDarkMode = theme === 'dark';

  return (
    <div className={`min-h-screen transition-all duration-300 flex flex-col items-center py-6 md:py-10 px-4 ${isHe ? 'rtl' : 'ltr'} ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history} 
        onClear={() => setHistory([])}
        currentLang={selectedLang}
        theme={theme}
      />

      <header className="flex flex-col items-center mb-8 text-center w-full relative">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
            <Zap className="text-gray-900 w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">{t.title}</h1>
        </div>
        <p className="text-gray-500 text-sm md:text-lg font-medium opacity-80">{t.tagline}</p>

        <div className={`absolute top-0 ${isHe ? 'left-0' : 'right-0'} flex gap-2`}>
          <button 
            aria-label="Toggle Theme"
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            className={`p-3 rounded-2xl border shadow-sm transition-all ${isDarkMode ? 'bg-gray-900 border-gray-800 text-amber-500' : 'bg-white border-slate-200 text-amber-600'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            aria-label="Toggle Sound"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`p-3 rounded-2xl border shadow-sm transition-all ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}
          >
            {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            aria-label="View History"
            onClick={() => setIsHistoryOpen(true)}
            className={`p-3 rounded-2xl border shadow-sm transition-all ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}
          >
            <HistoryIcon size={20} />
          </button>
        </div>
      </header>

      <main className="w-full max-w-5xl flex flex-col items-center gap-8">
        
        {/* Controls Bar */}
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <div className={`p-1.5 rounded-2xl border flex flex-wrap gap-1 shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
            {(Object.keys(KEYBOARD_VARIANTS) as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedLang === lang ? 'bg-amber-500 text-gray-900' : 'hover:bg-gray-800/50'}`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <div className={`p-1.5 rounded-2xl border flex gap-1 shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
            <TypeIcon size={16} className="mx-2 my-auto opacity-50" />
            {(['sm', 'md', 'lg'] as FontSize[]).map(sz => (
              <button
                key={sz}
                onClick={() => setFontSize(sz)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${fontSize === sz ? 'bg-amber-500 text-gray-900' : 'hover:bg-gray-800/50'}`}
              >
                {sz.toUpperCase()}
              </button>
            ))}
          </div>

          <div className={`p-1.5 rounded-2xl border flex items-center shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
            <Target size={16} className="mx-2 opacity-50" />
            <input 
              type="number" value={wpmGoal} 
              onChange={(e) => setWpmGoal(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-10 bg-transparent font-bold text-center focus:outline-none"
            />
            <span className="text-[10px] font-bold pr-2 opacity-50">WPM</span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={togglePause}
              disabled={!gameState.startTime || gameState.isFinished}
              className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-800 hover:text-amber-500' : 'bg-white border-slate-200 hover:text-amber-600'} disabled:opacity-20`}
              title="Pause/Play"
            >
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
            <button 
              onClick={restartGame}
              className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-800 hover:text-amber-500' : 'bg-white border-slate-200 hover:text-amber-600'}`}
              title="Reset"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Typing Section */}
        <div className="w-full flex flex-col items-center gap-6 animate-in fade-in duration-500">
          <div className="w-full max-w-4xl flex justify-between items-center px-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-amber-500">•</span> {currentExercise.title}
              {isPaused && <span className="text-amber-500 animate-pulse text-sm ml-2 font-black uppercase">PAUSED</span>}
            </h2>
          </div>

          <TypingArea 
            content={currentExercise.content} 
            userInput={gameState.userInput}
            onInputChange={handleInputChange}
            isFinished={gameState.isFinished}
            theme={theme}
            fontSize={fontSize}
            isPaused={isPaused}
          />

          <StatsPanel stats={stats} lang={selectedLang} theme={theme} wpmGoal={wpmGoal} />

          {/* Mobile WASD/Arrows HUD (Visual Only for Experience) */}
          <div className="md:hidden flex flex-col items-center gap-2 opacity-50">
             <div className="flex justify-center"><button className="p-3 bg-gray-800 rounded-lg"><ChevronUp size={20}/></button></div>
             <div className="flex gap-2">
               <button className="p-3 bg-gray-800 rounded-lg"><ChevronLeft size={20}/></button>
               <button className="p-3 bg-gray-800 rounded-lg"><ChevronDown size={20}/></button>
               <button className="p-3 bg-gray-800 rounded-lg"><ChevronRight size={20}/></button>
             </div>
          </div>

          <VisualKeyboard layout={currentLayout} activeKey={activeKey} languageCode={selectedLang} theme={theme} />
        </div>

        {gameState.isFinished && (
          <div role="alertdialog" className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300 p-4">
            <div className={`p-8 md:p-12 rounded-[2rem] border-2 shadow-2xl flex flex-col items-center gap-6 max-w-md w-full text-center ${isDarkMode ? 'bg-gray-900 border-amber-500/50' : 'bg-white border-amber-400'}`}>
              <Trophy className="text-amber-500 w-16 h-16 animate-bounce" />
              <h3 className="text-4xl font-black">{t.finished}</h3>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="p-4 rounded-2xl bg-gray-800/50 border border-gray-800">
                  <div className="text-xs font-bold uppercase opacity-50">{t.wpm}</div>
                  <div className="text-3xl font-black text-amber-500">{stats.wpm}</div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-800/50 border border-gray-800">
                  <div className="text-xs font-bold uppercase opacity-50">{t.accuracy}</div>
                  <div className="text-3xl font-black text-green-500">{stats.accuracy}%</div>
                </div>
              </div>
              <button
                onClick={restartGame}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-gray-900 font-black rounded-2xl text-xl shadow-lg transition-all"
              >
                {t.restart}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-10 flex flex-col items-center gap-4 text-gray-500 text-xs text-center border-t border-gray-800 w-full max-w-5xl">
        <div className="flex flex-wrap justify-center gap-6 opacity-60">
          <span className="flex items-center gap-1"><TrendingUp size={14} /> Peak Performance</span>
          <span className="flex items-center gap-1"><Globe size={14} /> Multi-Language</span>
          <span className="flex items-center gap-1"><Target size={14} /> WPM Goals</span>
        </div>
        <p className="font-medium">© Noam Gold AI 2026 | Send Feedback: <a href="mailto:goldnoamai@gmail.com" className="text-amber-500 hover:underline">goldnoamai@gmail.com</a></p>
      </footer>
    </div>
  );
};

export default App;
