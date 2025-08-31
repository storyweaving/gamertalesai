import { GamerProfileData, Chapter } from '../types';

// --- GAMIFICATION SERVICE ---

interface ProfileForCheck extends GamerProfileData {
    totalWords: number;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    condition: (profile: ProfileForCheck, chapters: Chapter[]) => boolean;
}

export const achievements: Achievement[] = [
    { id: 'first_steps', name: "First Steps", description: "Write your first 10 words.", condition: (p) => p.totalWords >= 10 },
    { id: 'novice_scribe', name: "Novice Scribe", description: "Write 100 words.", condition: (p) => p.totalWords >= 100 },
    { id: 'story_weaver', name: "Story Weaver", description: "Write 1,000 words.", condition: (p) => p.totalWords >= 1000 },
    { id: 'epic_chronicler', name: "Epic Chronicler", description: "Write 10,000 words.", condition: (p) => p.totalWords >= 10000 },
    { id: 'worldbuilder', name: "Worldbuilder", description: "Fill out your entire character profile.", condition: (p) => !!(p.characterName && p.characterClass && p.characterTrait && p.favoriteGenres && p.storyTone && p.gameWorld) },
    { id: 'chapter_one', name: "Chapter I", description: "Finish your first chapter (at least 250 words).", condition: (p, ch) => ch.some(c => c.word_count >= 250) },
    { id: 'trilogy', name: "A Saga Begins", description: "Create at least 3 chapters.", condition: (p, ch) => ch.length >= 3 },
    { id: 'week_streak', name: "Dedicated", description: "Maintain a 7-day writing streak.", condition: (p) => p.writingStreak >= 7 },
];

const writerRanks = [
    { level: 1, rank: 'Scribe Initiate', minXp: 0 },
    { level: 2, rank: 'Apprentice Scribe', minXp: 100 },
    { level: 3, rank: 'Journeyman Scribe', minXp: 400 },
    { level: 4, rank: 'Adept Storyteller', minXp: 900 },
    { level: 5, rank: 'Master Storyteller', minXp: 1600 },
    { level: 6, rank: 'Chronicler', minXp: 2500 },
    { level: 7, rank: 'Lorekeeper', minXp: 3600 },
    { level: 8, rank: 'Master Lorekeeper', minXp: 4900 },
    { level: 9, rank: 'Sage of Ages', minXp: 6400 },
    { level: 10, rank: 'Living Legend', minXp: 8100 },
];

export const getWriterRank = (xp: number) => {
    let currentRank = writerRanks[0];
    for (let i = writerRanks.length - 1; i >= 0; i--) {
        if (xp >= writerRanks[i].minXp) {
            currentRank = writerRanks[i];
            break;
        }
    }
    return currentRank;
};

export const getXpForNextLevel = (level: number) => {
    const nextRank = writerRanks.find(r => r.level === level + 1);
    return nextRank ? nextRank.minXp : Infinity;
};
