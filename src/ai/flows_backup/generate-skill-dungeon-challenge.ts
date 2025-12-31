
'use server';
/**
 * @fileOverview Um agente de IA que gera desafios práticos para uma Masmorra de Habilidade.
 *
 * - generateSkillDungeonChallenge - Gera um desafio com base na habilidade e no nível da sala.
 * - GenerateSkillDungeonChallengeInput - O tipo de entrada para a função.
 * - GenerateSkillDungeonChallengeOutput - O tipo de retorno para a função.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const DungeonChallengeSchema = z.object({
  roomLevel: z.number().describe("O nível da sala para o qual este desafio foi gerado."),
  challengeName: z.string().describe("Um nome curto e temático para o desafio (ex: 'O Teste das Variáveis', 'A Forja dos Componentes')."),
  challengeDescription: z.string().describe("Uma descrição clara e concisa do que o Caçador precisa de fazer. Deve ser uma tarefa prática e verificável."),
  successCriteria: z.string().describe("O critério de sucesso que o Caçador deve confirmar para provar que completou o desafio (ex: 'Cole o código da sua função aqui', 'Faça upload de um screenshot do seu componente renderizado')."),
  xpReward: z.number().describe("A quantidade de XP de HABILIDADE (não de perfil) que este desafio concede."),
});

const GenerateSkillDungeonChallengeInputSchema = z.object({
    skillName: z.string().describe('O nome da habilidade para a qual gerar o desafio.'),
    skillDescription: z.string().describe('A descrição da habilidade.'),
    skillLevel: z.number().describe('O nível atual da habilidade do Caçador.'),
    dungeonRoomLevel: z.number().describe('O nível da sala da masmorra. Este é o principal fator de dificuldade.'),
    previousChallenges: z.array(z.string()).optional().describe('Uma lista de nomes de desafios anteriores nesta masmorra para evitar repetição.'),
});
export type GenerateSkillDungeonChallengeInput = z.infer<typeof GenerateSkillDungeonChallengeInputSchema>;


const GenerateSkillDungeonChallengeOutputSchema = DungeonChallengeSchema;
export type GenerateSkillDungeonChallengeOutput = z.infer<typeof GenerateSkillDungeonChallengeOutputSchema>;

export async function generateSkillDungeonChallenge(
  input: GenerateSkillDungeonChallengeInput
): Promise<GenerateSkillDungeonChallengeOutput> {
  const prompt = `
    Você é o "Mestre da Masmorra", uma IA especializada em criar desafios práticos e focados para desenvolver uma habilidade específica.

    A sua tarefa é criar um desafio para a Masmorra da Habilidade: "${input.skillName}".
    - Descrição da Habilidade: ${input.skillDescription}
    - Nível atual da Habilidade do Caçador: ${input.skillLevel}
    - Nível da Sala da Masmorra (Dificuldade): ${input.dungeonRoomLevel}
    - Desafios Anteriores (a evitar): ${input.previousChallenges?.join(', ') || 'Nenhum'}

    **DIRETIVAS:**
    1. Desafio prático e específico relacionado à habilidade.
    2. Dificuldade progressiva baseada no nível da sala (${input.dungeonRoomLevel}).
    3. Critério de sucesso claro e verificável.

    Responda em formato JSON seguindo este esquema:
    {
      "roomLevel": ${input.dungeonRoomLevel},
      "challengeName": "...",
      "challengeDescription": "...",
      "successCriteria": "...",
      "xpReward": 50
    }
  `;

  return await generateWithAppwriteAI<GenerateSkillDungeonChallengeOutput>(prompt, true);
}

