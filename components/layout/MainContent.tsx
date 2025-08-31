
import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import WritingArea from '../writing/WritingArea';
import SuggestionBox from '../writing/SuggestionBox';
import WordCounter from '../writing/WordCounter';
import ChapterTabs from '../writing/ChapterTabs';
import { getSuggestions } from '../../services/geminiService';
import { SUGGESTION_WORD_TRIGGER } from '../../constants';
import InitialOnboarding from '../onboarding/InitialOnboarding';
import PostLoginOnboarding from '../onboarding/PostLoginOnboarding';
import { ToastType } from '../../types';

const MobileSelectionButtons: React.FC<{ onSelect: (suggestion: string) => void; suggestions: string[] }> = ({ onSelect, suggestions }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 md:hidden z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
        <div className="grid grid-cols-2 gap-4">
            <button
                onClick={() => onSelect(suggestions[0])}
                className="bg-teal-500 text-white font-bold py-4 px-6 rounded-lg text-2xl shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-transform active:scale-95"
                aria-label="Select first suggestion"
            >
                #1
            </button>
            <button
                onClick={() => onSelect(suggestions[1])}
                className="bg-teal-500 text-white font-bold py-4 px-6 rounded-lg text-2xl shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-transform active:scale-95"
                aria-label="Select second suggestion"
            >
                #2
            </button>
        </div>
    </div>
);

const AIPet: React.FC<{ isVisible: boolean }> = ({ isVisible }) => (
    <button
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center text-teal-600 dark:text-teal-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-teal-700 dark:hover:text-teal-200 transition-all duration-300 ease-in-out z-30 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="AI Pet Companion"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.89 1.45l.28 1.11.9.34a2 2 0 002.52 0l.9-.34.28-1.11a2 2 0 013.24 0l.28 1.11.9.34a2 2 0 002.52 0l.9-.34.28-1.11a2 2 0 013.24 0l.28 1.11.9.34a2 2 0 002.52 0l.9-.34.28-1.11 M12.89 1.45l-.28 1.11-.9.34a2 2 0 01-2.52 0l-.9-.34-.28-1.11a2 2 0 00-3.24 0l-.28 1.11-.9.34a2 2 0 01-2.52 0l-.9-.34L.89 1.45a2 2 0 00-3.24 0l-.28 1.11-.9.34a2 2 0 01-2.52 0l-.9-.34-.28-1.11"/>
            <path d="M22 22s-2-2-4-2-4 2-4 2-4-2-4-2-4 2-4 2V6s2-2 4-2 4 2 4 2 4-2 4 2 4 2 4 2z"/>
            <path d="M18 10l-4 4-4-4"/>
            <path d="M14 10l-4-4"/>
        </svg>
    </button>
);


const MainContent: React.FC = () => {
    const { state, dispatch, updateChapterContent } = useAppContext();
    const { chapters, activeChapterId, gamerProfile, session, onboardingStep } = state;
    const activeChapter = chapters.find(ch => ch.id === activeChapterId);

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cycleWordCount, setCycleWordCount] = useState(0);
    const [highlightInfo, setHighlightInfo] = useState<{ highlightText: string; textBefore: string } | null>(null);
    const [isPetVisible, setIsPetVisible] = useState(true);

    const lastTriggeredContentRef = useRef<string>('');
    const contentAtCycleStartRef = useRef<string>('');
    const editorRef = useRef<HTMLDivElement>(null);
    const prevHighlightInfoRef = useRef(highlightInfo);
    const suggestionTriggerTimeoutRef = useRef<number | null>(null);
    const debouncedSaveRef = useRef<number | null>(null);

    const scrollableContainerRef = useRef<HTMLDivElement>(null);
    const lastScrollTop = useRef(0);
    const shouldAutoScroll = useRef(true);

    const isLoggedIn = !!session;

    useEffect(() => {
        const container = scrollableContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;

            // Pet visibility logic
            if (scrollTop > lastScrollTop.current && scrollTop > 50) { // Scrolling down
                setIsPetVisible(false);
            } else { // Scrolling up
                setIsPetVisible(true);
            }
            lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
            
            // Auto-scroll lock logic. If the user is close to the bottom, re-enable auto-scroll.
            // Otherwise, disable it because they've manually scrolled up.
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 40;
            shouldAutoScroll.current = isNearBottom;
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-scroll on content change, if enabled
    useLayoutEffect(() => {
        const container = scrollableContainerRef.current;
        if (container && shouldAutoScroll.current) {
            container.scrollTop = container.scrollHeight;
        }
    }, [activeChapter?.content]);

    // Force scroll to bottom and re-enable auto-scroll on chapter change
    useLayoutEffect(() => {
        const container = scrollableContainerRef.current;
        if (container) {
            shouldAutoScroll.current = true;
            container.scrollTop = container.scrollHeight;
        }
    }, [activeChapterId]);

    const handleTextChange = useCallback((newContent: string) => {
        if (!activeChapter) return;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newContent;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        const word_count = textContent.trim().split(/\s+/).filter(Boolean).length;

        dispatch({ type: 'UPDATE_CHAPTER_CONTENT', payload: { id: activeChapter.id, content: newContent, word_count } });
        
        if (debouncedSaveRef.current) {
            clearTimeout(debouncedSaveRef.current);
        }

        debouncedSaveRef.current = window.setTimeout(() => {
            updateChapterContent(activeChapter.id, newContent);
        }, 1000);
    }, [activeChapter, dispatch, updateChapterContent]);
    
    useEffect(() => {
        if (state.imageToInsert && editorRef.current) {
            const editor = editorRef.current;
            const selection = window.getSelection();

            if (!selection) return;

            const range = state.lastSelection;
            if (range && editor.contains(range.commonAncestorContainer)) {
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                editor.focus();
                const endRange = document.createRange();
                endRange.selectNodeContents(editor);
                endRange.collapse(false);
                selection.removeAllRanges();
                selection.addRange(endRange);
            }
            
            const figure = document.createElement('figure');
            figure.className = 'story-image-container';
            figure.setAttribute('contenteditable', 'false');

            const img = document.createElement('img');
            img.src = state.imageToInsert;
            img.className = 'story-image';
            
            figure.appendChild(img);

            if (selection.rangeCount > 0) {
                const currentRange = selection.getRangeAt(0);
                currentRange.deleteContents();
                currentRange.insertNode(figure);

                const newRange = document.createRange();
                newRange.setStartAfter(figure);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } else {
                editor.appendChild(figure);
            }
            
            handleTextChange(editor.innerHTML);
            dispatch({ type: 'IMAGE_INSERTION_COMPLETE' });
        }
    }, [state.imageToInsert, state.lastSelection, handleTextChange, dispatch]);


    useEffect(() => {
        if (prevHighlightInfoRef.current && !highlightInfo) {
            if (editorRef.current) {
                editorRef.current.focus({ preventScroll: true });
                
                const selection = window.getSelection();
                if (selection) {
                  const range = document.createRange();
                  range.selectNodeContents(editorRef.current);
                  range.collapse(false);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
            }
        }
        prevHighlightInfoRef.current = highlightInfo;
    }, [highlightInfo]);

    useEffect(() => {
        if (activeChapter) {
            const initialContent = activeChapter.content || '';
            contentAtCycleStartRef.current = initialContent;
            lastTriggeredContentRef.current = initialContent;
        }
    }, [activeChapter?.id]);
    
    const resetSuggestionState = useCallback(() => {
        setIsSuggesting(false);
        setSuggestions([]);
        setCycleWordCount(0);
    }, []);

    const triggerSuggestions = useCallback(async () => {
        if (!activeChapter || isSuggesting || isLoading) return;
        
        editorRef.current?.blur();

        setIsSuggesting(true);
        setIsLoading(true);

        lastTriggeredContentRef.current = activeChapter.content;

        try {
            const fetchedSuggestions = await getSuggestions(activeChapter.content, gamerProfile);
            setSuggestions(fetchedSuggestions);
        } catch (error: any) {
            console.error("Error getting AI suggestions:", error);
            const message = error?.message || "Failed to get suggestions from AI.";
            dispatch({ type: 'ADD_TOAST', payload: { message, type: ToastType.Error } });
            resetSuggestionState();
        } finally {
            setIsLoading(false);
        }
    }, [activeChapter, isSuggesting, isLoading, gamerProfile, dispatch, resetSuggestionState]);

    useEffect(() => {
        if (suggestionTriggerTimeoutRef.current) {
            clearTimeout(suggestionTriggerTimeoutRef.current);
        }

        if (!activeChapter) {
            setCycleWordCount(0);
            return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = activeChapter.content;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        const words = textContent.trim().split(/\s+/).filter(Boolean);

        const lastTempDiv = document.createElement('div');
        lastTempDiv.innerHTML = lastTriggeredContentRef.current;
        const lastTextContent = lastTempDiv.textContent || lastTempDiv.innerText || "";
        const lastTriggeredWords = lastTextContent.trim().split(/\s+/).filter(Boolean);
        
        let currentCycleCount = words.length - lastTriggeredWords.length;
        if(words.length === 0) {
            currentCycleCount = 0;
            lastTriggeredContentRef.current = '';
            contentAtCycleStartRef.current = '';
        }
        
        const newCycleCount = currentCycleCount < 0 ? 0 : currentCycleCount;
        setCycleWordCount(newCycleCount);

        if (newCycleCount >= SUGGESTION_WORD_TRIGGER && !isSuggesting) {
            suggestionTriggerTimeoutRef.current = window.setTimeout(() => {
                triggerSuggestions();
            }, 750);
        }

        return () => {
            if (suggestionTriggerTimeoutRef.current) {
                clearTimeout(suggestionTriggerTimeoutRef.current);
            }
        };
    }, [activeChapter?.content, triggerSuggestions, isSuggesting, dispatch]);

    const handleSuggestionSelect = useCallback((suggestion: string) => {
        if (!activeChapter) return;
    
        const textBeforeCycle = contentAtCycleStartRef.current;
        const currentText = activeChapter.content;
    
        const userTypedHtml = currentText.substring(textBeforeCycle.length);
    
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = userTypedHtml;
        const userTypedPlainText = (tempDiv.textContent || tempDiv.innerText || "").trim();
        
        const textToHighlight = userTypedPlainText ? `${userTypedPlainText} ${suggestion}` : suggestion;
    
        const newFullContent = currentText + ' ' + suggestion;
        
        handleTextChange(newFullContent + ' ');
    
        setHighlightInfo({ highlightText: textToHighlight, textBefore: textBeforeCycle });
        
        lastTriggeredContentRef.current = newFullContent;
        contentAtCycleStartRef.current = newFullContent;
        
        resetSuggestionState();
    }, [activeChapter, handleTextChange, resetSuggestionState]);

    const handleHighlightComplete = useCallback(() => {
        setHighlightInfo(null);
    }, []);
    
    const handleSkipSuggestion = useCallback(() => {
        if (!activeChapter) return;
        lastTriggeredContentRef.current = activeChapter.content;
        contentAtCycleStartRef.current = activeChapter.content;
        resetSuggestionState();
        editorRef.current?.focus({ preventScroll: true });
    }, [activeChapter, resetSuggestionState]);

    const handleSelectionChange = useCallback((range: Range) => {
        dispatch({ type: 'SET_LAST_SELECTION', payload: range });
    }, [dispatch]);
    
    useEffect(() => {
        if (!isSuggesting) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '1' && suggestions[0]) {
                e.preventDefault();
                handleSuggestionSelect(suggestions[0]);
            } else if (e.key === '2' && suggestions[1]) {
                e.preventDefault();
                handleSuggestionSelect(suggestions[1]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                handleSkipSuggestion();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSuggesting, suggestions, handleSuggestionSelect, handleSkipSuggestion]);

    const renderOnboardingOrWritingArea = () => {
        if (!isLoggedIn) {
            return <InitialOnboarding />;
        }
        if (onboardingStep > 0 && onboardingStep < 3) {
            return <PostLoginOnboarding step={onboardingStep} />;
        }
        return (
             <>
                <WritingArea
                    ref={editorRef}
                    content={activeChapter?.content || ''}
                    onContentChange={handleTextChange}
                    onSelectionChange={handleSelectionChange}
                    isLocked={isSuggesting}
                    highlightInfo={highlightInfo}
                    onHighlightComplete={handleHighlightComplete}
                />
                {onboardingStep === 3 && <PostLoginOnboarding step={3} />}
            </>
        );
    }

    return (
        <div className={`flex-grow flex flex-col bg-white dark:bg-gray-800 mt-0 md:mt-2 mx-0 md:mx-4 mb-0 md:mb-4 rounded-none md:rounded-lg shadow-inner min-h-0 overflow-hidden`}>
            {/* --- TOP FIXED SECTION --- */}
            <div className="flex-shrink-0 pt-[3px] md:pt-[5px] px-4 md:px-6 lg:px-8">
                <ChapterTabs />
                <div className="md:mt-2 flex-shrink-0">
                    <WordCounter 
                        currentCount={cycleWordCount} 
                        triggerCount={SUGGESTION_WORD_TRIGGER} 
                        isTriggered={isSuggesting} 
                        showText={false} 
                    />
                </div>
            </div>
            
            {/* --- SCROLLABLE MIDDLE SECTION --- */}
            <div ref={scrollableContainerRef} 
                 className="flex-grow flex flex-col relative min-h-0 overflow-y-auto"
                 >
                {renderOnboardingOrWritingArea()}
            </div>
            
            {/* --- BOTTOM FIXED SECTION --- */}
            <div
                className="flex-shrink-0 px-4 pt-2 pb-4 md:px-6 md:pb-6 lg:px-8 lg:pb-8"
            >
                <WordCounter 
                    currentCount={cycleWordCount} 
                    triggerCount={SUGGESTION_WORD_TRIGGER} 
                    isTriggered={isSuggesting} 
                />
                <SuggestionBox 
                    suggestions={suggestions} 
                    isLoading={isLoading}
                    isSuggesting={isSuggesting}
                    onSelect={handleSuggestionSelect} 
                />
            </div>

             {isSuggesting && !isLoading && suggestions.length > 0 && (
                <MobileSelectionButtons
                    suggestions={suggestions}
                    onSelect={handleSuggestionSelect}
                />
            )}
             <AIPet isVisible={isPetVisible} />
        </div>
    );
};

export default MainContent;
