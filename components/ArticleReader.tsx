
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, BookOpen, Clock, ChevronRight, ChevronLeft, CheckCircle2, ExternalLink } from 'lucide-react';
import { Article, ArticleService } from '../services/articleService';
import { useApp } from '../App';

interface ArticleReaderProps {
  onClose: () => void;
}

export default function ArticleReader({ onClose }: ArticleReaderProps) {
  const { habits, currentWeekInstances, handleTrigger } = useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [readingTime, setReadingTime] = useState(0); // in seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const READING_THRESHOLD = 60; // 1 minute for demo, can be adjusted

  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true);
      const fetched = await ArticleService.fetchRandomArticles(5);
      setArticles(fetched);
      setIsLoading(false);
    };
    loadArticles();

    // Start timer
    timerRef.current = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (readingTime >= READING_THRESHOLD && !isCompleted) {
      triggerReadingHabit();
    }
  }, [readingTime]);

  const triggerReadingHabit = async () => {
    // Find a reading habit
    const readingHabit = habits.find(h => 
      h.name.toLowerCase().includes('read') || 
      h.interest.toLowerCase().includes('learn')
    );

    if (readingHabit) {
      const today = new Date().toISOString().split('T')[0];
      const existingInstance = currentWeekInstances[today]?.find(i => i.habitId === readingHabit.id);
      
      if (existingInstance) {
        if (!existingInstance.completed) {
          await handleTrigger(existingInstance.id);
          setIsCompleted(true);
        }
      } else {
        // Use virtual ID
        const virtualId = `${today}_${readingHabit.id}`;
        await handleTrigger(virtualId);
        setIsCompleted(true);
      }
    }
  };

  const currentArticle = articles[currentIndex];

  const nextArticle = () => {
    if (currentIndex < articles.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Reset reading time for new article? Or keep it cumulative?
      // Cumulative seems better for "habit completion"
    }
  };

  const prevArticle = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8"
    >
      <div className="bg-white dark:bg-dark-card w-full max-w-4xl h-full max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-dark-border">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-glow">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">Article Reader</h3>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <Clock size={12} />
                  {Math.floor(readingTime / 60)}:{(readingTime % 60).toString().padStart(2, '0')}
                </div>
                {isCompleted && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase tracking-widest animate-fade-in">
                    <CheckCircle2 size={12} />
                    Habit Completed
                  </div>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-500 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-slate-500 font-medium animate-pulse">Fetching random articles from The Arch Insight...</p>
            </div>
          ) : currentArticle ? (
            <motion.article 
              key={currentArticle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              {currentArticle.imageUrl && (
                <img 
                  src={currentArticle.imageUrl} 
                  alt={currentArticle.title}
                  className="w-full h-64 md:h-80 object-cover rounded-3xl mb-8 shadow-lg"
                  referrerPolicy="no-referrer"
                />
              )}
              
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                {currentArticle.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-8 text-sm text-slate-500 font-medium">
                {currentArticle.author && <span>By {currentArticle.author}</span>}
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>{new Date(currentArticle.date).toLocaleDateString()}</span>
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed space-y-6">
                {/* WordPress content is HTML, so we use dangerouslySetInnerHTML safely since it's from a trusted source we requested */}
                <div 
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: currentArticle.content }} 
                />
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-dark-border flex items-center justify-between">
                <a 
                  href={currentArticle.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
                >
                  Read on original site <ExternalLink size={14} />
                </a>
              </div>
            </motion.article>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <p className="text-slate-500 font-medium">No articles found. Please try again later.</p>
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm"
              >
                Go Back
              </button>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        {!isLoading && articles.length > 0 && (
          <div className="p-6 border-t border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
            <button 
              onClick={prevArticle}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'}`}
            >
              <ChevronLeft size={18} /> Previous
            </button>
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Article {currentIndex + 1} of {articles.length}
            </div>

            <button 
              onClick={nextArticle}
              disabled={currentIndex === articles.length - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${currentIndex === articles.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'}`}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
