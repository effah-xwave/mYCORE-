
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, LayoutDashboard, Zap, BarChart2, CheckSquare } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: any;
  highlight?: string; // CSS selector or description
}

const STEPS: TutorialStep[] = [
  {
    title: "Welcome to myCORE",
    description: "Your all-in-one platform for growth, productivity, and habit mastery. Let's take a quick tour.",
    icon: Sparkles
  },
  {
    title: "The Dashboard",
    description: "This is your command center. Track your daily habits, see your momentum, and stay on top of your routine.",
    icon: LayoutDashboard
  },
  {
    title: "Growth AI Coach",
    description: "Meet your personal AI coach. Get actionable advice, psychological insights, and motivational support tailored to your journey.",
    icon: Sparkles
  },
  {
    title: "Optimize Your Routine",
    description: "Use our AI-powered optimizer to refine your habits and find the perfect flow for your lifestyle.",
    icon: Zap
  },
  {
    title: "Tasks & Projects",
    description: "Manage your professional and personal goals with integrated task tracking and project management.",
    icon: CheckSquare
  },
  {
    title: "Analytics & Insights",
    description: "Visualize your progress with detailed charts and heatmaps. See how your consistency builds over time.",
    icon: BarChart2
  }
];

interface TutorialOverlayProps {
  onClose: () => void;
}

export default function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-dark-border overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 p-1">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-full flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-blue-500' : 'bg-slate-100 dark:bg-white/10'}`}
            />
          ))}
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-10 pt-14 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-[2rem] bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
              <step.icon size={40} strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{step.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <ChevronLeft size={18} /> Back
            </button>

            <button
              onClick={nextStep}
              className="px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
