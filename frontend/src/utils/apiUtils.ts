import axios from 'axios';
import {
  type AuthResponse,
  DIFFICULTY_XP,
  type DifficultyLevel,
  type Hobby,
  type HobbyCategory,
  type HobbyFormData,
  type PresetHobby,
  type PresetQuest,
  type Quest,
  type QuestFormData,
  type QuestStatus,
  type User,
} from '../types';

const AUTH_TOKEN_KEY = 'questmaster.auth.token';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface BackendHobby {
  id: number;
  name: string;
  category: HobbyCategory;
  description: string | null;
  icon: string;
  image_url: string | null;
  preset_slug?: string | null;
  is_mastered: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string | null;
}

interface BackendQuest {
  id: number;
  hobby_id: number;
  title: string;
  description: string | null;
  difficulty: DifficultyLevel;
  status: QuestStatus;
  xp_value: number;
  hours_spent: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface BackendPresetQuest {
  title: string;
  description: string | null;
  difficulty: DifficultyLevel;
  xp_value: number;
  estimated_hours: number;
}

interface BackendPresetHobby {
  slug: string;
  name: string;
  category: HobbyCategory;
  description: string;
  icon: string;
  image_url: string | null;
  total_quests: number;
  total_xp: number;
  estimated_hours: number;
  joined: boolean;
  joined_hobby_id: number | null;
  quests: BackendPresetQuest[];
}

interface BackendHobbyWithQuests extends BackendHobby {
  quests: BackendQuest[];
}

interface BackendPresetJoinResponse {
  already_joined: boolean;
  hobby: BackendHobbyWithQuests;
}

interface BackendUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

interface BackendAuthResponse {
  access_token: string;
  token_type: string;
  user: BackendUser;
}

const toFrontendHobby = (hobby: BackendHobby): Hobby => ({
  id: hobby.id,
  name: hobby.name,
  emoji: hobby.icon || '🎯',
  category: hobby.category,
  description: hobby.description ?? '',
  imageUrl: hobby.image_url,
  presetSlug: hobby.preset_slug ?? null,
  isMastered: hobby.is_mastered,
  createdAt: hobby.created_at,
  updatedAt: hobby.updated_at,
  lastActivityAt: hobby.last_activity_at,
});

const toFrontendUser = (user: BackendUser): User => ({
  id: user.id,
  username: user.username,
  email: user.email,
  createdAt: user.created_at,
});

const toFrontendAuth = (auth: BackendAuthResponse): AuthResponse => ({
  accessToken: auth.access_token,
  tokenType: auth.token_type,
  user: toFrontendUser(auth.user),
});

const toBackendHobby = (hobby: Partial<HobbyFormData>) => ({
  ...(hobby.name !== undefined ? { name: hobby.name } : {}),
  ...(hobby.category !== undefined ? { category: hobby.category } : {}),
  ...(hobby.description !== undefined ? { description: hobby.description || null } : {}),
  ...(hobby.emoji !== undefined ? { icon: hobby.emoji || '🎯' } : {}),
  ...(hobby.imageUrl !== undefined ? { image_url: hobby.imageUrl } : {}),
  ...(hobby.isMastered !== undefined ? { is_mastered: hobby.isMastered } : {}),
});

const toFrontendQuest = (quest: BackendQuest): Quest => ({
  id: quest.id,
  hobbyId: quest.hobby_id,
  title: quest.title,
  description: quest.description ?? '',
  difficulty: quest.difficulty,
  status: quest.status,
  hoursInvested: quest.hours_spent,
  xpReward: quest.xp_value,
  createdAt: quest.created_at,
  updatedAt: quest.updated_at,
  completedAt: quest.completed_at,
});

const toFrontendPresetQuest = (quest: BackendPresetQuest): PresetQuest => ({
  title: quest.title,
  description: quest.description ?? '',
  difficulty: quest.difficulty,
  xpReward: quest.xp_value,
  estimatedHours: quest.estimated_hours,
});

const toFrontendPresetHobby = (preset: BackendPresetHobby): PresetHobby => ({
  slug: preset.slug,
  name: preset.name,
  emoji: preset.icon || '🎯',
  category: preset.category,
  description: preset.description,
  imageUrl: preset.image_url,
  totalQuests: preset.total_quests,
  totalXP: preset.total_xp,
  estimatedHours: preset.estimated_hours,
  joined: preset.joined,
  joinedHobbyId: preset.joined_hobby_id,
  quests: preset.quests.map(toFrontendPresetQuest),
});

const toBackendQuest = (quest: Partial<QuestFormData>) => {
  const payload: Record<string, unknown> = {};

  if (quest.hobbyId !== undefined) payload.hobby_id = quest.hobbyId;
  if (quest.title !== undefined) payload.title = quest.title;
  if (quest.description !== undefined) payload.description = quest.description || null;
  if (quest.difficulty !== undefined) payload.difficulty = quest.difficulty;
  if (quest.status !== undefined) payload.status = quest.status;
  if (quest.hoursInvested !== undefined) payload.hours_spent = Number(quest.hoursInvested) || 0;
  if (quest.xpReward !== undefined) payload.xp_value = quest.xpReward;
  if (quest.difficulty !== undefined && quest.xpReward === undefined) {
    payload.xp_value = DIFFICULTY_XP[quest.difficulty];
  }

  return payload;
};

export const apiUtils = {
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  },

  async register(username: string, email: string, password: string) {
    const { data } = await api.post<BackendAuthResponse>('/auth/register', {
      username,
      email,
      password,
    });
    const auth = toFrontendAuth(data);
    apiUtils.setToken(auth.accessToken);
    return auth;
  },

  async login(identifier: string, password: string) {
    const { data } = await api.post<BackendAuthResponse>('/auth/login', {
      username: identifier,
      password,
    });
    const auth = toFrontendAuth(data);
    apiUtils.setToken(auth.accessToken);
    return auth;
  },

  async me() {
    const { data } = await api.get<BackendUser>('/auth/me');
    return toFrontendUser(data);
  },

  logout() {
    apiUtils.clearToken();
  },

  async getHobbies() {
    const { data } = await api.get<BackendHobby[]>('/hobbies');
    return data.map(toFrontendHobby);
  },

  async createHobby(hobby: HobbyFormData) {
    const { data } = await api.post<BackendHobby>('/hobbies', toBackendHobby(hobby));
    return toFrontendHobby(data);
  },

  async updateHobby(id: number, hobby: Partial<HobbyFormData>) {
    const { data } = await api.patch<BackendHobby>(`/hobbies/${id}`, toBackendHobby(hobby));
    return toFrontendHobby(data);
  },

  async deleteHobby(id: number) {
    await api.delete(`/hobbies/${id}`);
  },

  async getPresetHobbies() {
    const { data } = await api.get<BackendPresetHobby[]>('/preset-hobbies');
    return data.map(toFrontendPresetHobby);
  },

  async joinPresetHobby(slug: string) {
    const { data } = await api.post<BackendPresetJoinResponse>(`/preset-hobbies/${slug}/join`);
    return {
      alreadyJoined: data.already_joined,
      hobby: toFrontendHobby(data.hobby),
      quests: data.hobby.quests.map(toFrontendQuest),
    };
  },

  async getQuests() {
    const { data } = await api.get<BackendQuest[]>('/quests');
    return data.map(toFrontendQuest);
  },

  async createQuest(quest: QuestFormData) {
    const { data } = await api.post<BackendQuest>('/quests', toBackendQuest(quest));
    return toFrontendQuest(data);
  },

  async updateQuest(id: number, quest: Partial<QuestFormData>) {
    const { data } = await api.patch<BackendQuest>(`/quests/${id}`, toBackendQuest(quest));
    return toFrontendQuest(data);
  },

  async deleteQuest(id: number) {
    await api.delete(`/quests/${id}`);
  },
};