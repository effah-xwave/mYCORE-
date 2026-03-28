import React from 'react';
import { useApp } from '../App';
import { LogOut, Download, Trash2, ChevronRight, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { user, resetApp, updateSettings } = useApp();

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "mycore_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const toggleNotifications = () => {
    if (user) {
        updateSettings({
            ...user.settings,
            notificationsEnabled: !user.settings.notificationsEnabled
        });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">PREFERENCES</span>
        <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Settings</h2>
      </div>

      <div className="space-y-8">
        
        {/* PROFILE CARD */}
        <div className="bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-glass dark:shadow-dark-soft border border-slate-300/40 dark:border-dark-border flex items-center gap-6 group transition-all hover:scale-[1.02]">
            <div className="w-20 h-20 rounded-[2rem] bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center text-3xl font-display font-bold shadow-xl shadow-blue-500/20 group-hover:rotate-3 transition-transform">
                {user?.name.charAt(0)}
            </div>
            <div>
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">{user?.name}</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Pro Member • Growth Nexis Global</p>
            </div>
        </div>

        {/* OPTIONS */}
        <div className="bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl rounded-[2.5rem] shadow-glass dark:shadow-dark-soft border border-slate-300/40 dark:border-dark-border overflow-hidden">
            <button className="w-full flex items-center justify-between p-7 hover:bg-slate-300 dark:hover:bg-white/5 border-b border-slate-300 dark:border-white/5 transition-all group">
                <span className="font-bold text-slate-700 dark:text-slate-200 tracking-tight group-hover:translate-x-1 transition-transform">Edit Habits</span>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>
            <button 
                onClick={toggleNotifications}
                className="w-full flex items-center justify-between p-7 hover:bg-slate-300 dark:hover:bg-white/5 border-b border-slate-300 dark:border-white/5 transition-all group"
            >
                 <span className="font-bold text-slate-700 dark:text-slate-200 tracking-tight group-hover:translate-x-1 transition-transform">Notifications</span>
                 <div className={`w-12 h-7 rounded-full relative transition-all duration-500 ${user?.settings.notificationsEnabled ? 'bg-blue-500 shadow-glow' : 'bg-slate-300 dark:bg-white/10'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-500 ${user?.settings.notificationsEnabled ? 'right-1' : 'left-1'}`} />
                 </div>
            </button>
             <button onClick={handleExport} className="w-full flex items-center justify-between p-7 hover:bg-slate-300 dark:hover:bg-white/5 transition-all group">
                <span className="flex items-center gap-4 font-bold text-slate-700 dark:text-slate-200 tracking-tight group-hover:translate-x-1 transition-transform">
                    <Download size={20} className="text-blue-500" /> Export Data (CSV/JSON)
                </span>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>
        </div>

        {/* DANGER ZONE */}
        <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] ml-8">Privacy & Account</h3>
            <div className="bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl rounded-[2.5rem] shadow-glass dark:shadow-dark-soft border border-slate-300/40 dark:border-dark-border overflow-hidden">
                <div className="p-8 border-b border-slate-300 dark:border-white/5">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-3">
                        <Shield size={20} className="text-blue-500" /> <span className="font-bold text-sm uppercase tracking-widest">Privacy Notice</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                        Data is stored locally on your device. We do not track your location history on our servers. Triggers are processed on-device.
                    </p>
                </div>
                <button onClick={resetApp} className="w-full flex items-center gap-4 p-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold group">
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> Sign Out & Reset Demo
                </button>
                <button className="w-full flex items-center gap-4 p-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border-t border-slate-300 dark:border-white/5 font-bold group">
                    <Trash2 size={20} className="group-hover:scale-110 transition-transform" /> Delete Account
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
