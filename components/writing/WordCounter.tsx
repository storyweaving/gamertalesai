import React from 'react';

interface WordCounterProps {
  currentCount: number;
  triggerCount: number;
  isTriggered: boolean;
  showText?: boolean;
}

const WordCounter: React.FC<WordCounterProps> = ({ currentCount, triggerCount, isTriggered, showText = true }) => {
  const progress = Math.min((currentCount / triggerCount) * 100, 100);

  const getProgressColor = () => {
    if (currentCount >= triggerCount - 4) { // Nearing suggestion
      return 'bg-yellow-400';
    }
    return 'bg-teal-500'; // Writing
  };

  const colorClass = getProgressColor();

  return (
    <div className={showText ? "space-y-2" : ""}>
      {showText && (
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-600 dark:text-gray-400">
              AI Prompt Progress: <span className="font-bold text-teal-600 dark:text-teal-300">{currentCount}</span> / {triggerCount}
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold text-teal-800 bg-teal-100 dark:text-teal-200 dark:bg-teal-800 rounded-full">
                saved
            </span>
          </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-[8px]">
        <div
          className={`h-[8px] rounded-full transition-all duration-300 ease-out ${colorClass}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default WordCounter;