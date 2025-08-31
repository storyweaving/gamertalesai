
import React, { forwardRef, useState, useEffect, useLayoutEffect } from 'react';

interface WritingAreaProps {
  content: string;
  onContentChange: (content: string) => void;
  onSelectionChange: (range: Range) => void;
  isLocked: boolean;
  highlightInfo?: { highlightText: string; textBefore: string } | null;
  onHighlightComplete: () => void;
}

const WritingArea = forwardRef<HTMLDivElement, WritingAreaProps>(({ content, onContentChange, onSelectionChange, isLocked, highlightInfo, onHighlightComplete }, ref) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const editorRef = ref as React.RefObject<HTMLDivElement>;

  useEffect(() => {
    if (highlightInfo && onHighlightComplete) {
      const { highlightText } = highlightInfo;

      const CHAR_ANIMATION_DURATION = 400; // ms, from CSS (0.4s)
      const STAGGER_DELAY = 20; // ms, from inline style
      const HOLD_DURATION = 1000; // ms, to hold the final state after the wave completes
      const waveCompletionTime = ((highlightText.length - 1) * STAGGER_DELAY) + CHAR_ANIMATION_DURATION;
      const totalTimeout = waveCompletionTime + HOLD_DURATION;

      const startAnimationTimer = setTimeout(() => setIsAnimating(true), 10);
      const completionTimer = setTimeout(() => onHighlightComplete(), totalTimeout);

      return () => {
        clearTimeout(startAnimationTimer);
        clearTimeout(completionTimer);
        setIsAnimating(false);
      };
    }
  }, [highlightInfo, onHighlightComplete]);
  
  useLayoutEffect(() => {
    const editor = editorRef.current;
    // Only update the DOM if the content prop is different from what's actually in the editor.
    // This prevents React from re-rendering the content on every keystroke, which would reset the cursor.
    if (editor && content !== editor.innerHTML) {
      editor.innerHTML = content;
    }
  }, [content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    onContentChange(newContent);
  };
  
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0).cloneRange();
        const editor = editorRef.current;
        if (editor && editor.contains(range.commonAncestorContainer)) {
            onSelectionChange(range);
        }
    }
  };
  
  const renderHighlightedContent = () => {
    if (!highlightInfo) return null;

    const { highlightText, textBefore } = highlightInfo;

    return (
      <div 
        className="editor-area absolute inset-0 w-full h-full px-4 pt-4 pb-24 text-lg leading-relaxed bg-transparent border-none focus:ring-0 focus:outline-none dark:text-gray-200 text-gray-800 whitespace-pre-wrap"
        aria-hidden="true"
      >
        <span dangerouslySetInnerHTML={{ __html: textBefore }} />
        {textBefore ? ' ' : ''}
        <span className="relative inline-block">
          {highlightText.split('').map((char, index) => (
            <span
              key={index}
              className={`highlight-char ${isAnimating ? 'active' : ''}`}
              style={{ transitionDelay: `${index * 20}ms` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      </div>
    );
  };
  
  const highlightedContent = renderHighlightedContent();

  return (
    <div className="relative flex-grow w-full">
      {highlightedContent}
      <div
        ref={ref}
        onInput={handleInput}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onFocus={saveSelection}
        contentEditable={!(isLocked || !!highlightInfo)}
        suppressContentEditableWarning={true}
        data-placeholder="Start writing your story here..."
        className={`editor-area w-full px-4 pt-4 pb-24 text-lg leading-relaxed bg-transparent border-none rounded-md focus:ring-0 focus:outline-none transition-colors duration-200 whitespace-pre-wrap ${
            isLocked ? 'text-gray-400 dark:text-gray-300' : 'text-gray-800 dark:text-gray-200'
          } ${highlightInfo ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
});

export default WritingArea;