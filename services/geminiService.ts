import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GamerProfileData } from '../types';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY is not defined. Please add it to your environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

const TEXT_MODEL_NAME = 'gemini-2.5-flash';
const IMAGE_MODEL_NAME = 'imagen-4.0-generate-001';

const constructPrompt = (currentText: string, gamerProfile: GamerProfileData): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = currentText;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";


    return `You are a master storyteller and game narrative designer. Your role is to assist a gamer in writing a compelling story by providing two distinct, creative continuations for their last sentence. The suggestions should feel like a natural progression of their narrative, fitting their established style, tone, and world.

The user's story so far:
---
${plainText}
---

Key Information about the story's context:
- Character Name: ${gamerProfile.characterName || 'Not provided'}
- Character Class/Role: ${gamerProfile.characterClass || 'Not provided'}
- Character Trait: ${gamerProfile.characterTrait || 'Not provided'}
- Favorite Genres: ${gamerProfile.favoriteGenres || 'Not provided'}
- Desired Story Tone: ${gamerProfile.storyTone || 'Not provided'}
- Game World / Setting: ${gamerProfile.gameWorld || 'Not provided'}

Follow these rules STRICTLY for each suggestion you generate:
1.  **Seamless Continuation:** Each suggestion must flow naturally from the user's VERY LAST sentence. Match their writing style, vocabulary, and pacing. Do not repeat the last few words of the user's text.
2.  **Advance the Narrative:** Your suggestions should move the story forward. Introduce a new action, a sensory detail, an internal thought, or a piece of dialogue that adds depth and encourages the user to keep writing.
3.  **Maintain Consistency:** The suggestions MUST be consistent with all details provided in the story and the key information. If the setting is a "cyberpunk city," don't suggest finding a "magic sword in a forest."
4.  **Embrace the Genre & Tone:** The suggestions must align with the specified genres and story tone. A "Gritty, Dystopian" story needs tense, high-stakes suggestions, while a "Heroic, Fantasy" one can be more adventurous and bold.
5.  **Be Creative & Specific:** Offer tangible, interesting ideas. Instead of a generic "he walked down the street," suggest "he navigated the neon-drenched alley, the rain hissing on the hot pavement." Use details from the key information to personalize the suggestions.
6.  **Offer Distinct Choices:** The two suggestions must present genuinely different paths. One could focus on an internal monologue or emotion, while the other focuses on an external action or environmental interaction.
7.  **Length:** Each suggestion must be between 8 and 10 words.
8.  **Output Format:** Return ONLY a JSON object with a single key "suggestions" containing an array of two unique string suggestions. Do not include any other text, explanation, or markdown formatting.

Example:
User's text ends with: "...the alien artifact pulsed with a faint, otherworldly light."
Gamer Profile: Genre is "Sci-Fi", Tone is "Mysterious".
A valid response would be:
{
  "suggestions": [
    "as a low hum resonated deep within my bones.",
    "revealing strange symbols that shifted just beyond my focus."
  ]
}`;
};


export const getSuggestions = async (currentText: string, gamerProfile: GamerProfileData): Promise<string[]> => {
    try {
        const prompt = constructPrompt(currentText, gamerProfile);

        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                            },
                        },
                    },
                    required: ["suggestions"],
                },
                thinkingConfig: { thinkingBudget: 0 },
            },
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.suggestions && Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
            return parsed.suggestions.slice(0, 2); // Ensure only two are returned
        }
        
        console.warn("AI response did not contain valid suggestions.", parsed);
        return [];
    } catch (error: any) {
        console.error("Error fetching suggestions from Gemini API:", error);
        
        let errorMessage = "AI suggestion service is currently unavailable.";
        if (error.message) {
            errorMessage += ` Details: ${error.message}`;
        }

        // Re-throwing the error so the calling component can handle it (e.g., show a toast).
        throw new Error(errorMessage);
    }
};

const constructShortTalePrompt = (fullStory: string, taleType: 'teaser' | 'mini' | 'summary'): string => {
    let wordCount = '';
    let typeDescription = '';

    switch (taleType) {
        case 'teaser':
            wordCount = '25-50 words';
            typeDescription = 'Teaser Tale: A tiny, exciting glimpse to get them hooked! Perfect for a quick text message.';
            break;
        case 'mini':
            wordCount = '100-150 words';
            typeDescription = 'Mini Tale: A snapshot of the story, introducing the main characters and the beginning of their adventure.';
            break;
        case 'summary':
            wordCount = '250-300 words';
            typeDescription = 'Summary Tale: The core adventure from start to finish, hitting all the key moments and highlights.';
            break;
    }

    return `You are a master marketer for epic stories. Your task is to summarize the following story into a compelling short version to share with friends and family.

**Story:**
---
${fullStory}
---

**Instructions:**
1.  **Summarize the story** into a "${typeDescription}".
2.  **Word Count:** The summary must be approximately ${wordCount}.
3.  **Goal:** The summary should be exciting and make the reader want to know what happens next.
4.  **Format:** Return only the text of the summary. Do not include any titles, headers, or introductory phrases like "Here is the summary:". Just the story summary itself.
`;
};

export const generateShortTale = async (fullStory: string, taleType: 'teaser' | 'mini' | 'summary'): Promise<string> => {
    try {
        const prompt = constructShortTalePrompt(fullStory, taleType);

        const response = await ai.models.generateContent({
            model: TEXT_MODEL_NAME,
            contents: prompt,
        });

        return response.text.trim();
    } catch (error: any) {
        console.error("Error generating Short Tale from Gemini API:", error);
        
        let errorMessage = "AI summarization service is currently unavailable.";
        if (error.message) {
            errorMessage += ` Details: ${error.message}`;
        }
        throw new Error(errorMessage);
    }
};

export const generateGamerCardImage = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                // Return the full data URI for direct use in <img> src
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        // If no image is returned, something went wrong or the model chose not to.
        return null;
    } catch (error: any) {
        console.error("Error generating Gamer Card from Gemini API:", error);
        let errorMessage = "AI Gamer Card service is currently unavailable.";
        if (error.message) {
            errorMessage += ` Details: ${error.message}`;
        }
        throw new Error(errorMessage);
    }
};
