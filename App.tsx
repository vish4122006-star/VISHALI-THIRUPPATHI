import React, { useState, useEffect, useCallback } from 'react';
import type { Course } from './types';
import { generateCourse } from './services/geminiService';
import { Header } from './components/Header';
import { CourseDisplay } from './components/CourseDisplay';
import { Rewards } from './components/Rewards';
import { AiAssistant } from './components/AiAssistant';
import { Footer } from './components/Footer';
import { GraduationCap, Zap, Palette, ShieldCheck } from './components/icons';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4 text-cyan-400">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{children}</p>
    </div>
);


const CourseGenerator: React.FC<{
  onGenerate: (topic: string) => void;
  isLoading: boolean;
}> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onGenerate(topic);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
        <div className="w-full">
            <div className="relative z-10 p-8 min-h-screen flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-grid-cyan-500/[0.2] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
                <h1 className="text-5xl font-extrabold tracking-tight mb-4" style={{ textShadow: '0 0 15px #06b6d4, 0 0 25px #06b6d4' }}>
                    AI Course Creator
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                    Turn any topic into a comprehensive, structured course in seconds. AI-powered course creation at your fingertips.
                </p>
                <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., 'The History of Ancient Rome' or 'Introduction to Quantum Computing'"
                            className="w-full p-4 pr-32 bg-gray-800/50 border-2 border-cyan-500 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 shadow-lg"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !topic.trim()}
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-cyan-500 text-black font-bold py-2 px-6 rounded-full hover:bg-cyan-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-cyan-500/50"
                        >
                            <GraduationCap className="w-5 h-5"/>
                            {isLoading ? 'Generating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <div className="relative z-10 w-full py-20 px-6 container mx-auto">
             <h2 className="text-4xl font-bold text-center mb-12" style={{ textShadow: '0 0 10px #06b6d4' }}>Why Choose Learnova?</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <FeatureCard icon={<Zap className="w-10 h-10" />} title="Instant Generation">
                    Leverage cutting-edge AI to generate complete course structures, from modules to lesson activities, in just a few moments.
                </FeatureCard>
                <FeatureCard icon={<Palette className="w-10 h-10" />} title="Multiple Formats">
                    Export your generated course into various formats including PDF, PPTX, and text documents to fit your specific needs.
                </FeatureCard>
                <FeatureCard icon={<ShieldCheck className="w-10 h-10" />} title="Get Certified">
                    Formalize your learning and creation process by generating a custom certificate for every course you create.
                </FeatureCard>
             </div>
        </div>
    </div>
  );
};

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-fuchsia-500"></div>
        <p className="mt-4 text-lg text-fuchsia-400">AI is crafting your course...</p>
    </div>
);

const App: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [currentPage, setCurrentPage] = useState<'home' | 'rewards'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisit');
    const currentStreak = parseInt(localStorage.getItem('streak') || '0', 10);

    if (lastVisit === today) {
        setStreak(currentStreak);
        return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastVisit === yesterday.toDateString()) {
        const newStreak = currentStreak + 1;
        setStreak(newStreak);
        localStorage.setItem('streak', newStreak.toString());
    } else {
        setStreak(1);
        localStorage.setItem('streak', '1');
    }
    localStorage.setItem('lastVisit', today);
  }, []);

  const handleGenerateCourse = useCallback(async (topic: string) => {
    setIsLoading(true);
    setError(null);
    setCourse(null);
    setCurrentPage('home');
    try {
      const generatedCourse = await generateCourse(topic);
      setCourse(generatedCourse);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);
  
  const handleNavigation = (page: 'home' | 'rewards') => {
      if (page === 'home') {
        setCurrentPage('home');
      } else {
        setCurrentPage(page);
      }
  }

  const handleCreateNew = () => {
    setCourse(null);
    setError(null);
    setCurrentPage('home');
  }

  const renderContent = () => {
      if (currentPage === 'rewards') {
          return <Rewards />;
      }
      if (isLoading) {
          return <Loader />;
      }
      if (error) {
          return (
              <div className="flex flex-col items-center justify-center min-h-screen text-center text-red-400">
                  <h2 className="text-3xl font-bold">Generation Failed</h2>
                  <p className="mt-2 max-w-lg">{error}</p>
                  <button
                      onClick={handleCreateNew}
                      className="mt-6 bg-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-fuchsia-700 transition-colors"
                  >
                      Try Again
                  </button>
              </div>
          );
      }
      if (course) {
          return <CourseDisplay course={course} onCreateNew={handleCreateNew} />;
      }
      return <CourseGenerator onGenerate={handleGenerateCourse} isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans flex flex-col">
      <Header 
        streak={streak} 
        onNavigate={handleNavigation}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onGenerateSuggestion={handleGenerateCourse}
      />
      <main className="pt-20 flex-grow">
        {renderContent()}
      </main>
      <Footer />
      <AiAssistant course={course} />
    </div>
  );
};

export default App;