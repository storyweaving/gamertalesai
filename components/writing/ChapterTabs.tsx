

import React, { useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const ChapterTabs: React.FC = () => {
  const { state, dispatch, addChapter, updateChapterName } = useAppContext();
  const { chapters, activeChapterId } = state;
  const activeChapter = chapters.find(ch => ch.id === activeChapterId);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectChapter = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_CHAPTER', payload: id });
  };

  const handleAddChapter = () => {
    addChapter();
  };

  const handleNameChange = (newName: string) => {
    if (!activeChapter) return;
    
    // Update local state immediately for responsiveness.
    dispatch({ type: 'UPDATE_CHAPTER_NAME_SUCCESS', payload: { id: activeChapter.id, name: newName } });

    // Clear previous timeout to avoid multiple saves.
    if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout to save to the DB and trigger onboarding step change if applicable.
    debounceTimeoutRef.current = window.setTimeout(() => {
        updateChapterName(activeChapter.id, newName);
    }, 800); // Debounce for 800ms
  };


  return (
    <div className="flex-shrink-0 hidden sm:flex">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Chapters:</span>
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              onClick={() => handleSelectChapter(chapter.id)}
              className={`flex items-center justify-center w-6 h-6 font-medium text-sm rounded-md transition-colors duration-200 ${
                chapter.id === activeChapterId
                  ? 'bg-teal-500 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
              aria-current={chapter.id === activeChapterId ? 'page' : undefined}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={handleAddChapter}
            className="flex items-center justify-center w-6 h-6 rounded-md border-2 border-dashed border-gray-400 text-gray-500 hover:border-teal-500 hover:text-teal-500 dark:border-gray-600 dark:hover:border-teal-400 dark:hover:text-teal-400 transition-colors duration-200"
            aria-label="Add new chapter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
          </button>
        </div>
        <div className="flex-grow">
          <input
            type="text"
            value={activeChapter?.name || ''}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter chapter title..."
            className="w-full h-8 px-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-gray-900 dark:text-gray-200"
            aria-label="Chapter title"
          />
        </div>
      </div>
    </div>
  );
};

export default ChapterTabs;
