
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Chapter } from '../../types';

const ConfirmationModal: React.FC<{
    chapterName: string;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ chapterName, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 id="delete-dialog-title" className="text-lg font-bold text-gray-900 dark:text-white">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to permanently delete "{chapterName}"? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
);


const ChapterList: React.FC = () => {
    const { state, dispatch, addChapter, updateChapterName, deleteChapter } = useAppContext();
    const { chapters, activeChapterId } = state;
    const [expandedChapter, setExpandedChapter] = useState<string | null>(activeChapterId);
    const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
    const debounceTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        setExpandedChapter(activeChapterId);
    }, [activeChapterId]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const handleNameChange = (id: string, newName: string) => {
        // Update local state immediately for responsiveness.
        dispatch({ type: 'UPDATE_CHAPTER_NAME_SUCCESS', payload: { id, name: newName } });
    
        // Clear previous timeout to avoid multiple saves.
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
    
        // Set a new timeout to save to the DB and trigger the onboarding step change.
        debounceTimeoutRef.current = window.setTimeout(() => {
            updateChapterName(id, newName);
        }, 800); // Debounce for 800ms
    };


    const handleSelectChapter = (id: string) => {
        dispatch({ type: 'SET_ACTIVE_CHAPTER', payload: id });
    };

    const handleAddChapter = () => {
        addChapter();
    };

    const handleClose = () => {
        dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
    }

    const handleConfirmDelete = async () => {
        if (chapterToDelete) {
            await deleteChapter(chapterToDelete.id);
            setChapterToDelete(null);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedChapter(expandedChapter === id ? null : id);
    };
    
    const getPlainText = (html: string) => {
        if (!html) return '';
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    };

    return (
        <>
            {chapterToDelete && (
                <ConfirmationModal 
                    chapterName={chapterToDelete.name || `Chapter ${chapters.findIndex(c => c.id === chapterToDelete.id) + 1}`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setChapterToDelete(null)}
                />
            )}
            <div className="p-6 h-full flex flex-col bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chapters</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleAddChapter} className="text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 p-1">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                            </svg>
                        </button>
                        <button onClick={handleClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto -mr-6 pr-6 space-y-3">
                    {chapters.map((chapter, index) => {
                        const plainTextPreview = getPlainText(chapter.content);
                        return (
                            <div
                                key={chapter.id}
                                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${chapter.id === activeChapterId ? 'bg-teal-50 dark:bg-teal-900/40 border-teal-300 dark:border-teal-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <div className="flex items-center justify-between" onClick={() => handleSelectChapter(chapter.id)}>
                                    <div className="flex items-center space-x-3 flex-grow min-w-0">
                                        {chapter.id === activeChapterId && <div className="h-2 w-2 rounded-full bg-teal-500"></div>}
                                        <div className="flex items-baseline font-semibold text-gray-800 dark:text-gray-200 min-w-0">
                                            <span className="mr-2 whitespace-nowrap">Chapter {index + 1}</span>
                                            {chapter.id === activeChapterId ? (
                                                <input
                                                    type="text"
                                                    value={chapter.name}
                                                    onChange={(e) => handleNameChange(chapter.id, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    placeholder="Add title..."
                                                    className="w-full p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-normal focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                                    aria-label="Chapter title"
                                                />
                                            ) : (
                                                <span className="font-normal truncate">{chapter.name}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{chapter.word_count} words</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setChapterToDelete(chapter); }} 
                                            disabled={chapters.length <= 1}
                                            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                            aria-label="Delete chapter"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); toggleExpand(chapter.id); }} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full">
                                             <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${expandedChapter === chapter.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {expandedChapter === chapter.id && (
                                     <p className="mt-2 pl-5 text-sm text-gray-500 dark:text-gray-400 break-words line-clamp-3">
                                        {plainTextPreview.trim() ? plainTextPreview : <span className="italic">This chapter is empty...</span>}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default ChapterList;