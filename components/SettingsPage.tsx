import React, { useState } from 'react';
import { useApp } from '../App';
import { LogOut, Download, Trash2, ChevronRight, Shield, Sparkles, Edit2, Check, X, HelpCircle, RefreshCcw } from 'lucide-react';

export default function SettingsPage() {
  const { user, resetApp, updateSettings, updateCoachName, updateUserProfile, setIsTutorialOpen } = useApp();
  const [isRenamingCoach, setIsRenamingCoach] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newCoachName, setNewCoachName] = useState(user?.coachName || '');
  const [customPhotoURL, setCustomPhotoURL] = useState(user?.photoURL || '');
  const [renameError, setRenameError] = useState('');

  const avatarOptions = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Casper',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Toby',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver'
  ];

  const handleUpdatePhoto = async (url: string) => {
    await updateUserProfile({ photoURL: url });
    setCustomPhotoURL(url);
  };

  const canRenameCoach = () => {
    if (!user?.lastCoachRenameDate) return true;
    const lastRename = new Date(user.lastCoachRenameDate);
    const now = new Date();
    const diffInMonths = (now.getFullYear() - lastRename.getFullYear()) * 12 + (now.getMonth() - lastRename.getMonth());
    return diffInMonths >= 5;
  };

  const getNextRenameDate = () => {
    if (!user?.lastCoachRenameDate) return null;
    const date = new Date(user.lastCoachRenameDate);
    date.setMonth(date.getMonth() + 5);
    return date.toLocaleDateString();
  };

  const handleRenameCoach = async () => {
    if (!newCoachName.trim()) return;
    if (!canRenameCoach()) {
      setRenameError(`You can only rename your coach once every 5 months. Next available: ${getNextRenameDate()}`);
      return;
    }
    await updateCoachName(newCoachName);
    setIsRenamingCoach(false);
    setRenameError('');
  };

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

  const handleHardReset = async () => {
    if (confirm("Are you sure you want to completely reset your profile? This will clear all your habits, tasks, and interests, and take you back to onboarding. This cannot be undone.")) {
      await resetApp(true);
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
        <div className="bg-white dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border flex flex-col gap-8 group transition-all">
            <div className="flex items-center gap-6">
                <div className="relative group/avatar">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center text-3xl font-display font-bold shadow-xl shadow-blue-500/20 group-hover/avatar:rotate-3 transition-transform overflow-hidden">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            user?.name.charAt(0)
                        )}
                    </div>
                    <button 
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-slate-200 dark:border-dark-border flex items-center justify-center text-slate-500 hover:text-blue-500 transition-all"
                    >
                        <Edit2 size={18} />
                    </button>
                </div>
                <div>
                    <h3 className="font-display font-bold text-3xl text-slate-900 dark:text-white tracking-tight">{user?.name}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Pro Member • Growth Nexis Global</p>
                </div>
            </div>

            {isEditingProfile && (
                <div className="animate-fade-in space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Avatar</label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                            {avatarOptions.map((url) => (
                                <button 
                                    key={url}
                                    onClick={() => handleUpdatePhoto(url)}
                                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${user?.photoURL === url ? 'border-blue-500 scale-110 shadow-glow' : 'border-transparent hover:border-slate-200 dark:hover:border-white/20'}`}
                                >
                                    <img src={url} alt="Avatar Option" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Image URL</label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={customPhotoURL}
                                onChange={(e) => setCustomPhotoURL(e.target.value)}
                                className="flex-1 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                placeholder="https://example.com/image.jpg"
                            />
                            <button 
                                onClick={() => handleUpdatePhoto(customPhotoURL)}
                                className="px-6 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* OPTIONS */}
        <div className="bg-white dark:bg-dark-card backdrop-blur-xl rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border overflow-hidden">
            {/* Coach Renaming */}
            <div className="w-full p-7 border-b border-slate-200 dark:border-white/5 transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <span className="font-bold text-slate-700 dark:text-slate-200 tracking-tight">Growth Coach Name</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Current: {user?.coachName}</p>
                        </div>
                    </div>
                    {!isRenamingCoach && (
                        <button 
                            onClick={() => { setIsRenamingCoach(true); setNewCoachName(user?.coachName || ''); }}
                            className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-blue-500 transition-all"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                </div>

                {isRenamingCoach && (
                    <div className="space-y-3 animate-fade-in">
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={newCoachName}
                                onChange={(e) => setNewCoachName(e.target.value)}
                                className="flex-1 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                                placeholder="Enter new coach name"
                            />
                            <button 
                                onClick={handleRenameCoach}
                                className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                <Check size={18} />
                            </button>
                            <button 
                                onClick={() => { setIsRenamingCoach(false); setRenameError(''); }}
                                className="w-10 h-10 bg-slate-100 dark:bg-white/10 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {renameError && <p className="text-[10px] font-bold text-red-500 ml-1">{renameError}</p>}
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Note: You can only rename your coach once every 5 months.</p>
                    </div>
                )}
            </div>

            <button 
                onClick={() => setIsTutorialOpen(true)}
                className="w-full flex items-center justify-between p-7 hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 transition-all group"
            >
                <span className="flex items-center gap-4 font-bold text-slate-700 dark:text-slate-200 tracking-tight group-hover:translate-x-1 transition-transform">
                    <HelpCircle size={20} className="text-blue-500" /> App Tutorial
                </span>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>

            <button className="w-full flex items-center justify-between p-7 hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 transition-all group">
                <span className="font-bold text-slate-700 dark:text-slate-200 tracking-tight group-hover:translate-x-1 transition-transform">Edit Habits</span>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>
            <button 
                onClick={toggleNotifications}
                className="w-full flex items-center justify-between p-7 hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 transition-all group"
            >
                 <span className="font-bold text-slate-700 dark:text-slate-200 tracking-tight group-hover:translate-x-1 transition-transform">Notifications</span>
                 <div className={`w-12 h-7 rounded-full relative transition-all duration-500 ${user?.settings.notificationsEnabled ? 'bg-blue-500 shadow-glow' : 'bg-slate-100 dark:bg-white/10'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-500 ${user?.settings.notificationsEnabled ? 'right-1' : 'left-1'}`} />
                 </div>
            </button>
             <button onClick={handleExport} className="w-full flex items-center justify-between p-7 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                <span className="flex items-center gap-4 font-bold text-slate-700 dark:text-slate-200 tracking-tight group-hover:translate-x-1 transition-transform">
                    <Download size={20} className="text-blue-500" /> Export Data (CSV/JSON)
                </span>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>
        </div>

        {/* DANGER ZONE */}
        <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] ml-8">Privacy & Account</h3>
            <div className="bg-white dark:bg-dark-card backdrop-blur-xl rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border overflow-hidden">
                <div className="p-8 border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-3">
                        <Shield size={20} className="text-blue-500" /> <span className="font-bold text-sm uppercase tracking-widest">Privacy Notice</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                        Data is stored locally on your device. We do not track your location history on our servers. Triggers are processed on-device.
                    </p>
                </div>
                <button onClick={() => resetApp(false)} className="w-full flex items-center gap-4 p-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold group">
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> Sign Out & Reset Demo
                </button>
                <button 
                    onClick={handleHardReset}
                    className="w-full flex items-center gap-4 p-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border-t border-slate-100 dark:border-white/5 font-bold group"
                >
                    <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" /> Hard Reset Profile
                </button>
                <button className="w-full flex items-center gap-4 p-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border-t border-slate-100 dark:border-white/5 font-bold group">
                    <Trash2 size={20} className="group-hover:scale-110 transition-transform" /> Delete Account
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
