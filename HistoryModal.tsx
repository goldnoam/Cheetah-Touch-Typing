
import React from 'react';
import { HistoryEntry, LanguageCode, ThemeMode } from './types.ts';
import { UI_STRINGS } from './constants.ts';
import { X, Calendar, Zap, Trash2 } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onClear: () => void;
  currentLang: LanguageCode;
  theme?: ThemeMode;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onClear, currentLang, theme = 'dark' }) => {
  if (!isOpen) return null;

  const isHe = currentLang === 'he';
  const t = UI_STRINGS[isHe ? 'he' : 'en'];
  const isDarkMode = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-colors duration-300 ${isHe ? 'rtl font-assistant' : 'ltr font-sans'} ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <Calendar className="text-amber-500 w-6 h-6" />
            <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{isHe ? 'היסטוריית הקלדה' : 'Typing History'}</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-slate-200 text-slate-400'}`}>
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
              <Zap size={48} className="opacity-20" />
              <p className="text-lg font-medium">{isHe ? 'עדיין אין היסטוריה. התחל להקליד!' : 'No history yet. Start typing!'}</p>
            </div>
          ) : (
            [...history].sort((a, b) => b.date - a.date).map((entry) => (
              <div key={entry.id} className={`border p-4 rounded-2xl flex items-center justify-between group transition-all ${isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-amber-500/30' : 'bg-slate-50 border-slate-100 hover:border-amber-400/30'}`}>
                <div className="flex flex-col gap-1">
                  <span className={`font-bold text-sm md:text-base line-clamp-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{entry.exerciseTitle}</span>
                  <span className={`text-[10px] md:text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                    {new Date(entry.date).toLocaleDateString(isHe ? 'he-IL' : 'en-US')} | {new Date(entry.date).toLocaleTimeString(isHe ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>{t.wpm}</span>
                    <span className="text-amber-500 font-black text-lg md:text-xl">{entry.wpm}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>{t.accuracy}</span>
                    <span className="text-green-500 font-black text-lg md:text-xl">{entry.accuracy}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {history.length > 0 && (
          <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-slate-50/50 border-slate-200'}`}>
            <button onClick={onClear} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold">
              <Trash2 size={16} />
              {isHe ? 'מחק הכל' : 'Clear All'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;
