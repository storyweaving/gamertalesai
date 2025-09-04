import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateGamerCardImage } from '../../services/geminiService';
import { ToastType } from '../../types';

const options = {
    artStyles: ["Realistic", "Animated - Anime", "Animated - Cartoon", "Animated - Pixel Art", "Animated - 3D Render"],
    archetypes: ["The Strategist", "The Sharpshooter", "The Brawler", "The Support", "The Speedster"],
    genres: ["Fantasy", "Sci-Fi", "Cyberpunk", "Post-Apocalyptic", "Modern Military"],
    headwear: ["None", "Gaming Headset", "Tactical Helmet", "Hood", "Crown", "Beanie"],
    eyewear: ["None", "VR Goggles", "Sunglasses", "Cybernetic Eye", "Scar", "Face Paint"],
    palettes: ["Red & Black", "Blue & White", "Green & Brown", "Purple & Gold", "Neon Pink & Cyan"],
    settings: ["Competitive esports arena", "High-tech streaming setup", "Posed victoriously over a defeated boss", "Futuristic command chair", "Gamer-themed room"],
    strengths: ["Strength", "Perception", "Endurance", "Charisma", "Intelligence", "Agility", "Luck"],
    mentalities: ["The Tactician", "The Maverick", "The Leader", "The Grinder", "The Natural"]
};

const OptionSelect: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; }> = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <select value={value} onChange={onChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const GamerCardView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [uploadedImage, setUploadedImage] = useState<{ file: File, preview: string } | null>(null);
    const [artStyle, setArtStyle] = useState(options.artStyles[0]);
    const [archetype, setArchetype] = useState(options.archetypes[0]);
    const [genre, setGenre] = useState(options.genres[0]);
    const [headwear, setHeadwear] = useState(options.headwear[0]);
    const [eyewear, setEyewear] = useState(options.eyewear[0]);
    const [palette, setPalette] = useState(options.palettes[0]);
    const [signatureItem, setSignatureItem] = useState('');
    const [setting, setSetting] = useState(options.settings[0]);
    const [coreStrengths, setCoreStrengths] = useState<string[]>([]);
    const [mentality, setMentality] = useState(options.mentalities[0]);

    const [isLoading, setIsLoading] = useState(false);
    const [generatedCard, setGeneratedCard] = useState<{ frontImage: string; stats: Record<string, number>; mentality: string; name: string; archetype: string; } | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBack = () => dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'menu' });
    const handleStartOver = () => {
        setGeneratedCard(null);
        setIsFlipped(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                dispatch({ type: 'ADD_TOAST', payload: { message: 'Please select an image file.', type: ToastType.Error } });
                return;
            }
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                dispatch({ type: 'ADD_TOAST', payload: { message: 'Image size cannot exceed 4MB.', type: ToastType.Error } });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setUploadedImage({ file, preview: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const handleStrengthChange = (strength: string) => {
        setCoreStrengths(prev => {
            if (prev.includes(strength)) {
                return prev.filter(s => s !== strength);
            }
            return prev.length < 3 ? [...prev, strength] : prev;
        });
    };

    const handleGenerate = async () => {
        if (!uploadedImage) {
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Please upload an image first.', type: ToastType.Error } });
            return;
        }
        if (!state.gamerProfile.characterName) {
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Please set a character name in your profile first.', type: ToastType.Info } });
            dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'profile' });
            return;
        }
        setIsLoading(true);

        const prompt = `Transform the person in the provided image. They are a '${archetype}' in a '${genre}' world. The desired art style is '${artStyle}'.
Key visual elements include: Headwear: ${headwear}. Eyewear: ${eyewear}.
The scene's primary color palette should be '${palette}'.
${signatureItem ? `Their signature item is a '${signatureItem}'.` : ''}
The setting is: '${setting}'.
Maintain the original person's likeness as much as possible while applying these transformations. The final image should be a dramatic, high-quality portrait suitable for a trading card. Do not include any text on the image.`;

        const base64Data = uploadedImage.preview.split(',')[1];
        const mimeType = uploadedImage.file.type;

        try {
            const generatedImage = await generateGamerCardImage(base64Data, mimeType, prompt);
            if (generatedImage) {
                const stats: Record<string, number> = {};
                options.strengths.forEach(s => {
                    const isCore = coreStrengths.includes(s);
                    stats[s] = isCore ? Math.floor(Math.random() * 3) + 8 : Math.floor(Math.random() * 5) + 3;
                });
                setGeneratedCard({
                    frontImage: generatedImage,
                    stats,
                    mentality,
                    name: state.gamerProfile.characterName,
                    archetype,
                });
            } else {
                throw new Error("The AI did not return an image. Please try again.");
            }
        } catch (error: any) {
            dispatch({ type: 'ADD_TOAST', payload: { message: error.message, type: ToastType.Error } });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <button onClick={generatedCard ? handleStartOver : handleBack} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Build Your Gamer Card</h2>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto -mr-6 pr-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <svg className="animate-spin h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Generating your Gamer Card...</p>
                        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">This can take a moment.</p>
                    </div>
                ) : generatedCard ? (
                    <div className="flex flex-col items-center justify-center h-full py-4">
                        <div className={`gamer-card w-full max-w-xs aspect-[3/4] ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                            <div className="gamer-card-inner">
                                <div className="gamer-card-front bg-gray-900 shadow-lg">
                                    <img src={generatedCard.frontImage} alt="Generated Gamer Card" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                        <h3 className="text-white text-2xl font-bold drop-shadow-lg">{generatedCard.name}</h3>
                                        <p className="text-teal-300 font-semibold drop-shadow-lg">{generatedCard.archetype}</p>
                                    </div>
                                </div>
                                <div className="gamer-card-back bg-gray-800 shadow-lg p-4 text-white flex flex-col">
                                    <h4 className="text-center font-bold text-lg border-b-2 border-teal-500 pb-2 mb-3">STATS</h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm flex-grow">
                                        {Object.entries(generatedCard.stats).map(([key, value]) => (
                                            <div key={key} className="flex justify-between"><span>{key.slice(0, 3).toUpperCase()}</span> <span className="font-bold">{value}</span></div>
                                        ))}
                                    </div>
                                    <div className="mt-auto pt-2 border-t border-gray-600">
                                        <p className="text-center font-semibold text-teal-400 text-sm">{generatedCard.mentality}</p>
                                        <p className="text-center text-xs text-gray-400 italic">"{options.mentalities.find(m => m === generatedCard.mentality) ? { "The Tactician": "Sees ten moves ahead.", "The Maverick": "Plays by their own rules.", "The Leader": "Inspires their squad to victory.", "The Grinder": "Outworks the competition.", "The Natural": "Pure, instinctual talent." }[generatedCard.mentality] : ''}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Click card to flip.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            {uploadedImage ? (
                                <img src={uploadedImage.preview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-md mb-2" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            )}
                            <button onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">{uploadedImage ? "Change Image" : "Upload Your Photo"}</button>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 4MB</p>
                        </div>

                        <OptionSelect label="Art Style" value={artStyle} onChange={e => setArtStyle(e.target.value)} options={options.artStyles} />
                        <OptionSelect label="Gamer Archetype" value={archetype} onChange={e => setArchetype(e.target.value)} options={options.archetypes} />
                        <OptionSelect label="Primary Game Genre" value={genre} onChange={e => setGenre(e.target.value)} options={options.genres} />

                        <div className="grid grid-cols-2 gap-4">
                           <OptionSelect label="Headwear" value={headwear} onChange={e => setHeadwear(e.target.value)} options={options.headwear} />
                           <OptionSelect label="Eyewear" value={eyewear} onChange={e => setEyewear(e.target.value)} options={options.eyewear} />
                        </div>

                        <OptionSelect label="Primary Color Palette" value={palette} onChange={e => setPalette(e.target.value)} options={options.palettes} />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Signature Item (Optional)</label>
                            <input type="text" value={signatureItem} onChange={e => setSignatureItem(e.target.value)} placeholder="e.g., A glowing artifact, robotic pet" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                        </div>

                        <OptionSelect label="Setting" value={setting} onChange={e => setSetting(e.target.value)} options={options.settings} />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Core Strengths (Select up to 3)</label>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                                {options.strengths.map(s => (
                                    <button key={s} onClick={() => handleStrengthChange(s)} className={`px-2 py-1 text-sm rounded-md border transition-colors ${coreStrengths.includes(s) ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>{s}</button>
                                ))}
                            </div>
                        </div>

                        <OptionSelect label="Gamer Mentality" value={mentality} onChange={e => setMentality(e.target.value)} options={options.mentalities} />
                    </div>
                )}
            </div>

            {!generatedCard && (
                <div className="mt-6 flex-shrink-0">
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50">
                        Generate Card
                    </button>
                </div>
            )}
        </div>
    );
};

export default GamerCardView;
