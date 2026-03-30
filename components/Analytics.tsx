import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { getDayName, formatDate } from '../utils';
import { TrendingUp, Activity, Calendar, BarChart2, PieChart, Target, Zap, Brain, Shield } from 'lucide-react';
import { HabitInstance } from '../types';

type ViewType = 'weekly' | 'monthly' | 'annually';

export default function Analytics() {
  const { currentWeekInstances, habits, getInstancesForRange } = useApp();
  const [view, setView] = useState<ViewType>('weekly');
  const [rangeData, setRangeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const now = new Date();
      let start: Date;
      let data: any[] = [];

      if (view === 'weekly') {
        // Use currentWeekInstances already in context
        data = Object.keys(currentWeekInstances).sort().map(date => {
          const dayInst = currentWeekInstances[date];
          const completed = dayInst.filter(i => i.completed).length;
          const total = dayInst.length;
          return {
            label: getDayName(new Date(date)),
            completed,
            total,
            rate: total > 0 ? Math.round((completed / total) * 100) : 0
          };
        });
      } else if (view === 'monthly') {
        start = new Date(now.getFullYear(), now.getMonth(), 1); // Start of month
        const instances = await getInstancesForRange(formatDate(start), formatDate(now));
        
        // Group by week or day? Let's do day for monthly
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          const dStr = formatDate(new Date(now.getFullYear(), now.getMonth(), i));
          const dayInst = instances.filter(inst => inst.date === dStr);
          const completed = dayInst.filter(inst => inst.completed).length;
          const total = dayInst.length;
          data.push({
            label: i.toString(),
            completed,
            total,
            rate: total > 0 ? Math.round((completed / total) * 100) : 0
          });
        }
      } else {
        // Annually - group by month
        start = new Date(now.getFullYear(), 0, 1);
        const instances = await getInstancesForRange(formatDate(start), formatDate(now));
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        data = months.map((m, idx) => {
          const monthInst = instances.filter(inst => new Date(inst.date).getMonth() === idx);
          const completed = monthInst.filter(inst => inst.completed).length;
          const total = monthInst.length;
          return {
            label: m,
            completed,
            total,
            rate: total > 0 ? Math.round((completed / total) * 100) : 0
          };
        });
      }

      setRangeData(data);
      setIsLoading(false);
    };

    fetchData();
  }, [view, currentWeekInstances]);

  const totalCompleted = rangeData.reduce((acc, curr) => acc + curr.completed, 0);
  const avgRate = rangeData.length > 0 ? Math.round(rangeData.reduce((acc, curr) => acc + curr.rate, 0) / rangeData.length) : 0;

  // Calculate Growth Stats
  const calculateGrowth = () => {
    if (rangeData.length < 2) return { monthly: 0, annually: 0 };
    
    // Simple mock growth calculation based on current data trends
    // In a real app, this would compare current month/year to previous
    const monthlyGrowth = 12.4; // Mock value
    const annuallyGrowth = 45.2; // Mock value
    
    return { monthly: monthlyGrowth, annually: annuallyGrowth };
  };

  const growth = calculateGrowth();

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">INSIGHTS</span>
          <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Performance</h2>
        </div>

        {/* View Switcher */}
        <div className="flex p-1.5 bg-slate-50 dark:bg-dark-bg backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-dark-border self-start">
          {(['weekly', 'monthly', 'annually'] as ViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border group transition-all hover:scale-[1.02]">
           <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Total Completions</div>
           <div className="text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">{totalCompleted}</div>
           <div className="mt-4 flex items-center gap-2 text-green-500 text-xs font-bold">
              <TrendingUp size={14} /> +12% vs last {view.replace('ly', '')}
           </div>
        </div>
        <div className="bg-white dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border group transition-all hover:scale-[1.02]">
           <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Avg. Success Rate</div>
           <div className="text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">{avgRate}%</div>
           <div className="mt-4 flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest">
              Consistency is key
           </div>
        </div>
        <div className="bg-white dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border group transition-all hover:scale-[1.02]">
           <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Monthly Growth</div>
           <div className="text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">+{growth.monthly}%</div>
           <div className="mt-4 flex items-center gap-2 text-green-500 text-xs font-bold uppercase tracking-widest">
              Accelerating
           </div>
        </div>
        <div className="bg-white dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border group transition-all hover:scale-[1.02]">
           <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Annual Growth</div>
           <div className="text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">+{growth.annually}%</div>
           <div className="mt-4 flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest">
              Compound Effect
           </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* HABIT CONSISTENCY (COUNT) */}
        <div className="bg-white dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Habit Consistency</h3>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rangeData} margin={{ top: 0, right: 0, left: -25, bottom: 20 }}>
                <XAxis 
                    dataKey="label" 
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
                <Bar dataKey="completed" radius={[8, 8, 8, 8]} barSize={view === 'monthly' ? 8 : 32}>
                    {rangeData.map((entry, index) => (
                        <Cell key={`cell-count-${index}`} fill={entry.completed >= entry.total && entry.total > 0 ? '#3b82f6' : '#1e293b'} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DAILY COMPLETION RATE (%) */}
        <div className="bg-white dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Success Rate</h3>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rangeData} margin={{ top: 0, right: 0, left: -25, bottom: 20 }}>
                <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis 
                    dataKey="label" 
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
                    cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                    contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff' }}
                    formatter={(value: number) => [`${value}%`, 'Success Rate']}
                />
                <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorRate)" 
                    strokeWidth={3}
                />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* HEATMAP & FOCUS BALANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HEATMAP */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Activity Heatmap</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 30 Days</span>
            </div>
            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-2">
                {Array.from({ length: 30 }).map((_, i) => {
                    const opacity = Math.random() * 0.8 + 0.1;
                    return (
                        <div 
                            key={i} 
                            className="aspect-square rounded-md bg-blue-500 transition-all hover:scale-125 cursor-pointer"
                            style={{ opacity }}
                            title={`Day ${i+1}: ${Math.round(opacity * 100)}% completion`}
                        />
                    )
                })}
            </div>
            <div className="mt-8 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-blue-500 opacity-10" />
                    <div className="w-3 h-3 rounded-sm bg-blue-500 opacity-30" />
                    <div className="w-3 h-3 rounded-sm bg-blue-500 opacity-60" />
                    <div className="w-3 h-3 rounded-sm bg-blue-500 opacity-90" />
                </div>
                <span>More</span>
            </div>
        </div>

        {/* FOCUS BALANCE */}
        <div className="bg-white dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Focus Balance</h3>
                <PieChart size={16} className="text-blue-500" />
            </div>
            <div className="space-y-6">
                {[
                    { label: 'Health', value: 75, color: 'bg-blue-500', icon: Activity },
                    { label: 'Productivity', value: 45, color: 'bg-indigo-500', icon: Zap },
                    { label: 'Learning', value: 60, color: 'bg-purple-500', icon: Brain },
                    { label: 'Detox', value: 30, color: 'bg-amber-500', icon: Shield },
                ].map((item) => (
                    <div key={item.label} className="space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <item.icon size={14} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{item.value}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>

      {/* COMPLETION TREND (LINE CHART) */}
      <div className="bg-white dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Growth Trend</h3>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
            </div>
        </div>
        <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rangeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                    dataKey="label" 
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
                    dot={view !== 'monthly'} 
                    activeDot={{ r: 8, fill: '#3b82f6', strokeWidth: 0 }}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* STRENGTH SCORES */}
      <div className="bg-white dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Habit Strength</h3>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Analysis</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {habits.map(h => (
                <div key={h.id} className="flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                         <Activity size={20} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-slate-900 dark:text-white tracking-tight">{h.name}</span>
                            <span className="text-blue-500 font-display font-bold">{h.streak * 10}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(h.streak * 10, 100)}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-blue-600 rounded-full shadow-glow" 
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
