
'use server';
/**
 * @fileOverview Um agente de IA que calcula o valor de XP e recompensas para uma missão.
 *
 * - generateMissionRewards - Calcula um valor de XP e fragmentos justo com base na dificuldade da missão e no nível do utilizador.
 * - GenerateMissionRewardsInput - O tipo de entrada para a função.
 * - GenerateMissionRewardsOutput - O tipo de retorno para a função.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retryWithBackoff } from '@/lib/ai-utils';

const GenerateMissionRewardsInputSchema = z.object({
  missionText: z.string().describe("O nome da missão."),
  missionDescription: z.string().optional().describe("A descrição da missão."),
  subTasks: z.array(z.any()).optional().describe("A lista de sub-tarefas para avaliar volume de trabalho."),
  userLevel: z.number().describe("O nível atual do utilizador."),
});
export type GenerateMissionRewardsInput = z.infer<typeof GenerateMissionRewardsInputSchema>;

const GenerateMissionRewardsOutputSchema = z.object({
  xp: z.number().describe('A quantidade de XP calculada para a missão.'),
  fragments: z.number().describe('A quantidade de fragmentos (moeda do jogo) calculada para a missão.'),
});
export type GenerateMissionRewardsOutput = z.infer<typeof GenerateMissionRewardsOutputSchema>;

export async function generateMissionRewards(
  input: GenerateMissionRewardsInput
): Promise<GenerateMissionRewardsOutput> {
  return generateMissionRewardsFlow(input);
}

const generateMissionRewardsFlow = ai.defineFlow(
  {
    name: 'generateMissionRewardsFlow',
    inputSchema: GenerateMissionRewardsInputSchema,
    outputSchema: GenerateMissionRewardsOutputSchema,
  },
  async ({missionText, missionDescription, subTasks, userLevel}) => {
    // Fatores de cálculo
    const baseXP = 15;
    const difficultyMultiplier = 1.5; // Aumentado
    const levelMultiplier = 0.3; 
    const subTaskWeight = 5; // Cada sub-tarefa adiciona peso ao XP
    
    const baseFragments = 2;
    const fragmentDifficultyMultiplier = 0.8;

    const prompt = `
        Analise a seguinte missão e avalie a sua complexidade geral numa escala de 1 a 10.
        Considere o volume de trabalho: ${subTasks?.length || 1} sub-tarefa(s).
        
        Nome: "${missionText}"
        Descrição: "${missionDescription || ''}"
        Sub-tarefas: ${JSON.stringify(subTasks || [])}
        
        Responda APENAS com um número de 1 a 10.
    `;

    try {
      const {output: difficultyScoreText} = await retryWithBackoff(
        async () => await ai.generate({
          prompt,
          model: 'googleai/gemini-2.5-flash',
        }),
        3,
        1000,
        'Generate Mission Rewards'
      );

      const difficultyScore = parseInt(difficultyScoreText, 10) || 4;

      // Fórmula melhorada: Base + (Dificuldade * Mult) + (Qtd Subtarefas * Peso) + (Level * Mult)
      const calculatedXP = baseXP + (difficultyScore * difficultyMultiplier) + ((subTasks?.length || 1) * subTaskWeight) + (userLevel * levelMultiplier);
      const finalXP = Math.round(Math.max(10, Math.min(150, calculatedXP)));
      
      const calculatedFragments = baseFragments + (difficultyScore * fragmentDifficultyMultiplier) + ((subTasks?.length || 1) * 0.5);
      const finalFragments = Math.round(Math.max(1, Math.min(30, calculatedFragments)));

      return {
        xp: finalXP,
        fragments: finalFragments
      };
    } catch (error) {
      console.error('Failed to generate mission rewards with AI, using fallback calculation:', error);
      
      // Fallback: estimate based on mission text length and user level
      const missionComplexity = Math.min(10, Math.max(3, Math.floor(missionText.length / 20)));
      const fallbackXP = Math.round(baseXP + (missionComplexity * difficultyMultiplier) + (userLevel * levelMultiplier));
      const fallbackFragments = Math.round(baseFragments + (missionComplexity * fragmentDifficultyMultiplier) + (userLevel * fragmentLevelMultiplier));
      
      return {
        xp: Math.max(10, Math.min(100, fallbackXP)),
        fragments: Math.max(1, Math.min(20, fallbackFragments))
      };
    }
  }
);
