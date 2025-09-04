import React, { forwardRef, useState, useEffect, useLayoutEffect, useRef } from 'react';

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
  const [selectedImage, setSelectedImage] = useState<HTMLElement | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);
  const editorRef = ref as React.RefObject<HTMLDivElement>;
  const toolbarRef = useRef<HTMLDivElement>(null);


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
    if (editor && content !== editor.innerHTML) {
      editor.innerHTML = content;
    }
  }, [content]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Cleanup previous selection
    editor.querySelectorAll('.story-image-container.selected').forEach(el => {
        el.classList.remove('selected');
    });

    if (selectedImage && !isLocked) {
        selectedImage.classList.add('selected');
        const editorRect = editor.getBoundingClientRect();
        const imageRect = selectedImage.getBoundingClientRect();
        // Position toolbar above the image
        setToolbarPosition({
            top: imageRect.top - editorRect.top + editor.scrollTop - 45, // 45px offset for toolbar height + margin
            left: imageRect.left - editorRect.left
        });
    } else {
        setToolbarPosition(null);
    }
  }, [selectedImage, editorRef, isLocked]);

  useEffect(() => {
    if (isLocked && selectedImage) {
        setSelectedImage(null);
    }
  }, [isLocked, selectedImage]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onContentChange(e.currentTarget.innerHTML);
    setSelectedImage(null); // Deselect image on typing
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

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const imageContainer = target.closest<HTMLElement>('.story-image-container');

    setSelectedImage(imageContainer);
  };
  
  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage) {
        const img = selectedImage.querySelector('img');
        if (img) {
            let currentRotation = parseInt(img.dataset.rotation || '0', 10);
            currentRotation = (currentRotation + 90) % 360;
            img.dataset.rotation = String(currentRotation);
            img.style.transform = `rotate(${currentRotation}deg)`;
            onContentChange(editorRef.current!.innerHTML);
        }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedImage) {
          selectedImage.remove();
          onContentChange(editorRef.current!.innerHTML);
          setSelectedImage(null);
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
      {selectedImage && !isLocked && toolbarPosition && (
        <div
            ref={toolbarRef}
            className="image-toolbar"
            style={{ top: `${toolbarPosition.top}px`, left: `${toolbarPosition.left}px` }}
            contentEditable={false}
        >
            <button onClick={handleRotate} title="Rotate 90°">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                </svg>
            </button>
            <button onClick={handleDelete} title="Delete Image">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 00-2.09 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
            </button>
        </div>
      )}
      <div
        ref={ref}
        onInput={handleInput}
        onClick={handleEditorClick}
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
