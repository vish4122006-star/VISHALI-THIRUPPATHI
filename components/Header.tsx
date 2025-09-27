
import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Flame, ChevronDown, X } from './icons';

interface HeaderProps {
    streak: number;
    onNavigate: (page: 'home' | 'rewards') => void;
    isLoggedIn: boolean;
    onLogin: () => void;
    onLogout: () => void;
    onGenerateSuggestion: (topic: string) => void;
}

const suggestions = ['AI for Beginners', 'Web3 Development', 'Data Science with Python', 'Sustainable Energy'];

const LoginModal: React.FC<{ onClose: () => void; onLogin: () => void; }> = ({ onClose, onLogin }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-gray-900 border border-fuchsia-500/50 rounded-lg p-8 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Login</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        required
                        placeholder="you@example.com"
                        className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 mb-6"
                    />
                    <button type="submit" className="w-full bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-fuchsia-700 transition-colors shadow-lg shadow-fuchsia-600/30">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};


export const Header: React.FC<HeaderProps> = ({ streak, onNavigate, isLoggedIn, onLogin, onLogout, onGenerateSuggestion }) => {
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setIsSuggestionsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSuggestionClick = (topic: string) => {
        onGenerateSuggestion(topic);
        setIsSuggestionsOpen(false);
    };

    return (
        <>
        <header className="fixed top-0 left-0 right-0 bg-gray-900/50 backdrop-blur-sm z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onNavigate('home')}
                >
                    <GraduationCap className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-3xl font-extrabold text-white tracking-wider" style={{ textShadow: '0 0 8px #06b6d4' }}>
                        Learnova
                    </h1>
                </div>
                <nav className="flex items-center gap-8">
                     <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="text-gray-300 hover:text-cyan-400 transition-colors">Home</a>
                     <div className="relative" ref={suggestionsRef}>
                        <button onClick={() => setIsSuggestionsOpen(!isSuggestionsOpen)} className="flex items-center gap-1 text-gray-300 hover:text-cyan-400 transition-colors">
                            Suggestions <ChevronDown className={`w-4 h-4 transition-transform ${isSuggestionsOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isSuggestionsOpen && (
                            <div className="absolute top-full mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-10">
                                {suggestions.map(topic => (
                                    <a
                                        key={topic}
                                        href="#"
                                        onClick={(e) => {e.preventDefault(); handleSuggestionClick(topic)}}
                                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400"
                                    >
                                        {topic}
                                    </a>
                                ))}
                            </div>
                        )}
                     </div>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('rewards'); }} className="text-gray-300 hover:text-cyan-400 transition-colors">Rewards</a>
                    <div className="flex items-center gap-2 text-orange-400" title={`${streak} day streak!`}>
                        <Flame className="w-6 h-6" />
                        <span className="font-bold text-lg">{streak}</span>
                    </div>
                    {isLoggedIn ? (
                        <button 
                            onClick={onLogout}
                            className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                               Logout
                            </span>
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIsLoginModalOpen(true)}
                            className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                               Login
                            </span>
                        </button>
                    )}
                </nav>
            </div>
        </header>
        {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onLogin={onLogin} />}
        </>
    );
};
