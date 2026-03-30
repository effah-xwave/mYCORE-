
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Rocket, Target, Compass, Zap, Shield, Crown, Star } from 'lucide-react';

interface LoadingTransitionProps {
  userName: string;
  onComplete: () => void;
}

export default function LoadingTransition({ userName, onComplete }: LoadingTransitionProps) {
  const [step, setStep] = useState(0);

  // Generate random particles once
  const particles = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2
    }));
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 2500),
      setTimeout(() => setStep(2), 5000),
      setTimeout(() => setStep(3), 7500),
      setTimeout(() => onComplete(), 9500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const steps = [
    {
      icon: <Crown className="w-16 h-16 text-amber-500" />,
      text: `Welcome, ${userName}`,
      subtext: "Your empire of habits awaits.",
      color: "from-amber-500/40 to-orange-500/40",
      accent: "text-amber-500",
      glow: "shadow-[0_0_50px_rgba(245,158,11,0.3)]"
    },
    {
      icon: <Rocket className="w-16 h-16 text-blue-500" />,
      text: "Forging Your Legacy",
      subtext: "Every action today echoes in your future.",
      color: "from-blue-500/40 to-indigo-500/40",
      accent: "text-blue-500",
      glow: "shadow-[0_0_50px_rgba(59,130,246,0.3)]"
    },
    {
      icon: <Shield className="w-16 h-16 text-emerald-500" />,
      text: "Mastering the Craft",
      subtext: "Precision, discipline, and the pursuit of excellence.",
      color: "from-emerald-500/40 to-teal-500/40",
      accent: "text-emerald-500",
      glow: "shadow-[0_0_50px_rgba(16,185,129,0.3)]"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#020202] flex items-center justify-center overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, p.opacity, 0],
              x: [`${p.x}%`, `${p.x + (Math.random() * 15 - 7.5)}%`],
              y: [`${p.y}%`, `${p.y + (Math.random() * 15 - 7.5)}%`]
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

        {/* Moving Lens Flare */}
        <motion.div 
          animate={{ 
            x: ["-100%", "200%"],
            y: ["-100%", "200%"]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute w-[1000px] h-[1000px] bg-gradient-radial from-white/5 to-transparent opacity-20 blur-3xl"
        />

        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            rotate: [0, 180, 0],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-[40%] -left-[40%] w-[120%] h-[120%] rounded-full blur-[200px] bg-gradient-to-br ${steps[step]?.color || 'from-blue-500/20 to-purple-500/20'} transition-colors duration-2500`} 
        />
        <motion.div 
          animate={{ 
            scale: [1.4, 1, 1.4],
            rotate: [0, -180, 0],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className={`absolute -bottom-[40%] -right-[40%] w-[120%] h-[120%] rounded-full blur-[200px] bg-gradient-to-tl ${steps[step]?.color || 'from-indigo-500/20 to-emerald-500/20'} transition-colors duration-2500`} 
        />
        
        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        {/* Grain/Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <AnimatePresence mode="wait">
        {step < 3 && (
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(30px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(40px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center relative z-10 px-6"
          >
            <motion.div 
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center mb-20"
            >
              <div className="relative">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.3, 1], 
                    opacity: [0.4, 0.8, 0.4],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    scale: { duration: 4, repeat: Infinity },
                    opacity: { duration: 4, repeat: Infinity },
                    rotate: { duration: 30, repeat: Infinity, ease: "linear" }
                  }}
                  className={`absolute -inset-12 blur-3xl bg-current opacity-30 ${steps[step].accent}`}
                />
                <div className={`relative p-12 rounded-[4rem] bg-white/5 backdrop-blur-3xl border border-white/10 ${steps[step].glow}`}>
                  {steps[step].icon}
                </div>
              </div>
            </motion.div>
            
            <div className="overflow-hidden mb-10">
              <motion.h1 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-7xl md:text-[10rem] font-display font-black text-white tracking-tighter leading-[0.85] uppercase"
              >
                {steps[step].text}
              </motion.h1>
            </div>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-3xl md:text-4xl text-white/60 font-light max-w-4xl mx-auto tracking-tight leading-relaxed"
            >
              {steps[step].subtext}
            </motion.p>

            {/* Progress indicator */}
            <div className="flex justify-center gap-6 mt-24">
              {[0, 1, 2].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    width: i === step ? 80 : 16,
                    backgroundColor: i === step ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.1)",
                    opacity: i === step ? 1 : 0.3
                  }}
                  className="h-2 rounded-full transition-all duration-1000"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Loading Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/5">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 9.5, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_40px_rgba(255,255,255,1)]"
        />
      </div>
    </div>
  );
}
