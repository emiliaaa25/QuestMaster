import { Hobby, Quest } from '../types';

export interface GlobalStats {
  totalQuests: number;
  completedQuests: number;
  totalXP: number;
  totalHoursInvested: number;
  progressPercentage: number;
  masteredHobbies: number;
}

export interface HobbyStats {
  hobby: Hobby;
  totalQuests: number;
  completedQuests: number;
  xpEarned: number;
  hoursInvested: number;
  progressPercentage: number;
}

export const calculateGlobalStats = (hobbies: Hobby[], quests: Quest[]): GlobalStats => {
  const completedQuests = quests.filter((q) => q.status === 'Done');
  const totalXP = completedQuests.reduce((sum, q) => sum + q.xpReward, 0);
  const totalHoursInvested = quests.reduce((sum, q) => sum + q.hoursInvested, 0);
  const progressPercentage = quests.length > 0 ? (completedQuests.length / quests.length) * 100 : 0;
  const masteredHobbies = hobbies.filter((h) => h.isMastered).length;

  return {
    totalQuests: quests.length,
    completedQuests: completedQuests.length,
    totalXP,
    totalHoursInvested,
    progressPercentage,
    masteredHobbies,
  };
};

export const calculateHobbyStats = (hobby: Hobby, quests: Quest[]): HobbyStats => {
  const hobbyQuests = quests.filter((q) => q.hobbyId === hobby.id);
  const completedQuests = hobbyQuests.filter((q) => q.status === 'Done');
  const xpEarned = completedQuests.reduce((sum, q) => sum + q.xpReward, 0);
  const hoursInvested = hobbyQuests.reduce((sum, q) => sum + q.hoursInvested, 0);
  const progressPercentage = hobbyQuests.length > 0 ? (completedQuests.length / hobbyQuests.length) * 100 : 0;

  return {
    hobby,
    totalQuests: hobbyQuests.length,
    completedQuests: completedQuests.length,
    xpEarned,
    hoursInvested,
    progressPercentage,
  };
};
