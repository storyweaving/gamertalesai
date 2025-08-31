import React from 'react';

const Step: React.FC<{ number: number; text: string; }> = ({ number, text }) => (
    <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium w-full max-w-md text-left bg-gray-50 dark:bg-gray-700/50">
        <span className="font-bold text-teal-600 dark:text-teal-400">Step #{number}:</span> {text}
    </div>
);

interface PostLoginOnboardingProps {
    step: number;
}

const PostLoginOnboarding: React.FC<PostLoginOnboardingProps> = ({ step }) => {
    const step4Text = "Begin writing your saga. The progress bar below tracks your words. When you reach 24, press '1' or '2' to add an AI suggestion to your story. The choice is yours, hero.";

    // For step 3, we only show the final instruction, as the real WritingArea will be visible.
    if (step === 3) {
        return (
            <div className="flex flex-col items-center justify-start py-4 space-y-2">
                <Step number={3} text={step4Text} />
            </div>
        );
    }

    // For steps 1 and 2, show the placeholder text and relevant instructions.
    return (
        <div className="flex-grow flex flex-col items-center justify-start pt-8 space-y-3 p-4">
            <p className="text-gray-500 dark:text-gray-500 mb-4">Your story begins here...</p>
            {step === 1 && (
                <>
                    <Step number={1} text="Open the 'Profile' tab in the navbar to build your character." />
                    <Step number={2} text="Next, use the 'Chapters' tab to give your first chapter a title." />
                    <Step number={3} text={step4Text} />
                </>
            )}
            {step === 2 && (
                <>
                    <Step number={2} text="Give your first chapter a title using the input field above." />
                    <Step number={3} text={step4Text} />
                </>
            )}
        </div>
    );
};

export default PostLoginOnboarding;