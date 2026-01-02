
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

const GenerateTowerChallengeOutputSchema = z.object({
    id: z.string(),
    floor: z.number(),
    title: z.string(),
    description: z.string(),
    type: z.enum(['daily', 'weekly', 'special', 'class', 'skill']),
    difficulty: z.enum(['normal', 'advanced', 'expert', 'elite']),
    requirements: z.array(ChallengeRequirementSchema),
    rewards: ChallengeRewardsSchema,
});

export type GenerateTowerChallengeOutput = z.infer<typeof GenerateTowerChallengeOutputSchema>;

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
    Sua tarefa é intensificar a MISSÃO ATUAL do Caçador para um desafio de elite.

    **MISSÃO BASE:** ${input.currentActiveMission || 'Use as metas como base'}
    **METAS ATIVAS:** ${input.activeGoals}
    **ANDAR:** ${input.floorNumber}

    **REGRAS DE OURO:**
    1. **Descrição Breve e Prática:** O texto deve ser curto (max 2 parágrafos).
       - Intro: Uma frase de lore sombrio.
       - Guia: Explique CLARAMENTE o que o Caçador deve fazer para cada objetivo técnico.
    2. **Objetivos Reais:** Não invente números absurdos. Multiplique a missão base por 2x ou 3x no máximo.
    3. **Nomenclatura:** Os nomes dos requisitos (requirements.value) devem ser descritivos (ex: "Linhas de Código Limpo", "Minutos de Corrida Intensa").

    **ESTRUTURA DA DESCRIÇÃO:**
    [Lore Sombrio Curto]
    
    **O TESTE:**
    - [Explicação do Objetivo 1]
    - [Explicação do Objetivo 2]

    Responda em JSON:
    {
      "id": "...",
      "floor": ${input.floorNumber},
      "title": "NOME DO DESAFIO",
      "description": "Texto curto com o guia de execução...",
      "type": "special",
      "difficulty": "advanced",
      "requirements": [
        { "type": "skill_level_reached", "value": "Nome Descritivo da Tarefa", "target": 20 }
      ],
      "rewards": { "xp": 350, "fragments": 50 }
    }
  `;  try {
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


    
