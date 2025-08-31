
import React, { createContext, useReducer, useEffect, ReactNode, Dispatch, useCallback, useRef } from 'react';
import { Chapter, GamerProfileData, CockpitView, ToastType, Theme, Database } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { supabase } from '../services/supabaseClient';
import { Session, User, SignInWithPasswordCredentials, SignUpWithPasswordCredentials, AuthResponse } from '@supabase/supabase-js';
import { achievements, getWriterRank } from '../services/gamificationService';

interface AppState {
  chapters: Chapter[];
  activeChapterId: string | null;
  gamerProfile: GamerProfileData;
  cockpitView: CockpitView;
  toasts: { id: number; message: string; type: ToastType }[];
  theme: Theme;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  lastSelection: Range | null;
  imageToInsert: string | null;
  onboardingStep: number; // 0=off, 1=profile, 2=chapter title, 3=first words, 4=complete
}

type Action =
  | { type: 'SET_INITIAL_DATA'; payload: { chapters: Chapter[], gamerProfile: GamerProfileData } }
  | { type: 'ADD_CHAPTER_SUCCESS'; payload: Chapter }
  | { type: 'UPDATE_CHAPTER_CONTENT'; payload: { id: string; content: string, word_count: number } }
  | { type: 'UPDATE_CHAPTER_NAME_SUCCESS'; payload: { id: string; name: string } }
  | { type: 'DELETE_CHAPTER_SUCCESS'; payload: string }
  | { type: 'SET_ACTIVE_CHAPTER'; payload: string | null }
  | { type: 'SET_GAMER_PROFILE_SUCCESS'; payload: GamerProfileData }
  | { type: 'SET_COCKPIT_VIEW'; payload: CockpitView }
  | { type: 'ADD_TOAST'; payload: { message: string; type: ToastType } }
  | { type: 'REMOVE_TOAST'; payload: number }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LAST_SELECTION'; payload: Range | null }
  | { type: 'REQUEST_IMAGE_INSERTION'; payload: string }
  | { type: 'IMAGE_INSERTION_COMPLETE' }
  | { type: 'SET_ONBOARDING_STEP'; payload: number }
  | { type: 'UPDATE_GAMER_PROFILE'; payload: Partial<GamerProfileData> };

const initialState: AppState = {
  chapters: [],
  activeChapterId: null,
  gamerProfile: {
    characterName: '',
    characterClass: '',
    characterTrait: '',
    favoriteGenres: '',
    storyTone: '',
    gameWorld: '',
    xp: 0,
    level: 1,
    arcaneCrystals: 0,
    writingStreak: 0,
    lastActiveDate: null,
    earnedAchievements: [],
  },
  cockpitView: null,
  toasts: [],
  theme: 'dark',
  isLoading: true,
  session: null,
  user: null,
  lastSelection: null,
  imageToInsert: null,
  onboardingStep: 0,
};

const AppContext = createContext<{
    state: AppState;
    dispatch: Dispatch<Action>;
    addChapter: () => Promise<void>;
    updateChapterContent: (id: string, content: string) => Promise<void>;
    updateChapterName: (id: string, name: string) => Promise<void>;
    saveGamerProfile: (gamerProfile: GamerProfileData) => Promise<void>;
    deleteChapter: (id: string) => Promise<void>;
    signUp: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResponse>;
    signIn: (credentials: SignInWithPasswordCredentials) => Promise<AuthResponse>;
    signOut: () => Promise<{ error: Error | null }>;
}>({
  state: initialState,
  dispatch: () => null,
  addChapter: async () => {},
  updateChapterContent: async () => {},
  updateChapterName: async () => {},
  saveGamerProfile: async () => {},
  deleteChapter: async () => {},
  signUp: async () => ({} as AuthResponse),
  signIn: async () => ({} as AuthResponse),
  signOut: async () => ({ error: null }),
});

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_INITIAL_DATA': {
        const { chapters, gamerProfile } = action.payload;
        const activeId = state.activeChapterId && chapters.some(c => c.id === state.activeChapterId)
            ? state.activeChapterId
            : chapters[0]?.id || null;

        return { 
            ...state, 
            chapters, 
            gamerProfile: gamerProfile ? { ...initialState.gamerProfile, ...gamerProfile } : state.gamerProfile,
            activeChapterId: activeId,
            isLoading: false 
        };
    }
    case 'ADD_CHAPTER_SUCCESS':
      return { ...state, chapters: [...state.chapters, action.payload], activeChapterId: action.payload.id };
    
    case 'UPDATE_CHAPTER_CONTENT': {
        const { id, content, word_count } = action.payload;
        return {
            ...state,
            chapters: state.chapters.map(ch =>
                ch.id === id ? { ...ch, content, word_count } : ch
            ),
        };
    }
    case 'UPDATE_CHAPTER_NAME_SUCCESS': {
        const { id, name } = action.payload;
        return {
            ...state,
            chapters: state.chapters.map(ch =>
                ch.id === id ? { ...ch, name } : ch
            ),
        };
    }
    case 'DELETE_CHAPTER_SUCCESS': {
        const remainingChapters = state.chapters.filter(ch => ch.id !== action.payload);
        let newActiveChapterId = state.activeChapterId;

        if (state.activeChapterId === action.payload) {
            newActiveChapterId = remainingChapters[0]?.id || null;
        }

        return {
            ...state,
            chapters: remainingChapters,
            activeChapterId: newActiveChapterId,
        };
    }
    case 'SET_ACTIVE_CHAPTER':
      return { ...state, activeChapterId: action.payload };
    case 'SET_GAMER_PROFILE_SUCCESS':
      return { ...state, gamerProfile: action.payload };
    case 'UPDATE_GAMER_PROFILE':
        return { ...state, gamerProfile: { ...state.gamerProfile, ...action.payload } };
    case 'SET_COCKPIT_VIEW':
      return { ...state, cockpitView: action.payload };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { ...action.payload, id: Date.now() + Math.random() }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(toast => toast.id !== action.payload) };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload,
        user: action.payload?.user ?? null,
        isLoading: false,
      };
    case 'SET_LOADING':
        return { ...state, isLoading: action.payload };
    case 'SET_LAST_SELECTION':
      return { ...state, lastSelection: action.payload };
    case 'REQUEST_IMAGE_INSERTION':
      return { ...state, imageToInsert: action.payload };
    case 'IMAGE_INSERTION_COMPLETE':
      return { ...state, imageToInsert: null };
    case 'SET_ONBOARDING_STEP':
        return { ...state, onboardingStep: action.payload };
    default:
      return state;
  }
};

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const isYesterday = (d1: Date, d2: Date) => {
    const yesterday = new Date(d1);
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(yesterday, d2);
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>('gamertales-theme', 'dark');
  const [state, dispatch] = useReducer(appReducer, {
      ...initialState,
      theme: storedTheme,
  });

  const gamificationSaveTimeoutRef = useRef<number | null>(null);

  useEffect(() => { setStoredTheme(state.theme) }, [state.theme, setStoredTheme]);

  useEffect(() => {
    dispatch({type: 'SET_LOADING', payload: true});
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        dispatch({ type: 'SET_SESSION', payload: session });
        if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
            dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'auth' });
        } else if (event === 'SIGNED_IN') {
            dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async (user: User) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const { data: chaptersData, error: chaptersError } = await supabase
                .from('chapters')
                .select()
                .eq('user_id', user.id)
                .order('sort_order', { ascending: true });

            if (chaptersError) throw chaptersError;

            const { data: gamerProfileData, error: gamerProfileError } = await supabase
                .from('gamer_profiles')
                .select()
                .eq('user_id', user.id)
                .single();

            if (gamerProfileError && gamerProfileError.code !== 'PGRST116') { // Ignore "missing row" error
                 throw gamerProfileError;
            }
            
            const typedGamerProfileData = gamerProfileData as Database['public']['Tables']['gamer_profiles']['Row'] | null;

            let chaptersToSet: Chapter[] = chaptersData || [];
            if (chaptersData && chaptersData.length === 0) {
                // Create first chapter for new user
                const newChapterData: Database['public']['Tables']['chapters']['Insert'] = { 
                    name: 'The Adventure Begins',
                    content: '',
                    word_count: 0,
                    sort_order: 0,
                    user_id: user.id 
                };
                const { data: newChapter, error: insertError } = await supabase
                    .from('chapters')
                    .insert(newChapterData)
                    .select()
                    .single();
                
                if (insertError) throw insertError;
                if (newChapter) chaptersToSet = [newChapter];
            }
            
            const activeChapterId = chaptersToSet[0]?.id || null;

            const processedGamerProfile = typedGamerProfileData ? {
                characterName: typedGamerProfileData.characterName || '',
                characterClass: typedGamerProfileData.characterClass || '',
                characterTrait: typedGamerProfileData.characterTrait || '',
                favoriteGenres: typedGamerProfileData.favoriteGenres || '',
                storyTone: typedGamerProfileData.storyTone || '',
                gameWorld: typedGamerProfileData.gameWorld || '',
                xp: typedGamerProfileData.xp ?? 0,
                level: typedGamerProfileData.level ?? 1,
                arcaneCrystals: typedGamerProfileData.arcane_crystals ?? 0,
                writingStreak: typedGamerProfileData.writing_streak ?? 0,
                lastActiveDate: typedGamerProfileData.last_active_date,
                earnedAchievements: typedGamerProfileData.earned_achievements ?? [],
            } : null;

            dispatch({ type: 'SET_ACTIVE_CHAPTER', payload: activeChapterId });
            dispatch({ type: 'SET_INITIAL_DATA', payload: { chapters: chaptersToSet, gamerProfile: processedGamerProfile || initialState.gamerProfile } });
            
            const hasGamerProfile = typedGamerProfileData && typedGamerProfileData.characterName;
            const hasNamedChapter = chaptersToSet.length > 0 && chaptersToSet[0].name !== 'The Adventure Begins' && chaptersToSet[0].name.trim() !== '';
            const hasWrittenContent = chaptersToSet.length > 0 && chaptersToSet[0].word_count > 0;

            if (!hasGamerProfile) {
                dispatch({ type: 'SET_ONBOARDING_STEP', payload: 1 });
                dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'profile' });
            } else if (!hasNamedChapter) {
                dispatch({ type: 'SET_ONBOARDING_STEP', payload: 2 });
                dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'chapters' });
            } else if (!hasWrittenContent) {
                dispatch({ type: 'SET_ONBOARDING_STEP', payload: 3 });
            } else {
                dispatch({ type: 'SET_ONBOARDING_STEP', payload: 4 }); // Onboarding complete
            }

        } catch (error: any) {
            console.error("Error fetching data:", error);
            let errorMessage = "An unexpected error occurred while loading your story.";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            dispatch({ type: 'ADD_TOAST', payload: { message: `Error: ${errorMessage}`, type: ToastType.Error } });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    
    if (state.user) {
      fetchData(state.user);
    } else {
        // Set up view for logged-out user
        const defaultChapter: Chapter = {
            id: 'temp-1',
            created_at: new Date().toISOString(),
            name: '',
            content: '',
            word_count: 0,
            sort_order: 0,
            user_id: 'unauthenticated'
        };
        dispatch({ type: 'SET_ACTIVE_CHAPTER', payload: 'temp-1' });
        dispatch({ type: 'SET_INITIAL_DATA', payload: { chapters: [defaultChapter], gamerProfile: initialState.gamerProfile }});
    }
  }, [state.user]);


  const processGamificationUpdate = useCallback(() => {
    if (!state.user) return;

    let profileUpdates: Partial<GamerProfileData> = {};
    let newAchievements: string[] = [];
    const totalWords = state.chapters.reduce((sum, ch) => sum + ch.word_count, 0);

    // --- Streak Logic ---
    const today = new Date();
    const lastDate = state.gamerProfile.lastActiveDate ? new Date(state.gamerProfile.lastActiveDate) : null;
    let newStreak = state.gamerProfile.writingStreak;

    if (!lastDate || !isSameDay(today, lastDate)) {
        if (lastDate && isYesterday(today, lastDate)) {
            newStreak++;
        } else {
            newStreak = 1;
        }
        profileUpdates.writingStreak = newStreak;
        profileUpdates.lastActiveDate = today.toISOString();
    }
    
    // --- XP & Level Logic ---
    const xpGained = totalWords - state.gamerProfile.xp;
    if (xpGained > 0) {
      const currentXp = state.gamerProfile.xp + xpGained;
      const currentLevel = state.gamerProfile.level;
      const newLevel = getWriterRank(currentXp).level;
      profileUpdates.xp = currentXp;

      if (newLevel > currentLevel) {
          const crystalsEarned = (newLevel - currentLevel) * 100;
          profileUpdates.level = newLevel;
          profileUpdates.arcaneCrystals = state.gamerProfile.arcaneCrystals + crystalsEarned;
          dispatch({ type: 'ADD_TOAST', payload: { message: `Level Up! Reached Level ${newLevel}: ${getWriterRank(currentXp).rank}. +${crystalsEarned}💎`, type: ToastType.Success } });
      }
    }
    
    // --- Achievement Logic ---
    const currentProfileForCheck = { ...state.gamerProfile, ...profileUpdates, totalWords };

    for (const ach of achievements) {
        if (!state.gamerProfile.earnedAchievements.includes(ach.id) && ach.condition(currentProfileForCheck, state.chapters)) {
            newAchievements.push(ach.id);
        }
    }

    if (newAchievements.length > 0) {
        profileUpdates.earnedAchievements = [...state.gamerProfile.earnedAchievements, ...newAchievements];
        newAchievements.forEach(id => {
            const ach = achievements.find(a => a.id === id);
            if(ach) dispatch({ type: 'ADD_TOAST', payload: { message: `Achievement Unlocked: ${ach.name}!`, type: ToastType.Success } });
        });
    }

    if (Object.keys(profileUpdates).length > 0) {
        dispatch({ type: 'UPDATE_GAMER_PROFILE', payload: profileUpdates });
        
        if (gamificationSaveTimeoutRef.current) {
            clearTimeout(gamificationSaveTimeoutRef.current);
        }

        gamificationSaveTimeoutRef.current = window.setTimeout(async () => {
            if (!state.user) return;
            const dataToSave = {
                xp: profileUpdates.xp ?? state.gamerProfile.xp,
                level: profileUpdates.level ?? state.gamerProfile.level,
                arcane_crystals: profileUpdates.arcaneCrystals ?? state.gamerProfile.arcaneCrystals,
                writing_streak: profileUpdates.writingStreak ?? state.gamerProfile.writingStreak,
                last_active_date: profileUpdates.lastActiveDate ?? state.gamerProfile.lastActiveDate,
                earned_achievements: profileUpdates.earnedAchievements ?? state.gamerProfile.earnedAchievements
            };

            await supabase
                .from('gamer_profiles')
                .update(dataToSave)
                .eq('user_id', state.user.id);
        }, 2000);
    }
}, [state.user, state.chapters, state.gamerProfile, dispatch]);

  const processGamificationUpdateRef = useRef(processGamificationUpdate);
  useEffect(() => {
      processGamificationUpdateRef.current = processGamificationUpdate;
  }, [processGamificationUpdate]);

  const totalWords = state.chapters.reduce((sum, ch) => sum + ch.word_count, 0);
  useEffect(() => {
    // Debounce the gamification check to prevent running on every keystroke.
    // This avoids race conditions where toasts for achievements are dispatched multiple times
    // before the state has a chance to update.
    const handler = setTimeout(() => {
        processGamificationUpdateRef.current();
    }, 500);

    return () => {
        clearTimeout(handler);
    };
  }, [totalWords]);

  const deleteChapter = useCallback(async (id: string) => {
    if (!state.user) return;
    
    if (state.chapters.length <= 1) {
        dispatch({ type: 'ADD_TOAST', payload: { message: "You must have at least one chapter.", type: ToastType.Error } });
        return;
    }

    const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id);

    if (error) {
        dispatch({ type: 'ADD_TOAST', payload: { message: `Could not delete chapter: ${error.message}`, type: ToastType.Error } });
    } else {
        dispatch({ type: 'DELETE_CHAPTER_SUCCESS', payload: id });
        dispatch({ type: 'ADD_TOAST', payload: { message: "Chapter deleted.", type: ToastType.Success } });
    }
  }, [state.user, state.chapters.length, dispatch]);

  const addChapter = useCallback(async () => {
    if (!state.user) return;
    const newSortOrder = state.chapters.reduce((max, ch) => Math.max(ch.sort_order, max), -1) + 1;
    
    const newChapterData: Database['public']['Tables']['chapters']['Insert'] = {
        name: `Chapter ${state.chapters.length + 1}`,
        content: '',
        word_count: 0,
        sort_order: newSortOrder,
        user_id: state.user.id
    };
    const { data: newChapter, error } = await supabase
        .from('chapters')
        .insert(newChapterData)
        .select()
        .single();
    
    if (error) {
        dispatch({ type: 'ADD_TOAST', payload: { message: `Could not add chapter: ${error.message}`, type: ToastType.Error } });
    } else if (newChapter) {
        dispatch({ type: 'ADD_CHAPTER_SUCCESS', payload: newChapter as Chapter });
        dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'chapters' });
    }
  }, [state.chapters, state.user, dispatch]);

  const updateChapterContent = useCallback(async (id: string, content: string) => {
    if (!state.user) return;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    const word_count = textContent.trim().split(/\s+/).filter(Boolean).length;

    if (state.onboardingStep === 3 && word_count > 0) {
        dispatch({ type: 'SET_ONBOARDING_STEP', payload: 4 });
    }
    
    const chapterUpdate: Database['public']['Tables']['chapters']['Update'] = { content, word_count };
    const { error } = await supabase
        .from('chapters')
        .update(chapterUpdate)
        .eq('id', id);

    if (error) {
        dispatch({ type: 'ADD_TOAST', payload: { message: `Failed to save changes: ${error.message}`, type: ToastType.Error } });
    }
  }, [state.user, dispatch, state.onboardingStep]);

  const updateChapterName = useCallback(async (id: string, name: string) => {
    if (!state.user) return;
    const chapterUpdate: Database['public']['Tables']['chapters']['Update'] = { name };
    const { error } = await supabase
        .from('chapters')
        .update(chapterUpdate)
        .eq('id', id);

    if (error) {
        dispatch({ type: 'ADD_TOAST', payload: { message: `Failed to update name: ${error.message}`, type: ToastType.Error } });
    } else {
        if (state.onboardingStep === 2 && name.trim() !== '') {
            dispatch({ type: 'SET_ONBOARDING_STEP', payload: 3 });
            dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
        }
    }
  }, [state.user, dispatch, state.onboardingStep]);

  const saveGamerProfile = useCallback(async (gamerProfile: GamerProfileData) => {
    if (!state.user) return;

    // Check for "Worldbuilder" achievement
    const isComplete = gamerProfile.characterName && gamerProfile.characterClass && gamerProfile.characterTrait && gamerProfile.favoriteGenres && gamerProfile.storyTone && gamerProfile.gameWorld;
    let newAchievements = [...gamerProfile.earnedAchievements];

    if (isComplete && !gamerProfile.earnedAchievements.includes('worldbuilder')) {
        newAchievements.push('worldbuilder');
        const ach = achievements.find(a => a.id === 'worldbuilder');
        if(ach) dispatch({ type: 'ADD_TOAST', payload: { message: `Achievement Unlocked: ${ach.name}!`, type: ToastType.Success } });
    }

    const updatedProfile = { ...gamerProfile, earnedAchievements: newAchievements };

    const profileDataToSave: Database['public']['Tables']['gamer_profiles']['Update'] = { 
        characterName: updatedProfile.characterName,
        characterClass: updatedProfile.characterClass,
        characterTrait: updatedProfile.characterTrait,
        favoriteGenres: updatedProfile.favoriteGenres,
        storyTone: updatedProfile.storyTone,
        gameWorld: updatedProfile.gameWorld,
        earned_achievements: updatedProfile.earnedAchievements
    };
    
    const { error } = await supabase
        .from('gamer_profiles')
        .update(profileDataToSave)
        .eq('user_id', state.user.id);

    if (error) {
        dispatch({ type: 'ADD_TOAST', payload: { message: `Could not save profile: ${error.message}`, type: ToastType.Error } });
    } else {
        dispatch({ type: 'SET_GAMER_PROFILE_SUCCESS', payload: updatedProfile });
        dispatch({ type: 'ADD_TOAST', payload: { message: 'Character Profile saved!', type: ToastType.Success } });
        if (state.onboardingStep === 1) {
            dispatch({ type: 'SET_ONBOARDING_STEP', payload: 2 });
            dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'chapters' });
        }
    }
  }, [state.user, dispatch, state.onboardingStep]);
  
  const signUp = (credentials: SignUpWithPasswordCredentials) => supabase.auth.signUp(credentials);
  const signIn = (credentials: SignInWithPasswordCredentials) => supabase.auth.signInWithPassword(credentials);
  const signOut = () => supabase.auth.signOut();

  return <AppContext.Provider value={{ state, dispatch, addChapter, updateChapterContent, updateChapterName, saveGamerProfile: saveGamerProfile, deleteChapter, signUp, signIn, signOut }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => React.useContext(AppContext);
