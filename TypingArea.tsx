
import React, { useRef, useEffect } from 'react';
import { ThemeMode, FontSize } from './types.ts';

interface TypingAreaProps {
  content: string;
  userInput: string;
  onInputChange: (value: string) => void;
  isFinished: boolean;
  theme?: ThemeMode;
  fontSize?: FontSize;
}

const TypingArea: React.FC<TypingAreaProps> = ({ content, userInput, onInputChange, isFinished, theme = 'dark', fontSize = 'md' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    if (!isFinished) inputRef.current?.focus();
  }, [isFinished]);

  const handleContainerClick = () => inputRef.current?.focus();

  const renderContent = () => {
    return content.split('').map((char, index) => {
      let colorClass = isDarkMode ? 'text-gray-600' : 'text-slate-300';
      let bgColorClass = '';

      if (index < userInput.length) {
        if (userInput[index] === char) {
          colorClass = isDarkMode ? 'text-green-400' : 'text-green-600';
        } else {
          colorClass = 'text-red-500 underline decoration-red-500/50';
          bgColorClass = isDarkMode ? 'bg-red-500/10' : 'bg-red-50';
        }
      } else if (index === userInput.length) {
        colorClass = 'text-amber-500 border-b-2 border-amber-500 animate-pulse';
      }

      return (
        <span key={index} className={`${colorClass} ${bgColorClass} transition-colors duration-150 rounded-sm px-[1px]`}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  const fontSizeClass = `font-size-${fontSize}`;

  return (
    <div 
      onClick={handleContainerClick}
      className={`relative w-full max-w-4xl p-8 rounded-[2rem] border shadow-2xl cursor-text min-h-[160px] md:min-h-[200px] transition-all duration-300 ${isDarkMode ? 'bg-gray-900 border-gray-800 shadow-black/50' : 'bg-white border-slate-200'}`}
    >
      <div className={`mono leading-relaxed tracking-wide select-none break-words ${fontSizeClass}`}>
        {renderContent()}
      </div>
      
      <input
        ref={inputRef}
        type="text"
        aria-label="Typing input"
        className="absolute opacity-0 inset-0 w-full h-full cursor-default"
        value={userInput}
        onChange={(e) => !isFinished && onInputChange(e.target.value)}
        autoFocus
        autoComplete="off"
        spellCheck="false"
      />
      
      {!isFinished && userInput.length === 0 && (
        <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-[2px] rounded-[2rem] pointer-events-none`}>
          <p className="text-amber-500 animate-pulse font-black text-xl tracking-[0.2em] uppercase">
            Start Typing
          </p>
        </div>
      )}
    </div>
  );
};

export default TypingArea;
