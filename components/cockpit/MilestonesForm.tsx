
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { GamerProfileData } from '../../types';

const GamerProfileForm: React.FC = () => {
  const { state, dispatch, saveGamerProfile } = useAppContext();
  const [localProfile, setLocalProfile] = useState<GamerProfileData>(state.gamerProfile);

  useEffect(() => {
    setLocalProfile(state.gamerProfile);
  }, [state.gamerProfile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLocalProfile({ ...localProfile, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
  }

  const handleSave = async () => {
    await saveGamerProfile(localProfile);
    // The save function now handles closing the view via the onboarding logic in the context
  };

  return (
    <div className={`p-6 h-full flex flex-col bg-white dark:bg-gray-800 transition-colors duration-300`}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Character Profile</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Define your character and world to personalize the AI's suggestions. All fields are optional.</p>
        <div className="flex-grow flex flex-col min-h-0">
            <form className="space-y-4 overflow-y-auto flex-grow pr-2">
                <div>
                    <label htmlFor="characterName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Character Name</label>
                    <input type="text" name="characterName" id="characterName" value={localProfile.characterName} onChange={handleChange} placeholder="e.g., Kaelen the Shadow" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="characterClass" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Character Class / Role</label>
                    <input type="text" name="characterClass" id="characterClass" value={localProfile.characterClass} onChange={handleChange} placeholder="e.g., Rogue, Starship Captain" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="characterTrait" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Character Trait</label>
                    <input type="text" name="characterTrait" id="characterTrait" value={localProfile.characterTrait} onChange={handleChange} placeholder="e.g., Cunning, Impulsive, Honorable" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="favoriteGenres" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Story Genre</label>
                    <select id="favoriteGenres" name="favoriteGenres" value={localProfile.favoriteGenres} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="">Select Genre...</option>
                        <option>Fantasy</option>
                        <option>Sci-Fi</option>
                        <option>Horror</option>
                        <option>Dystopian</option>
                        <option>Cyberpunk</option>
                        <option>Historical</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="storyTone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Story Tone</label>
                    <select id="storyTone" name="storyTone" value={localProfile.storyTone} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="">Select Tone...</option>
                        <option>Heroic & Epic</option>
                        <option>Gritty & Realistic</option>
                        <option>Humorous & Lighthearted</option>
                        <option>Mysterious & Suspenseful</option>
                        <option>Dark & Brooding</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="gameWorld" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Game World / Setting</label>
                    <input type="text" name="gameWorld" id="gameWorld" value={localProfile.gameWorld} onChange={handleChange} placeholder="e.g., A floating city in the clouds" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
            </form>
            <div className="mt-6 flex-shrink-0">
                <button
                    type="button"
                    onClick={handleSave}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                    Save Profile
                </button>
            </div>
        </div>
    </div>
  );
};

export default GamerProfileForm;