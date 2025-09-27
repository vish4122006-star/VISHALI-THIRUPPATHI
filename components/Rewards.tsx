
import React from 'react';
import { Trophy, Flame, GraduationCap, BookOpen } from './icons';

const RewardCard: React.FC<{ icon: React.ReactNode; title: string; description: string; achieved: boolean }> = ({ icon, title, description, achieved }) => (
    <div className={`border rounded-lg p-6 flex flex-col items-center text-center transition-all duration-300 ${achieved ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20' : 'border-gray-700 bg-gray-800/50'}`}>
        <div className={`mb-4 ${achieved ? 'text-cyan-400' : 'text-gray-500'}`}>{icon}</div>
        <h3 className={`text-xl font-bold ${achieved ? 'text-white' : 'text-gray-400'}`}>{title}</h3>
        <p className={`${achieved ? 'text-gray-300' : 'text-gray-500'} mt-2`}>{description}</p>
    </div>
);


export const Rewards: React.FC = () => {
    const rewards = [
        { icon: <GraduationCap className="w-12 h-12" />, title: 'First Course', description: 'Generate your very first course.', achieved: true },
        { icon: <Flame className="w-12 h-12" />, title: '7-Day Streak', description: 'Maintain a learning streak for a week.', achieved: true },
        { icon: <BookOpen className="w-12 h-12" />, title: 'Course Connoisseur', description: 'Generate 10 unique courses.', achieved: false },
        { icon: <Trophy className="w-12 h-12" />, title: 'Master Creator', description: 'Generate 50 courses.', achieved: false },
    ];
    
    return (
        <div className="container mx-auto px-6 py-12 text-white">
            <h1 className="text-5xl font-bold text-center mb-4" style={{ textShadow: '0 0 10px #06b6d4' }}>
                Your Rewards
            </h1>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
                Stay consistent, keep creating, and unlock achievements to celebrate your journey as a course creator.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {rewards.map(reward => <RewardCard key={reward.title} {...reward} />)}
            </div>
        </div>
    );
}
