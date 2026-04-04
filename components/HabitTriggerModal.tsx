
import React, { useState, useEffect } from 'react';
import { Habit, TriggerType } from '../types';
import { MapPin, Smartphone, Zap, CheckCircle2, Loader2, TrendingUp, Search, Target, ShieldCheck } from 'lucide-react';
import { useApp } from '../App';

interface Props {
  habit: Habit;
  onClose: () => void;
  onConfirm: (val?: number) => void;
  initialValue?: number;
}

export default function HabitTriggerModal({ habit, onClose, onConfirm, initialValue }: Props) {
  const { user } = useApp();
  const [step, setStep] = useState(habit.goal ? 'log_progress' : 'simulate'); // log_progress -> simulate -> screen_time_success | location_success -> verifying -> success
  const [inputValue, setInputValue] = useState(initialValue !== undefined ? String(initialValue) : '');
  const [stockSim, setStockSim] = useState({ price: 0, change: 0, loading: false, done: false });
  const [permissionStep, setPermissionStep] = useState<'idle' | 'requesting' | 'granted'>('idle');
  const [marketNews, setMarketNews] = useState<{title: string, source: string}[]>([]);

  // Auto transition for Location/App Open simulation
  useEffect(() => {
    if (step === 'verifying') {
        const timer = setTimeout(() => {
            if (habit.triggerType === TriggerType.LOCATION) {
                setStep('location_success');
            } else {
                onConfirm(inputValue ? parseFloat(inputValue) : undefined);
            }
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [step, onConfirm, inputValue, habit.triggerType]);

  // Load market news if applicable
  useEffect(() => {
    if (habit.name.toLowerCase().includes('market') || habit.name.toLowerCase().includes('finance')) {
        setMarketNews([
            { title: "S&P 500 hits new record high as tech rally continues", source: "Market Terminal" },
            { title: "Federal Reserve hints at potential rate cuts in Q3", source: "Financial Times" },
            { title: "Global markets react to new trade agreements", source: "Bloomberg" }
        ]);
    }
  }, [habit.name]);

  const handleAction = () => {
    const hasPermission = (habit.triggerType === TriggerType.SCREEN_TIME && user?.permissions?.screen) ||
                          (habit.triggerType === TriggerType.LOCATION && user?.permissions?.loc);

    if (habit.triggerType === TriggerType.SCREEN_TIME || habit.triggerType === TriggerType.LOCATION) {
        if (hasPermission) {
            setPermissionStep('granted');
            setTimeout(() => {
                setPermissionStep('idle');
                setStep('verifying');
            }, 1000);
        } else {
            setPermissionStep('requesting');
            setTimeout(() => {
                setPermissionStep('granted');
                setTimeout(() => {
                    setPermissionStep('idle');
                    setStep('verifying');
                }, 1000);
            }, 1500);
        }
    } else {
        setStep('verifying');
    }
  };

  const handleStockCheck = () => {
    setStockSim({ ...stockSim, loading: true });
    // Simulate API fetch
    setTimeout(() => {
        setStockSim({ 
            price: 4120.50 + (Math.random() * 50), 
            change: 0.5 + (Math.random() * 1.5), 
            loading: false, 
            done: true 
        });
        // Auto confirm after showing result
        setTimeout(() => handleAction(), 1500);
    }, 1200);
  };

  const renderContent = () => {
    if (permissionStep === 'requesting') {
        return (
            <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 animate-bounce">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Requesting Permission</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Allow myCORE to access {habit.triggerType === TriggerType.LOCATION ? 'Location' : 'Screen Time'} data to automate your habits.
                </p>
                <div className="flex gap-3">
                    <div className="flex-1 h-1 bg-slate-100 dark:bg-dark-bg rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 animate-progress-fast" />
                    </div>
                </div>
            </div>
        );
    }

    if (permissionStep === 'granted') {
        return (
            <div className="text-center space-y-4 py-4 animate-scale-in">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Permission Granted</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Access established. Syncing data...
                </p>
            </div>
        );
    }

    // 1. MANUAL GOAL LOGGING
    if (step === 'log_progress' && habit.goal) {
        return (
            <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                    <Target size={32} />
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Log Progress</h3>
                <p className="text-slate-500 dark:text-slate-400">
                    Goal: <span className="font-bold text-slate-900 dark:text-white">{habit.goal.target} {habit.goal.unit}</span>
                </p>
                <div className="bg-slate-50 dark:bg-dark-bg p-4 rounded-xl border border-slate-200 dark:border-dark-border">
                    <label className="text-xs text-slate-400 dark:text-slate-500 block mb-1 text-left">Today's Total ({habit.goal.unit}):</label>
                    <input 
                        type="number" 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full bg-white dark:bg-dark-bg border border-slate-300 dark:border-dark-border rounded-lg px-3 py-2 text-lg font-bold text-center outline-none focus:border-blue-500 dark:text-white transition-colors"
                        placeholder="0"
                        autoFocus
                    />
                </div>
                <button 
                    onClick={() => {
                        const val = parseFloat(inputValue);
                        if (!isNaN(val)) {
                            onConfirm(val);
                        }
                    }} 
                    disabled={!inputValue}
                    className="w-full bg-slate-900 dark:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white py-3 rounded-xl font-medium transition-all"
                >
                    Update Progress
                </button>
            </div>
        );
    }

    if (step === 'verifying') {
        return (
            <div className="flex flex-col items-center justify-center py-8 animate-pulse">
                <Loader2 className="w-12 h-12 text-slate-900 dark:text-blue-500 animate-spin mb-4" />
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Verifying Signal...</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm">Connecting to {habit.triggerType.toLowerCase()} service</p>
            </div>
        )
    }

    if (step === 'screen_time_success') {
        return (
            <div className="text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Target Met!</h3>
                <p className="text-slate-500 dark:text-slate-400">
                    Your screen time of <span className="font-bold text-slate-900 dark:text-white">{inputValue} min</span> is well within your {habit.triggerConfig?.thresholdMinutes} min limit.
                </p>
                <div className="bg-slate-50 dark:bg-dark-bg p-4 rounded-xl text-sm text-slate-500 dark:text-slate-400 italic">
                    "Discipline is choosing between what you want now and what you want most."
                </div>
                <button 
                    onClick={() => onConfirm(parseInt(inputValue))} 
                    className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-xl font-medium mt-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    Confirm & Log Habit
                </button>
            </div>
        );
    }

    if (step === 'location_success') {
        return (
            <div className="text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">You're Here!</h3>
                <p className="text-slate-500 dark:text-slate-400">
                    Location verified at <br/> <span className="font-bold text-slate-900 dark:text-white">{habit.triggerConfig?.locationName}</span>
                </p>
                <button 
                    onClick={() => onConfirm()} 
                    className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-xl font-medium mt-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    Check In & Complete
                </button>
            </div>
        );
    }

    switch(habit.triggerType) {
        case TriggerType.LOCATION:
            return (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                        <MapPin size={32} />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">Simulate Location</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        Pretend you just walked into the geofence for: <br/>
                        <span className="font-semibold text-slate-900 dark:text-white">{habit.triggerConfig?.locationName}</span>
                    </p>
                    <button onClick={handleAction} className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-xl font-medium mt-4 hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors">
                        Arrive at Location
                    </button>
                </div>
            );
        case TriggerType.SCREEN_TIME:
            return (
                <div className="text-center space-y-4">
                     <div className="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 rounded-full flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
                        <Smartphone size={32} />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">Daily Screen Time</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        Goal: Less than {habit.triggerConfig?.thresholdMinutes} minutes.
                    </p>
                    <div className="bg-slate-50 dark:bg-dark-bg p-4 rounded-xl border border-slate-200 dark:border-dark-border">
                        <label className="text-xs text-slate-400 dark:text-slate-500 block mb-1 text-left">Input simulated usage (min):</label>
                        <input 
                            type="number" 
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full bg-white dark:bg-dark-bg border border-slate-300 dark:border-dark-border rounded-lg px-3 py-2 text-lg font-bold text-center outline-none focus:border-blue-500 dark:text-white transition-colors"
                            placeholder="e.g. 25"
                        />
                    </div>
                    <button 
                        onClick={() => {
                            if(parseInt(inputValue) < (habit.triggerConfig?.thresholdMinutes || 999)) {
                                setStep('screen_time_success');
                            } else {
                                alert("Time exceeded threshold! Habit failed for today.");
                                onClose();
                            }
                        }} 
                        disabled={!inputValue}
                        className="w-full bg-slate-900 dark:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white py-3 rounded-xl font-medium transition-all"
                    >
                        Verify Usage
                    </button>
                </div>
            );
        case TriggerType.APP_OPEN:
            // Check if this is a specialized Market/Finance trigger
            if (habit.triggerConfig?.actionDetail) {
                return (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                            <TrendingUp size={32} />
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">Market Update</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {habit.triggerConfig.actionDetail} via {habit.triggerConfig.appName}
                        </p>

                        {!stockSim.done ? (
                            <div className="bg-slate-50 dark:bg-dark-bg p-4 rounded-xl border border-slate-200 dark:border-dark-border space-y-3">
                                <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg p-2">
                                    <Search size={16} className="text-slate-400"/>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">SPX</span>
                                </div>
                                <button 
                                    onClick={handleStockCheck}
                                    disabled={stockSim.loading}
                                    className="w-full bg-slate-900 dark:bg-blue-600 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                                >
                                    {stockSim.loading ? <Loader2 size={16} className="animate-spin" /> : 'Get Live Price'}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-dark-bg p-4 rounded-xl border border-slate-100 dark:border-dark-border shadow-sm animate-fade-in-up">
                                <div className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">S&P 500 Index</div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {stockSim.price.toFixed(2)}
                                </div>
                                <div className="text-green-500 dark:text-green-400 font-semibold text-sm flex items-center justify-center gap-1">
                                    <TrendingUp size={14} /> +{stockSim.change.toFixed(2)}%
                                </div>
                            </div>
                        )}
                        
                        {marketNews.length > 0 && (
                            <div className="mt-4 text-left space-y-2 animate-fade-in">
                                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Latest Market Feed</h4>
                                {marketNews.map((news, i) => (
                                    <div key={i} className="p-3 bg-slate-50 dark:bg-dark-bg/50 rounded-xl border border-slate-100 dark:border-dark-border">
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug">{news.title}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-[9px] text-blue-500 font-bold">{news.source}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {stockSim.done && (
                             <p className="text-xs text-slate-400 dark:text-slate-500 italic">Syncing to habit log...</p>
                        )}
                    </div>
                )
            }

            // Default App Open
            return (
                <div className="text-center space-y-4">
                     <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-orange-600 dark:text-orange-400">
                        <Zap size={32} />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">App Interaction</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        Simulate opening the required app: <br/>
                        <span className="font-semibold text-slate-900 dark:text-white">{habit.triggerConfig?.appName}</span>
                    </p>
                     <button onClick={handleAction} className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-xl font-medium mt-4 transition-all">
                        Launch App & Read
                    </button>
                </div>
            );
        default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden border border-slate-200 dark:border-dark-border">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                ✕
            </button>
            {renderContent()}
        </div>
    </div>
  );
}
