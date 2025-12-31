'use server';
/**
 * @fileOverview Um agente de IA que calcula o ganho de experiência para uma habilidade.
 *
 * - generateSkillExperience - Calcula a experiência de habilidade ganha ao completar uma missão.
 * - GenerateSkillExperienceInput - O tipo de entrada para a função.
 * - GenerateSkillExperienceOutput - O tipo de retorno para a função.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';
import { retryWithBackoff } from '@/lib/ai-utils';

const GenerateSkillExperienceInputSchema = z.object({
  missionText: z.string().describe("O texto completo da missão diária concluída (nome e descrição)."),
  skillLevel: z.number().describe("O nível atual da habilidade relacionada."),
});
export type GenerateSkillExperienceInput = z.infer<typeof GenerateSkillExperienceInputSchema>;

const GenerateSkillExperienceOutputSchema = z.object({
  xp: z.number().describe('A quantidade de XP de habilidade calculada para a missão.'),
});
export type GenerateSkillExperienceOutput = z.infer<typeof GenerateSkillExperienceOutputSchema>;

export async function generateSkillExperience(
  input: GenerateSkillExperienceInput
): Promise<GenerateSkillExperienceOutput> {
  const {missionText, skillLevel} = input;
  const baseXpPerMission = 5;
  const difficultyMultiplier = 1.5;
  
  const prompt = `
      Analise a seguinte missão e avalie a sua contribuição para o desenvolvimento de uma habilidade específica numa escala de 1 a 10.
      
      Missão Concluída: "${missionText}"
      
      Responda APENAS com um número de 1 a 10.
  `;

  try {
    const difficultyScoreText = await retryWithBackoff(
      async () => await generateWithAppwriteAI(prompt),
      3,
      1000,
      'Generate Skill Experience'
    );

    const difficultyScore = parseInt(difficultyScoreText, 10) || 3;
    const levelDivisor = Math.max(1, skillLevel / 2);
    const calculatedXP = baseXpPerMission + (difficultyScore * difficultyMultiplier) / levelDivisor;
    const finalXP = Math.round(Math.max(1, calculatedXP));

    return {xp: finalXP};
  } catch (error) {
    console.error('Failed to generate skill XP with AI, using fallback:', error);
    const missionComplexity = Math.min(10, Math.max(3, Math.floor(missionText.length / 30)));
    const levelDivisor = Math.max(1, skillLevel / 2);
    const fallbackXP = baseXpPerMission + (missionComplexity * difficultyMultiplier) / levelDivisor;
    return {xp: Math.round(Math.max(1, fallbackXP))};
  }
}

