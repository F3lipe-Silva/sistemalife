
/**
 * @fileOverview Um agente de IA que gera desafios épicos para a Torre de Desafios.
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
    floorNumber: z.number().describe('O número do andar para o qual gerar o desafio.'),
    userProfile: z.string().describe('O perfil do utilizador como uma string JSON.'),
    userSkills: z.string().describe('As habilidades do utilizador como uma string JSON.'),
    activeGoals: z.string().describe('As metas ativas do utilizador como uma string JSON.'),
    currentActiveMission: z.string().optional().describe('A missão diária que o utilizador está a realizar no momento para ser intensificada.'),
    recentChallenges: z.array(z.string()).optional().describe('Uma lista de títulos de desafios recentes.'),
});
export type GenerateTowerChallengeInput = z.infer<typeof GenerateTowerChallengeInputSchema>;

export async function generateTowerChallenge(
  input: GenerateTowerChallengeInput
): Promise<GenerateTowerChallengeOutput> {
  const prompt = `
    Você é a "Arquiteta da Torre" do Demon Castle.
    Sua tarefa é pegar a MISSÃO ATUAL do Caçador e INTENSIFICÁ-LA para um desafio de Andar.

    **CONTEXTO DO DESAFIO:**
    - Andar da Torre: ${input.floorNumber}
    - Missão Base (A intensificar): ${input.currentActiveMission || 'Nenhuma missão ativa. Use as Metas como base.'}
    - Metas do Caçador: ${input.activeGoals}

    **DIRETRIZES DE INTENSIFICAÇÃO:**
    1. **Não seja genérico:** Se a missão base é "10 flexões", o desafio deve ser algo como "Prova de Sangue: 25 Flexões Explosivas".
    2. **Multiplicador de Dificuldade:** Aumente os alvos (targets) das sub-tarefas em pelo menos 2x a 3x, dependendo do andar.
    3. **Lore Corrompido:** Use termos como "Sombra", "Demonic", "Punição", "Sobrevivência".
    4. **Unicidade:** O desafio deve parecer uma versão de elite do que o Caçador já faz.

    Responda em JSON seguindo o esquema:
    {
      "id": "...",
      "floor": ${input.floorNumber},
      "title": "...",
      "description": "...",
      "type": "special",
      "difficulty": "advanced",
      "requirements": [{ "type": "skill_level_reached", "value": "Nome da Tarefa Intensificada", "target": 20 }],
      "rewards": { "xp": 150, "fragments": 20 }
    }
  `;

  try {
    return await generateWithAppwriteAI<GenerateTowerChallengeOutput>(prompt, true);
  } catch (error) {
    console.error("Erro na Arquiteta da Torre, ativando Protocolo de Emergência:", error);
    
    // Tenta extrair dados da missão base para intensificar manualmente no fallback
    let fallbackTitle = `Desafio do Andar ${input.floorNumber}`;
    let fallbackTarget = 20;
    
    if (input.currentActiveMission) {
        try {
            const base = JSON.parse(input.currentActiveMission);
            fallbackTitle = `[CORROMPIDO] ${base.nome}`;
            if (base.subTasks && base.subTasks[0]) {
                fallbackTarget = base.subTasks[0].target * 2;
            }
        } catch (e) { /* ignore */ }
    }

    return {
      id: `fallback_floor_${input.floorNumber}`,
      floor: input.floorNumber,
      title: fallbackTitle,
      description: "O Sistema detectou uma falha de conexão e aplicou um multiplicador de dificuldade manual. Sobreviva.",
      type: "special",
      difficulty: "advanced",
      requirements: [{ 
          type: "missions_completed", 
          value: "Intensificação de Base", 
          target: fallbackTarget 
      }],
      rewards: { xp: 100, fragments: 10 }
    };
  }
}


    
