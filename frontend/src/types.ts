export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type QuestStatus = 'To Do' | 'Doing' | 'Done';
export type HobbyCategory = 'Creative' | 'Physical' | 'Intellectual';

export interface Quest {
  id: number;
  hobbyId: number;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  status: QuestStatus;
  hoursInvested: number;
  xpReward: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface Hobby {
  id: number;
  name: string;
  emoji: string;
  category: HobbyCategory;
  description: string;
  imageUrl: string | null;
  presetSlug?: string | null;
  isMastered: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string | null;
}

export interface HobbyFormData {
  name: string;
  emoji: string;
  category: HobbyCategory;
  description?: string;
  imageUrl?: string | null;
  isMastered?: boolean;
}

export interface QuestFormData {
  hobbyId: number;
  title: string;
  description?: string;
  difficulty: DifficultyLevel;
  status: QuestStatus;
  hoursInvested: number;
  xpReward?: number;
}

export interface PresetQuest {
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  xpReward: number;
  estimatedHours: number;
}

export interface PresetHobby {
  slug: string;
  name: string;
  emoji: string;
  category: HobbyCategory;
  description: string;
  imageUrl: string | null;
  totalQuests: number;
  totalXP: number;
  estimatedHours: number;
  joined: boolean;
  joinedHobbyId?: number | null;
  quests: PresetQuest[];
}

export const DIFFICULTY_XP: Record<DifficultyLevel, number> = {
  Easy: 10,
  Medium: 25,
  Hard: 50,
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-orange-500',
};

export const CATEGORY_COLORS: Record<HobbyCategory, string> = {
  Creative: 'bg-pink-500',
  Physical: 'bg-green-500',
  Intellectual: 'bg-blue-500',
};
