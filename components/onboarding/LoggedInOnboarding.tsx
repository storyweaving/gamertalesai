import React from 'react';

const OnboardingStep: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-teal-500 text-white font-bold text-lg">
            {number}
        </div>
        <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{children}</p>
        </div>
    </div>
);

interface LoggedInOnboardingProps {
    onDismiss: () => void;
}

const LoggedInOnboarding: React.FC<LoggedInOnboardingProps> = ({ onDismiss }) => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg h-full">
            <div className="max-w-2xl mx-auto">
                <svg className="h-16 w-16 text-teal-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to GamerTalesAI!</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Follow these steps to get started on your epic saga.
                </p>

                <div className="space-y-6 text-left">
                    <OnboardingStep number={1} title="Create Your Character">
                        Click the <span className="font-semibold text-teal-600 dark:text-teal-400">'Profile'</span> button in the navigation bar to add key details. This helps the AI provide personalized suggestions. We've opened it for you on the right!
                    </OnboardingStep>
                    <OnboardingStep number={2} title="Name Your Chapter">
                        Click the <span className="font-semibold text-teal-600 dark:text-teal-400">'Chapters'</span> button, then click on your current chapter to give it a meaningful title.
                    </OnboardingStep>
                    <OnboardingStep number={3} title="Start Writing">
                        Once you're ready, click the button below. When you've written about 24 words, we'll offer some creative suggestions to keep your story flowing.
                    </OnboardingStep>
                </div>

                <div className="mt-10">
                    <button
                        onClick={onDismiss}
                        className="w-full max-w-xs flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        aria-label="Start writing your story"
                    >
                        Start Writing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoggedInOnboarding;