import { generateAnalyticsInsights } from '@/ai/flows/generate-analytics-insights';
import { generateGoalCategory } from '@/ai/flows/generate-goal-category';
import { generateGoalSuggestion } from '@/ai/flows/generate-goal-suggestion';
import { generateMissionRewards } from '@/ai/flows/generate-mission-rewards';
import { generateNextDailyMission } from '@/ai/flows/generate-next-daily-mission';
import { generateRoutineSuggestion } from '@/ai/flows/generate-routine-suggestion';
import { generateShopItems } from '@/ai/flows/generate-shop-items';
import { generateSkillDungeonChallenge } from '@/ai/flows/generate-skill-dungeon-challenge';
import { generateSkillFromGoal } from '@/ai/flows/generate-skill-from-goal';
import { generateTowerChallenge } from '@/ai/flows/generate-tower-challenge';
import { generateUserAchievements } from '@/ai/flows/generate-user-achievements';
import { validateDungeonSubmission } from '@/ai/flows/validate-dungeon-submission';
import { generateSmartGoalQuestion } from '@/ai/flows/generate-smart-goal-questions';
import { generateStorySegment } from '@/ai/flows/generate-story-segment';
import { generateSimpleSmartGoal } from '@/ai/flows/generate-simple-smart-goal';
import { generateSkillExperience } from '@/ai/flows/generate-skill-experience';
import { generateMissionSuggestion } from '@/ai/flows/generate-mission-suggestion';
import { generateSystemAdvice } from '@/ai/flows/generate-personalized-advice';
import { generateInitialEpicMission } from '@/ai/flows/generate-initial-epic-mission';
import { generateGoalRoadmap } from '@/ai/flows/generate-goal-roadmap';

export {
  generateAnalyticsInsights,
  generateGoalCategory,
  generateGoalSuggestion,
  generateMissionRewards,
  generateNextDailyMission,
  generateRoutineSuggestion,
  generateShopItems,
  generateSkillDungeonChallenge,
  generateSkillFromGoal,
  generateTowerChallenge,
  generateUserAchievements,
  validateDungeonSubmission,
  generateSmartGoalQuestion,
  generateStorySegment,
  generateSimpleSmartGoal,
  generateSkillExperience,
  generateMissionSuggestion,
  generateSystemAdvice,
  generateInitialEpicMission,
  generateGoalRoadmap
};

export async function generateHunterAvatar(input: any): Promise<any> {
    console.log("Mocking generateHunterAvatar for UI testing");
    return { avatarDataUri: "" };
}
