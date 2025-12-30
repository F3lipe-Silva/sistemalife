
'use server';
/**
 * @fileOverview Um agente de IA que gera um desafio para a Torre dos Desafios.
 *
 * - generateTowerChallenge - Gera um desafio com base no andar e no perfil do utilizador.
 * - GenerateTowerChallengeInput - O tipo de entrada para a função.
 * - GenerateTowerChallengeOutput - O tipo de retorno para a função.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const ChallengeRequirementSchema = z.object({
  type: z.enum(['missions_completed', 'skill_level_reached', 'streak_maintained', 'level_reached', 'missions_in_category_completed'])
    .describe("O tipo de critério para completar o desafio."),
  value: z.string().or(z.number()).describe("O valor alvo para o critério (ex: 5, 'Saúde & Fitness')."),
  target: z.number().describe("A meta numérica que o critério precisa de atingir."),
});

const ChallengeRewardsSchema = z.object({
  xp: z.number().describe("A quantidade de XP ganho."),
  fragments: z.number().describe("O número de fragmentos ganhos."),
  premiumFragments: z.number().optional().describe("O número de fragmentos premium ganhos (mais raro)."),
});

const GenerateTowerChallengeInputSchema = z.object({
    floorNumber: z.number().describe('O número do andar para o qual gerar o desafio. Este é o principal fator de dificuldade.'),
    userProfile: z.string().describe('O perfil do utilizador como uma string JSON, incluindo nível, estatísticas e streak.'),
    userSkills: z.string().describe('As habilidades do utilizador como uma string JSON, incluindo níveis e categorias.'),
    activeGoals: z.string().describe('As metas ativas do utilizador como uma string JSON.'),
    recentChallenges: z.array(z.string()).optional().describe('Uma lista de títulos de desafios recentes para evitar repetição.'),
});
export type GenerateTowerChallengeInput = z.infer<typeof GenerateTowerChallengeInputSchema>;


const GenerateTowerChallengeOutputSchema = z.object({
  id: z.string().describe("Um ID único para o desafio (ex: 'floor50_daily_1')."),
  floor: z.number().describe("O número do andar a que este desafio pertence."),
  title: z.string().describe("O título épico e temático para o desafio."),
  description: z.string().describe("Uma breve descrição do que é necessário para completar o desafio."),
  type: z.enum(['daily', 'weekly', 'special', 'class', 'skill']).describe("O tipo de desafio a ser gerado."),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert', 'master', 'infinite']).describe("A dificuldade do desafio, baseada no andar."),
  requirements: z.array(ChallengeRequirementSchema).describe("Os requisitos específicos e mensuráveis para completar o desafio."),
  rewards: ChallengeRewardsSchema.describe("As recompensas a serem concedidas após a conclusão."),
  timeLimit: z.number().optional().describe("O limite de tempo em horas, se aplicável (ex: 24 para diário, 168 para semanal)."),
});
export type GenerateTowerChallengeOutput = z.infer<typeof GenerateTowerChallengeOutputSchema>;

export async function generateTowerChallenge(
  input: GenerateTowerChallengeInput
): Promise<GenerateTowerChallengeOutput> {
  const prompt = `
    Você é a "Arquiteta da Torre", uma IA especializada em criar desafios progressivos e personalizados para um RPG da vida real.

    A sua tarefa é criar um novo desafio para um Caçador na Torre dos Desafios.

    **DADOS DO CAÇADOR E DO CONTEXTO:**
    - Andar Atual: ${input.floorNumber}
    - Perfil do Caçador: ${input.userProfile}
    - Habilidades do Caçador: ${input.userSkills}
    - Metas Ativas do Caçador: ${input.activeGoals}
    - Desafios Recentes (a evitar): ${input.recentChallenges?.join(', ') || 'Nenhum'}

    **DIRETIVAS:**
    1. Escala de Dificuldade proporcional ao andar (${input.floorNumber}).
    2. Personalização baseada nos dados do Caçador.
    3. Requisitos claros e mensuráveis.

    Responda em formato JSON seguindo este esquema:
    {
      "id": "...",
      "floor": ${input.floorNumber},
      "title": "...",
      "description": "...",
      "type": "daily",
      "difficulty": "beginner/intermediate/advanced/expert/master/infinite",
      "requirements": [{ "type": "...", "value": "...", "target": 10 }],
      "rewards": { "xp": 100, "fragments": 10 },
      "timeLimit": 24
    }
  `;

  return await generateWithAppwriteAI<GenerateTowerChallengeOutput>(prompt, true);
}


    
