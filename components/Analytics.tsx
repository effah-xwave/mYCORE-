import React, { useState, useEffect, useMemo } from 'react';
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
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
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

  useEffect(() => {
    const fetchHeatmap = async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 29);
      
      const instances = await getInstancesForRange(formatDate(thirtyDaysAgo), formatDate(now));
      
      const data = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(thirtyDaysAgo.getDate() + i);
        const dStr = formatDate(d);
        const dayInst = instances.filter(inst => inst.date === dStr);
        const completed = dayInst.filter(inst => inst.completed).length;
        const total = dayInst.length;
        data.push({
          date: dStr,
          rate: total > 0 ? completed / total : 0
        });
      }
      setHeatmapData(data);
    };
    fetchHeatmap();
  }, [getInstancesForRange, habits]);

  const focusBalance = useMemo(() => {
    const interests = Array.from(new Set(habits.map(h => h.interest)));
    const todayInsts = currentWeekInstances[formatDate(new Date())] || [];
    
    return interests.map((interest, i) => {
      const interestHabits = habits.filter(h => h.interest === interest);
      const completed = todayInsts.filter(inst => 
        inst.completed && interestHabits.find(h => h.id === inst.habitId)
      ).length;
      const total = interestHabits.length;
      const value = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const icons: Record<string, any> = {
        'Health': Activity,
        'Productivity': Zap,
        'Learning': Brain,
        'Detox': Shield,
      };
      
      const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500'];
      
      return {
        label: interest,
        value,
        color: colors[i % colors.length],
        icon: icons[interest] || Activity
      };
    }).slice(0, 4);
  }, [habits, currentWeekInstances]);

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8 animate-fade-in">
        <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center text-slate-500 border border-white/5">
          <BarChart2 size={64} strokeWidth={1} />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-display font-bold text-white tracking-tight">No Insights Yet</h2>
          <p className="text-slate-500 max-w-sm mx-auto text-lg">
            Add some habits to start seeing your performance analytics and growth trends.
          </p>
        </div>
      </div>
    );
  }

  const totalCompleted = rangeData.reduce((acc, curr) => acc + curr.completed, 0);
  const avgRate = rangeData.length > 0 ? Math.round(rangeData.reduce((acc, curr) => acc + curr.rate, 0) / rangeData.length) : 0;

  // Calculate Growth Stats
  const calculateGrowth = () => {
    if (rangeData.length < 2) return { monthly: 0, annually: 0 };
    
    // Calculate real growth based on the current view's data
    // Compare the last half of the data to the first half
    const mid = Math.floor(rangeData.length / 2);
    const firstHalf = rangeData.slice(0, mid);
    const secondHalf = rangeData.slice(mid);
    
    const firstAvg = firstHalf.reduce((acc, curr) => acc + curr.rate, 0) / (firstHalf.length || 1);
    const secondAvg = secondHalf.reduce((acc, curr) => acc + curr.rate, 0) / (secondHalf.length || 1);
    
    const growthRate = firstAvg === 0 ? secondAvg : ((secondAvg - firstAvg) / firstAvg) * 100;
    
    return { 
      current: Math.round(growthRate * 10) / 10,
      label: view === 'weekly' ? 'vs last week' : view === 'monthly' ? 'vs last month' : 'vs last year'
    };
  };

  const growth = calculateGrowth();

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-habithub-accent uppercase tracking-[0.2em]">INSIGHTS</span>
          <h2 className="text-4xl font-display font-bold text-white tracking-tight">Performance</h2>
        </div>

        {/* View Switcher */}
        <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 self-start">
          {(['weekly', 'monthly', 'annually'] as ViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-habithub-accent text-white shadow-glow-blue' : 'text-slate-500 hover:text-white'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] group transition-all hover:scale-[1.02]">
           <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Total Completions</div>
           <div className="text-5xl font-display font-bold text-white tracking-tighter">{totalCompleted}</div>
           <div className="mt-4 flex items-center gap-2 text-green-500 text-xs font-bold">
              <TrendingUp size={14} /> +12% vs last {view.replace('ly', '')}
           </div>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] group transition-all hover:scale-[1.02]">
           <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Avg. Success Rate</div>
           <div className="text-5xl font-display font-bold text-white tracking-tighter">{avgRate}%</div>
           <div className="mt-4 flex items-center gap-2 text-habithub-accent text-xs font-bold uppercase tracking-widest">
              Consistency is key
           </div>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] group transition-all hover:scale-[1.02]">
           <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Momentum</div>
           <div className="text-5xl font-display font-bold text-white tracking-tighter">{(growth.current ?? 0) > 0 ? '+' : ''}{growth.current ?? 0}%</div>
           <div className={`mt-4 flex items-center gap-2 ${(growth.current ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'} text-xs font-bold uppercase tracking-widest`}>
              {(growth.current ?? 0) >= 0 ? <TrendingUp size={14} /> : <Activity size={14} />} {growth.label}
           </div>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] group transition-all hover:scale-[1.02]">
           <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Focus Score</div>
           <div className="text-5xl font-display font-bold text-white tracking-tighter">A+</div>
           <div className="mt-4 flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest">
              Compound Effect
           </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* HABIT CONSISTENCY (COUNT) */}
        <div className="glass-card p-8 rounded-[2.5rem] h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Habit Consistency</h3>
            <div className="w-2 h-2 rounded-full bg-habithub-accent animate-pulse" />
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
        <div className="glass-card p-8 rounded-[2.5rem] h-[400px] flex flex-col">
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
        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Activity Heatmap</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 30 Days</span>
            </div>
            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-2">
                {heatmapData.map((day, i) => {
                    return (
                        <div 
                            key={i} 
                            className="aspect-square rounded-md bg-habithub-accent transition-all hover:scale-125 cursor-pointer"
                            style={{ opacity: Math.max(0.1, day.rate) }}
                            title={`${day.date}: ${Math.round(day.rate * 100)}% completion`}
                        />
                    )
                })}
            </div>
            <div className="mt-8 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-habithub-accent opacity-10" />
                    <div className="w-3 h-3 rounded-sm bg-habithub-accent opacity-30" />
                    <div className="w-3 h-3 rounded-sm bg-habithub-accent opacity-60" />
                    <div className="w-3 h-3 rounded-sm bg-habithub-accent opacity-90" />
                </div>
                <span>More</span>
            </div>
        </div>

        {/* FOCUS BALANCE */}
        <div className="glass-card p-8 rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Focus Balance</h3>
                <PieChart size={16} className="text-habithub-accent" />
            </div>
            <div className="space-y-6">
                {focusBalance.map((item: any) => (
                    <div key={item.label} className="space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <item.icon size={14} className="text-slate-400" />
                                <span className="text-xs font-bold text-white">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{item.value}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>

      {/* COMPLETION TREND (LINE CHART) */}
      <div className="glass-card p-8 rounded-[2.5rem] h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Growth Trend</h3>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-habithub-accent" />
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
      <div className="glass-card p-8 rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Habit Strength</h3>
            <span className="text-[10px] font-bold text-habithub-accent uppercase tracking-widest">Analysis</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {habits.map(h => (
                <div key={h.id} className="flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                         <Activity size={20} className="text-habithub-accent" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-white tracking-tight">{h.name}</span>
                            <span className="text-habithub-accent font-display font-bold">{h.streak * 10}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(h.streak * 10, 100)}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-habithub-accent rounded-full shadow-glow-blue" 
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
