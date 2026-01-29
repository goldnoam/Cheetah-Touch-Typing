
import React from 'react';
import { KeyboardLayout, ThemeMode } from './types.ts';

interface VisualKeyboardProps {
  layout: KeyboardLayout;
  activeKey: string | null;
  languageCode: string;
  theme?: ThemeMode;
}

const VisualKeyboard: React.FC<VisualKeyboardProps> = ({ layout, activeKey, languageCode, theme = 'dark' }) => {
  const isRtl = languageCode === 'he';
  const isDarkMode = theme === 'dark';

  return (
    <div className={`w-full max-w-4xl overflow-x-auto pb-4 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className={`flex flex-col gap-1.5 md:gap-2 p-2 md:p-6 rounded-2xl shadow-2xl border select-none min-w-[320px] transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        {layout.rows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex justify-center gap-1 md:gap-1.5"
            style={{ 
              paddingRight: isRtl ? (rowIndex === 1 ? '0.75rem' : rowIndex === 2 ? '1.5rem' : '0') : '0',
              paddingLeft: !isRtl ? (rowIndex === 1 ? '0.75rem' : rowIndex === 2 ? '1.5rem' : '0') : '0' 
            }}
          >
            {row.map((key, keyIndex) => {
              const isActive = activeKey?.toLowerCase() === (key || "").toLowerCase();
              return (
                <div
                  key={keyIndex}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center 
                    rounded-md md:rounded-lg font-bold text-xs sm:text-sm md:text-lg transition-all duration-100
                    ${isActive 
                      ? 'bg-amber-500 text-gray-900 scale-110 shadow-lg ring-2 ring-amber-300 shadow-amber-500/50' 
                      : (isDarkMode ? 'bg-gray-700 text-gray-300 border-b-2 md:border-b-4 border-gray-950' : 'bg-slate-100 text-slate-600 border-b-2 md:border-b-4 border-slate-300')}
                  `}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center mt-1 md:mt-2">
          <div 
            className={`
              w-32 sm:w-48 md:w-64 h-8 sm:h-10 md:h-12 flex items-center justify-center 
              rounded-md md:rounded-lg transition-all duration-100
              ${activeKey === ' ' 
                ? 'bg-amber-500 scale-105 shadow-lg' 
                : (isDarkMode ? 'bg-gray-700 border-b-2 md:border-b-4 border-gray-950' : 'bg-slate-100 border-b-2 md:border-b-4 border-slate-300')}
            `}
          />
        </div>
      </div>
    </div>
  );
};

export default VisualKeyboard;
