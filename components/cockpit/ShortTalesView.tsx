
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateShortTale } from '../../services/geminiService';
import { ToastType } from '../../types';

type TaleType = 'teaser' | 'mini' | 'summary' | 'full';

const RadioOption: React.FC<{
    id: TaleType;
    label: string;
    description: string;
    checked: boolean;
    onChange: (id: TaleType) => void;
}> = ({ id, label, description, checked, onChange }) => (
    <label htmlFor={id} className="flex p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 has-[:checked]:bg-teal-50 has-[:checked]:dark:bg-teal-900/40 has-[:checked]:border-teal-300 has-[:checked]:dark:border-teal-700">
        <input
            type="radio"
            name="taleType"
            id={id}
            checked={checked}
            onChange={() => onChange(id)}
            className="h-4 w-4 mt-1 text-teal-600 border-gray-300 focus:ring-teal-500"
        />
        <div className="ml-3 text-sm">
            <span className="font-medium text-gray-900 dark:text-white">{label}</span>
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </label>
);

const ShortTalesView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { chapters } = state;
    const [selectedTaleType, setSelectedTaleType] = useState<TaleType>('teaser');
    const [generatedTale, setGeneratedTale] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleBack = () => {
        dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'menu' });
    };

    const getFullStoryText = () => {
        const tempDiv = document.createElement('div');
        return chapters
            .map((ch, index) => {
                const title = ch.name ? `Chapter ${index + 1}: ${ch.name}` : `Chapter ${index + 1}`;
                tempDiv.innerHTML = ch.content;
                const chapterText = tempDiv.textContent || tempDiv.innerText || '';
                return `${title}\n\n${chapterText}`;
            })
            .join('\n\n---\n\n');
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedTale('');
        
        const fullStory = getFullStoryText();
        if (!fullStory.trim()) {
            dispatch({ type: 'ADD_TOAST', payload: { message: "Your story is empty! Write something first.", type: ToastType.Error } });
            setIsLoading(false);
            return;
        }

        try {
            if (selectedTaleType === 'full') {
                setGeneratedTale(fullStory);
            } else {
                const tale = await generateShortTale(fullStory, selectedTaleType);
                setGeneratedTale(tale);
            }
        } catch (error: any) {
            dispatch({ type: 'ADD_TOAST', payload: { message: error.message, type: ToastType.Error } });
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = (method: 'email' | 'text') => {
        const subject = "A story from GamerTalesAI!";
        const body = `Check out this story I'm writing:\n\n${generatedTale}`;
        if (method === 'email') {
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(gmailUrl, '_blank', 'noopener,noreferrer');
        } else {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                // Corrected sms link for mobile devices
                window.location.href = `sms:?body=${encodeURIComponent(body)}`;
            } else {
                // Fallback for desktop: copy to clipboard and inform user
                navigator.clipboard.writeText(body).then(() => {
                    dispatch({
                        type: 'ADD_TOAST',
                        payload: {
                            message: "On desktop, we've copied the tale to your clipboard. You can paste it in your messaging app!",
                            type: ToastType.Info,
                        },
                    });
                }).catch(err => {
                    dispatch({
                        type: 'ADD_TOAST',
                        payload: { message: 'Could not copy tale to clipboard.', type: ToastType.Error },
                    });
                    console.error('Failed to copy: ', err);
                });
            }
        }
    };

    return (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <button onClick={handleBack} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Share Short Tale</h2>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto -mr-6 pr-6 space-y-4">
                {!generatedTale && !isLoading && (
                    <fieldset className="space-y-4">
                        <legend className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Choose a format to share with family & friends:</legend>
                        <RadioOption id="teaser" label="Teaser Tale (approx. 25-50 words)" description="A tiny, exciting glimpse to get them hooked! Perfect for a quick text message." checked={selectedTaleType === 'teaser'} onChange={setSelectedTaleType} />
                        <RadioOption id="mini" label="Mini Tale (approx. 100-150 words)" description="A snapshot of the story, introducing the main characters and the beginning of their adventure." checked={selectedTaleType === 'mini'} onChange={setSelectedTaleType} />
                        <RadioOption id="summary" label="Summary Tale (approx. 250-300 words)" description="The core adventure from start to finish, hitting all the key moments and highlights." checked={selectedTaleType === 'summary'} onChange={setSelectedTaleType} />
                        <RadioOption id="full" label="The Full Tale" description="The complete, original story in all its glory." checked={selectedTaleType === 'full'} onChange={setSelectedTaleType} />
                    </fieldset>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <svg className="animate-spin h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Forging your tale...</p>
                    </div>
                )}
                
                {generatedTale && !isLoading && (
                    <div>
                        <textarea
                            readOnly
                            value={generatedTale}
                            className="w-full h-64 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                            aria-label="Generated Tale"
                        />
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button onClick={() => handleShare('email')} className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                <span>Email</span>
                            </button>
                             <button onClick={() => handleShare('text')} className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
                                <span>Text</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {!generatedTale && (
                 <div className="mt-6 flex-shrink-0">
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                        {isLoading ? 'Generating...' : 'Generate Tale'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShortTalesView;
