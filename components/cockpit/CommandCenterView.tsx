import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { achievements, getWriterRank, getXpForNextLevel } from '../../services/gamificationService';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const AchievementBadge: React.FC<{ achievement: typeof achievements[0]; isEarned: boolean }> = ({ achievement, isEarned }) => (
    <div className="flex flex-col items-center text-center group" title={achievement.description}>
        <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isEarned ? 'bg-teal-500 border-4 border-teal-300 dark:border-teal-600 shadow-lg' : 'bg-gray-300 dark:bg-gray-600 border-4 border-gray-400'
        }`}>
            {isEarned ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
            )}
        </div>
        <p className={`mt-2 text-xs font-bold ${isEarned ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{achievement.name}</p>
    </div>
);

const CommandCenterView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { gamerProfile, chapters } = state;

    const handleClose = () => {
        dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
    }

    const writerRank = getWriterRank(gamerProfile.xp);
    const xpForNext = getXpForNextLevel(gamerProfile.level);
    const xpForCurrent = writerRank.minXp;
    const progress = xpForNext === Infinity ? 100 : Math.max(0, ((gamerProfile.xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100);

    const totalWords = chapters.reduce((sum, ch) => sum + ch.word_count, 0);
    
    // Daily Quest: Write 200 words
    const today = new Date().toISOString().split('T')[0];
    const wordsToday = (gamerProfile.lastActiveDate?.startsWith(today)) ? totalWords - (gamerProfile.xp - (totalWords - gamerProfile.xp)) : 0; // Simplified
    const dailyQuestProgress = Math.min((totalWords - (gamerProfile.xp > 200 ? gamerProfile.xp - 200 : 0)) / 200 * 100, 100); // Approximate progress

    return (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Command Center</h2>
                <button onClick={handleClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto -mr-6 pr-6 space-y-6">
                {/* Level & XP */}
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="font-bold text-teal-600 dark:text-teal-400">{`LVL ${gamerProfile.level}: ${writerRank.rank}`}</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{gamerProfile.xp} / {xpForNext} XP</p>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-4">
                        <div
                            className="bg-teal-500 h-4 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Core Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard 
                        icon={<span className="text-3xl">💎</span>} 
                        label="Arcane Crystals" 
                        value={gamerProfile.arcaneCrystals}
                        color="bg-sky-200 dark:bg-sky-800"
                    />
                    <StatCard 
                        icon={<span className="text-3xl">🔥</span>} 
                        label="Writing Streak" 
                        value={`${gamerProfile.writingStreak} Days`}
                        color="bg-orange-200 dark:bg-orange-800"
                    />
                    <StatCard 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                        label="Total Words" 
                        value={totalWords}
                        color="bg-gray-200 dark:bg-gray-600"
                    />
                </div>
                
                {/* Daily Quest */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Daily Quest</h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">Write 200 words today</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Reward: 25 💎</p>
                         <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${dailyQuestProgress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Achievements */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Achievements</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-6 gap-x-4">
                        {achievements.map(ach => (
                            <AchievementBadge 
                                key={ach.id} 
                                achievement={ach} 
                                isEarned={gamerProfile.earnedAchievements.includes(ach.id)} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CommandCenterView;
