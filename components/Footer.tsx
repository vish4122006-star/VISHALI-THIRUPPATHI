import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900/50 border-t border-cyan-500/20">
            <div className="container mx-auto px-6 py-8 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} Learnova. All Rights Reserved.</p>
                <div className="flex justify-center gap-6 mt-4">
                    <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
                    <a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a>
                    <a href="#" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
};