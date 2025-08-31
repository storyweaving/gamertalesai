import React from 'react';

const Step: React.FC<{ number: number; text: string; }> = ({ number, text }) => (
    <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium w-full max-w-md text-left bg-gray-50 dark:bg-gray-700/50">
        <span className="font-bold text-teal-600 dark:text-teal-400">Step #{number}:</span> {text}
    </div>
);

const InitialOnboarding: React.FC = () => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Epic Awaits</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">Follow these steps to forge your legend with GamerTalesAI.</p>
            <div className="space-y-3 w-full max-w-md">
                <Step number={1} text="Sign Up or Login to begin your quest." />
                <Step number={2} text="Create Your Character in the 'Profile' tab." />
                <Step number={3} text="Name your first Chapter to set the scene." />
                <Step number={4} text="Start writing! After 24 words, the AI will offer suggestions to fuel your saga. Choose one or continue your own path." />
            </div>
        </div>
    );
};

export default InitialOnboarding;