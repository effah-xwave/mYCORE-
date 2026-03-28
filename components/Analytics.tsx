import React from 'react';
import { useApp } from '../App';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { getDayName } from '../utils';
import { TrendingUp, Activity } from 'lucide-react';

export default function Analytics() {
  const { currentWeekInstances, habits } = useApp();

  // Prepare Data for Charts
  const chartData = Object.keys(currentWeekInstances).sort().map(date => {
    const dayInst = currentWeekInstances[date];
    const completed = dayInst.filter(i => i.completed).length;
    const total = dayInst.length;
    return {
      day: getDayName(new Date(date)),
      completed,
      total,
      val: completed, // for consistency chart (count)
      rate: total > 0 ? Math.round((completed / total) * 100) : 0 // for completion chart (percentage)
    };
  });

  const totalCompleted = chartData.reduce((acc, curr) => acc + curr.completed, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">INSIGHTS</span>
        <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Performance</h2>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-glass dark:shadow-dark-soft border border-slate-300/40 dark:border-dark-border group transition-all hover:scale-[1.02]">
           <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Weekly Completions</div>
           <div className="text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">{totalCompleted}</div>
           <div className="mt-4 flex items-center gap-2 text-green-500 text-xs font-bold">
              <TrendingUp size={14} /> +12% from last week
           </div>
        </div>
        <div className="bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-glass dark:shadow-dark-soft border border-slate-300/40 dark:border-dark-border group transition-all hover:scale-[1.02]">
           <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Current Streak</div>
           <div className="text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">
                {Math.max(0, ...habits.map(h => h.streak))} <span className="text-xl font-bold text-slate-400 dark:text-slate-600 tracking-normal">days</span>
           </div>
           <div className="mt-4 flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest">
              Keep it up!
           </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* HABIT CONSISTENCY (COUNT) */}
        <div className="bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-glass dark:shadow-dark-soft border border-slate-300/40 dark:border-dark-border h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Habit Consistency</h3>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 20 }}>
                <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                    dy={15}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    allowDecimals={false}
                />
                <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff' }}
                />
                <Bar dataKey="val" radius={[8, 8, 8, 8]} barSize={32}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-count-${index}`} fill={entry.completed >= entry.total ? '#3b82f6' : '#1e293b'} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DAILY COMPLETION RATE (%) */}
        <div className="bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-glass dark:shadow-dark-soft border border-slate-300/40 dark:border-dark-border h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Success Rate</h3>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 20 }}>
                <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                    dy={15}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    domain={[0, 100]}
                />
                <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff' }}
                    formatter={(value: number) => [`${value}%`, 'Success Rate']}
                />
                <Bar dataKey="rate" radius={[8, 8, 8, 8]} barSize={32}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-rate-${index}`} fill={entry.rate === 100 ? '#10b981' : '#3b82f6'} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* COMPLETION TREND (LINE CHART) */}
      <div className="bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-glass dark:shadow-dark-soft border border-slate-300/40 dark:border-dark-border h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Completion Trend</h3>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth</span>
            </div>
        </div>
        <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                    dy={15} 
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                    domain={[0, 100]} 
                />
                <Tooltip 
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                    contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff' }}
                    formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                />
                <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#000' }} 
                    activeDot={{ r: 8, fill: '#3b82f6', strokeWidth: 0 }}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* STRENGTH SCORES */}
      <div className="bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-glass dark:shadow-dark-soft border border-slate-300/40 dark:border-dark-border">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Habit Strength</h3>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Analysis</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {habits.map(h => (
                <div key={h.id} className="flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-300 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                         <Activity size={20} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-slate-900 dark:text-white tracking-tight">{h.name}</span>
                            <span className="text-blue-500 font-display font-bold">{h.streak * 10}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-300 dark:bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-glow" 
                                style={{ width: `${Math.min(h.streak * 10, 100)}%` }} 
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
