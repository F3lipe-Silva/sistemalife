
// Client-side shim for AI flows to avoid 'use server' issues with Static Export (Capacitor)
// These functions should eventually point to a backend API (e.g. Firebase Functions)

const notImplemented = async (name: string) => {
  console.warn(`AI Flow '${name}' called on client, but no backend is connected.`);
  return Promise.reject(new Error(`AI Flow '${name}' not implemented on client.`));
};

export async function generateAnalyticsInsights(input: any): Promise<any> {
  return notImplemented('generateAnalyticsInsights');
}

export async function generateGoalCategory(input: any): Promise<any> {
  return notImplemented('generateGoalCategory');
}

export async function generateGoalSuggestion(input: any): Promise<any> {
  return notImplemented('generateGoalSuggestion');
}

export async function generateHunterAvatar(input: any): Promise<any> {
    console.log("Mocking generateHunterAvatar for UI testing");
    // Return a dummy base64 or URL if needed to prevent UI crashes immediately
    return { avatarDataUri: "" };
}

export async function generateMissionRewards(input: any): Promise<any> {
  return notImplemented('generateMissionRewards');
}

export async function generateNextDailyMission(input: any): Promise<any> {
  return notImplemented('generateNextDailyMission');
}

export async function generateRoutineSuggestion(input: any): Promise<any> {
  return notImplemented('generateRoutineSuggestion');
}

export async function generateShopItems(input: any): Promise<any> {
  return notImplemented('generateShopItems');
}

export async function generateSkillDungeonChallenge(input: any): Promise<any> {
  return notImplemented('generateSkillDungeonChallenge');
}

export async function generateSkillFromGoal(input: any): Promise<any> {
  return notImplemented('generateSkillFromGoal');
}

export async function generateTowerChallenge(input: any): Promise<any> {
  return notImplemented('generateTowerChallenge');
}

export async function generateUserAchievements(input: any): Promise<any> {
  return notImplemented('generateUserAchievements');
}

export async function validateDungeonSubmission(input: any): Promise<any> {
  return notImplemented('validateDungeonSubmission');
}

export async function generateSmartGoalQuestion(input: any): Promise<any> {
  return notImplemented('generateSmartGoalQuestion');
}

export async function generateStorySegment(input: any): Promise<any> {
  return notImplemented('generateStorySegment');
}

export async function generateSimpleSmartGoal(input: any): Promise<any> {
  return notImplemented('generateSimpleSmartGoal');
}

export async function generateSkillExperience(input: any): Promise<any> {
  return notImplemented('generateSkillExperience');
}

export async function generateMissionSuggestion(input: any): Promise<any> {
  return notImplemented('generateMissionSuggestion');
}

export async function generateSystemAdvice(input: any): Promise<any> {
  return notImplemented('generateSystemAdvice');
}

export async function generateInitialEpicMission(input: any): Promise<any> {
  return notImplemented('generateInitialEpicMission');
}

export async function generateGoalRoadmap(input: any): Promise<any> {
  return notImplemented('generateGoalRoadmap');
}
