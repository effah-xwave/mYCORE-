
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Rocket, Target, Compass, Zap, Shield, Heart, Star, Smile } from 'lucide-react';

interface LoadingTransitionProps {
  userName: string;
  onComplete: () => void;
}

export default function LoadingTransition({ userName, onComplete }: LoadingTransitionProps) {
  const [step, setStep] = useState(0);

  // Generate random particles once
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.1
    }));
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 2000),
      setTimeout(() => setStep(2), 4000),
      setTimeout(() => setStep(3), 6000),
      setTimeout(() => onComplete(), 7800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const steps = [
    {
      icon: <Smile className="w-16 h-16 text-amber-400" />,
      text: `Welcome, ${userName}`,
      subtext: "It's wonderful to see you again.",
      color: "from-amber-400/20 to-orange-400/20",
      accent: "text-amber-400",
      glow: "shadow-[0_0_50px_rgba(251,191,36,0.2)]"
    },
    {
      icon: <Heart className="w-16 h-16 text-rose-400" />,
      text: "Nurturing Your Growth",
      subtext: "Every small step leads to a beautiful journey.",
      color: "from-rose-400/20 to-pink-400/20",
      accent: "text-rose-400",
      glow: "shadow-[0_0_50px_rgba(251,113,133,0.2)]"
    },
    {
      icon: <Sparkles className="w-16 h-16 text-sky-400" />,
      text: "Achieving Your Goals",
      subtext: "Let's make today purposeful and bright.",
      color: "from-sky-400/20 to-blue-400/20",
      accent: "text-sky-400",
      glow: "shadow-[0_0_50px_rgba(56,189,248,0.2)]"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, p.opacity, 0],
              x: [`${p.x}%`, `${p.x + (Math.random() * 10 - 5)}%`],
              y: [`${p.y}%`, `${p.y + (Math.random() * 10 - 5)}%`]
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity, 
              delay: p.delay,
              ease: "linear" 
            }}
            className="absolute bg-white rounded-full"
            style={{ width: p.size, height: p.size, filter: 'blur(0.5px)' }}
          />
        ))}

        {/* Soft Ambient Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-[30%] -left-[30%] w-[100%] h-[100%] rounded-full blur-[180px] bg-gradient-to-br ${steps[step]?.color || 'from-blue-500/10 to-purple-500/10'} transition-colors duration-2000`} 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -45, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className={`absolute -bottom-[30%] -right-[30%] w-[100%] h-[100%] rounded-full blur-[180px] bg-gradient-to-tl ${steps[step]?.color || 'from-indigo-500/10 to-emerald-500/10'} transition-colors duration-2000`} 
        />
        
        {/* Grain/Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <AnimatePresence mode="wait">
        {step < 3 && (
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.97, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.03, filter: "blur(30px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center relative z-10 px-6"
          >
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center mb-16"
            >
              <div className="relative">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1], 
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`absolute -inset-10 blur-3xl bg-current opacity-20 ${steps[step].accent}`}
                />
                <div className={`relative p-10 rounded-[3.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 ${steps[step].glow}`}>
                  {steps[step].icon}
                </div>
              </div>
            </motion.div>
            
            <div className="overflow-hidden mb-8">
              <motion.h1 
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-8xl font-display font-bold text-white tracking-tight leading-[1.1]"
              >
                {steps[step].text}
              </motion.h1>
            </div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-white/60 font-medium max-w-3xl mx-auto tracking-tight leading-relaxed"
            >
              {steps[step].subtext}
            </motion.p>

            {/* Progress indicator */}
            <div className="flex justify-center gap-4 mt-20">
              {[0, 1, 2].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    width: i === step ? 56 : 10,
                    backgroundColor: i === step ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.15)",
                    opacity: i === step ? 1 : 0.4
                  }}
                  className="h-1.5 rounded-full transition-all duration-700"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Loading Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 7.8, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_30px_rgba(255,255,255,0.6)]"
        />
      </div>
    </div>
  );
}
