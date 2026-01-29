
import React from 'react';
import { TypingStats, ThemeMode } from './types.ts';
import { UI_STRINGS } from './constants.ts';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface StatsPanelProps {
  stats: TypingStats;
  lang: 'he' | 'en';
  theme?: ThemeMode;
  wpmGoal?: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, lang, theme = 'dark', wpmGoal = 40 }) => {
  const isHe = lang === 'he';
  const t = UI_STRINGS[isHe ? 'he' : 'en'];
  const isDarkMode = theme === 'dark';
  const goalPercent = Math.min(100, Math.round((stats.wpm / wpmGoal) * 100));

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label={t.wpm} value={stats.wpm} color="text-amber-500" theme={theme} />
        <StatCard label={t.accuracy} value={`${stats.accuracy}%`} color="text-green-500" theme={theme} />
        <StatCard label={t.errors} value={stats.errors} color="text-red-500" theme={theme} />
        <StatCard label={t.time} value={`${stats.timeInSeconds}s`} color="text-blue-500" theme={theme} />
      </div>
      
      {/* Goal Progress Bar */}
      <div className={`p-4 rounded-xl border flex flex-col gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center text-[10px] md:text-xs font-bold uppercase tracking-wider">
          <span className={isDarkMode ? 'text-gray-400' : 'text-slate-400'}>{t.goalProgress}</span>
          <span className={stats.wpm >= wpmGoal ? 'text-green-500' : (isDarkMode ? 'text-gray-300' : 'text-slate-600')}>
            {stats.wpm} / {wpmGoal} WPM
          </span>
        </div>
        <div className={`h-2 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
          <div 
            className={`h-full transition-all duration-500 ease-out rounded-full ${stats.wpm >= wpmGoal ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-amber-500'}`} 
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </div>

      {stats.history.length > 0 && (
        <div className={`p-4 rounded-xl border h-32 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.history}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', 
                  borderColor: isDarkMode ? '#374151' : '#e2e8f0',
                  color: isDarkMode ? '#f9fafb' : '#1e293b'
                }} 
                itemStyle={{ color: '#f59e0b' }}
              />
              <Bar dataKey="wpm" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, color: string, theme: ThemeMode }> = ({ label, value, color, theme }) => (
  <div className={`p-3 md:p-4 rounded-xl border flex flex-col items-center justify-center shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
    <span className={`text-[10px] md:text-xs uppercase tracking-widest mb-1 font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>{label}</span>
    <span className={`text-xl md:text-2xl font-black ${color}`}>{value}</span>
  </div>
);

export default StatsPanel;
