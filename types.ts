export type Database = {
  public: {
    Tables: {
      chapters: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          content: string;
          word_count: number;
          sort_order: number;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          content: string;
          word_count: number;
          sort_order: number;
          user_id: string;
        };
        Update: {
          name?: string;
          content?: string;
          word_count?: number;
          sort_order?: number;
        };
        Relationships: [];
      };
      gamer_profiles: {
        Row: {
          user_id: string;
          created_at: string;
          updated_at: string;
          characterName: string | null;
          characterClass: string | null;
          characterTrait: string | null;
          favoriteGenres: string | null;
          storyTone: string | null;
          gameWorld: string | null;
          xp: number;
          level: number;
          arcane_crystals: number;
          writing_streak: number;
          last_active_date: string | null;
          earned_achievements: string[] | null;
        };
        Insert: {
          user_id: string;
          created_at?: string;
          updated_at?: string;
          characterName?: string | null;
          characterClass?: string | null;
          characterTrait?: string | null;
          favoriteGenres?: string | null;
          storyTone?: string | null;
          gameWorld?: string | null;
          xp?: number;
          level?: number;
          arcane_crystals?: number;
          writing_streak?: number;
          last_active_date?: string | null;
          earned_achievements?: string[] | null;
        };
        Update: {
          updated_at?: string;
          characterName?: string | null;
          characterClass?: string | null;
          characterTrait?: string | null;
          favoriteGenres?: string | null;
          storyTone?: string | null;
          gameWorld?: string | null;
          xp?: number;
          level?: number;
          arcane_crystals?: number;
          writing_streak?: number;
          last_active_date?: string | null;
          earned_achievements?: string[] | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          name: string | null;
        };
        Insert: {
          id: string;
          name: string | null;
        };
        Update: {
          name?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};


export type Chapter = Database['public']['Tables']['chapters']['Row'];

export interface GamerProfileData {
  characterName: string;
  characterClass: string;
  characterTrait: string;
  favoriteGenres: string;
  storyTone: string;
  gameWorld: string;
  // Gamification
  xp: number;
  level: number;
  arcaneCrystals: number;
  writingStreak: number;
  lastActiveDate: string | null;
  earnedAchievements: string[];
}

export type CockpitView = 'profile' | 'chapters' | 'pictures' | 'commandCenter' | 'settings' | 'menu' | 'auth' | 'shortTales' | 'gamerCard' | null;

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
}

export type Theme = 'light' | 'dark';
