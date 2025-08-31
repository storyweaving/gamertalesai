import React from 'react';

interface SuggestionBoxProps {
  suggestions: string[];
  isLoading: boolean;
  isSuggesting: boolean;
  onSelect: (suggestion: string) => void;
}

const SuggestionBox: React.FC<SuggestionBoxProps> = ({ suggestions, isLoading, isSuggesting, onSelect }) => {
  const renderBoxContent = (index: number) => {
    if (isSuggesting && suggestions[index]) {
      return (
        <button onClick={() => onSelect(suggestions[index])} className="text-left w-full h-full text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-300">
          {suggestions[index]}
        </button>
      );
    }
    if (isSuggesting) {
      return null; // Don't show any placeholder while loading
    }
    return <span className="text-gray-500 dark:text-gray-500">Waiting for your next move...</span>;
  };

  return (
    <div className="mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map(index => (
          <div
            key={index}
            className={`flex items-center p-2 rounded-lg border h-12 transition-all duration-300 ${
              isSuggesting ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700 shadow-lg' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
            }`}
          >
            <span className={`text-lg font-bold mr-3 ${isSuggesting ? 'text-teal-500' : 'text-gray-400 dark:text-gray-500'}`}>#{index + 1}</span>
            <div className="flex-grow text-sm">{renderBoxContent(index)}</div>
          </div>
        ))}
      </div>

      {isSuggesting && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 h-6 flex items-center justify-center">
            {suggestions.length > 0 ? (
              <span className="hidden md:block">Press <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 dark:text-gray-100 dark:bg-gray-600 dark:border-gray-500 rounded-lg">1</kbd> or <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 dark:text-gray-100 dark:bg-gray-600 dark:border-gray-500 rounded-lg">2</kbd> to select, or <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 dark:text-gray-100 dark:bg-gray-600 dark:border-gray-500 rounded-lg">ESC</kbd> to continue your way.</span>
            ) : null}
        </div>
      )}
    </div>
  );
};

export default SuggestionBox;