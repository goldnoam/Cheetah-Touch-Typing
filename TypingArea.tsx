
import React, { useRef, useEffect } from 'react';
import { ThemeMode } from './types.ts';

interface TypingAreaProps {
  content: string;
  userInput: string;
  onInputChange: (value: string) => void;
  isFinished: boolean;
  theme?: ThemeMode;
}

const TypingArea: React.FC<TypingAreaProps> = ({ content, userInput, onInputChange, isFinished, theme = 'dark' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    if (!isFinished) inputRef.current?.focus();
  }, [isFinished]);

  const handleContainerClick = () => inputRef.current?.focus();

  const renderContent = () => {
    return content.split('').map((char, index) => {
      let colorClass = isDarkMode ? 'text-gray-500' : 'text-slate-300';
      let bgColorClass = '';

      if (index < userInput.length) {
        if (userInput[index] === char) {
          colorClass = isDarkMode ? 'text-green-400 font-bold' : 'text-green-600 font-bold';
        } else {
          colorClass = 'text-red-500 font-bold underline decoration-2';
          bgColorClass = isDarkMode ? 'bg-red-900/20' : 'bg-red-50';
        }
      } else if (index === userInput.length) {
        colorClass = 'text-amber-500 border-b-2 border-amber-500 animate-pulse';
      }

      return (
        <span key={index} className={`${colorClass} ${bgColorClass} transition-colors duration-150`}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div 
      onClick={handleContainerClick}
      className={`relative w-full max-w-4xl p-4 md:p-8 rounded-2xl border shadow-xl cursor-text min-h-[120px] md:min-h-[160px] transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}
    >
      <div className="mono text-xl sm:text-2xl md:text-3xl leading-relaxed tracking-wide select-none break-words">
        {renderContent()}
      </div>
      
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 inset-0 w-full h-full cursor-default"
        value={userInput}
        onChange={(e) => !isFinished && onInputChange(e.target.value)}
        autoFocus
        autoComplete="off"
        spellCheck="false"
      />
      
      {!isFinished && userInput.length === 0 && (
        <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-[1px] rounded-2xl pointer-events-none ${isDarkMode ? 'bg-gray-900/40' : 'bg-slate-50/40'}`}>
          <p className="text-amber-500 animate-bounce font-bold text-sm md:text-base uppercase tracking-widest">
            {theme === 'dark' ? 'התחל להקליד!' : 'Start Typing!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TypingArea;
