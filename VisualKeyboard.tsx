
import React from 'react';
import { KeyboardLayout, ThemeMode } from './types.ts';

interface VisualKeyboardProps {
  layout: KeyboardLayout;
  activeKey: string | null;
  languageCode: string;
  theme?: ThemeMode;
}

const VisualKeyboard: React.FC<VisualKeyboardProps> = ({ layout, activeKey, theme = 'dark' }) => {
  const isDarkMode = theme === 'dark';

  return (
    <div className="w-full max-w-4xl overflow-x-auto pb-4" dir="ltr">
      <div className={`flex flex-col gap-2 p-6 rounded-[2rem] shadow-2xl border select-none min-w-[320px] transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
        {layout.rows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex justify-center gap-2"
            style={{ 
              paddingLeft: (rowIndex === 1 ? '1rem' : rowIndex === 2 ? '2rem' : '0') 
            }}
          >
            {row.map((key, keyIndex) => {
              const isActive = activeKey?.toLowerCase() === (key || "").toLowerCase();
              return (
                <div
                  key={keyIndex}
                  className={`
                    w-10 h-10 md:w-14 md:h-14 flex items-center justify-center 
                    rounded-xl font-bold text-sm md:text-xl transition-all duration-100
                    ${isActive 
                      ? 'bg-amber-500 text-gray-900 scale-110 shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/20' 
                      : (isDarkMode ? 'bg-gray-800 text-gray-400 border-b-4 border-gray-950 hover:text-gray-200' : 'bg-slate-100 text-slate-500 border-b-4 border-slate-300 hover:text-slate-800')}
                  `}
                >
                  {key.toUpperCase()}
                </div>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center mt-4">
          <div 
            className={`
              w-48 md:w-72 h-12 md:h-14 flex items-center justify-center 
              rounded-xl transition-all duration-100
              ${activeKey === ' ' 
                ? 'bg-amber-500 scale-105 shadow-lg shadow-amber-500/40' 
                : (isDarkMode ? 'bg-gray-800 border-b-4 border-gray-950' : 'bg-slate-100 border-b-4 border-slate-300')}
            `}
          />
        </div>
      </div>
    </div>
  );
};

export default VisualKeyboard;
