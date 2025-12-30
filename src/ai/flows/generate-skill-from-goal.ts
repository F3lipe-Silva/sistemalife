'use server';
/**
 * @fileOverview Um agente de IA que cria uma nova habilidade com base numa meta do utilizador.
 *
 * - generateSkillFromGoal - Gera um nome, descrição e categoria para uma habilidade.
 * - GenerateSkillFromGoalInput - O tipo de entrada para a função.
 * - GenerateSkillFromGoalOutput - O tipo de retorno para a função.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const GenerateSkillFromGoalInputSchema = z.object({
  goalName: z.string().describe('O nome da meta do utilizador.'),
  goalDescription: z.string().describe('A descrição detalhada (SMART) da meta do utilizador.'),
  existingCategories: z.array(z.string()).describe('A lista de categorias de habilidades existentes para consistência.'),
});
export type GenerateSkillFromGoalInput = z.infer<typeof GenerateSkillFromGoalInputSchema>;

const GenerateSkillFromGoalOutputSchema = z.object({
  skillName: z.string().describe('O nome conciso e inspirador para a habilidade relacionada (ex: "Programação Python", "Corrida de Resistência").'),
  skillDescription: z.string().describe('Uma breve descrição do que esta habilidade representa.'),
  skillCategory: z.string().describe('A categoria que melhor se adequa a esta habilidade, escolhida a partir da lista de categorias existentes.'),
});
export type GenerateSkillFromGoalOutput = z.infer<typeof GenerateSkillFromGoalOutputSchema>;

export async function generateSkillFromGoal(
  input: GenerateSkillFromGoalInput
): Promise<GenerateSkillFromGoalOutput> {
  const prompt = `
      Você é um "Arquiteto de Habilidades" num RPG da vida real. Sua tarefa é analisar a meta de um utilizador e definir a habilidade fundamental que ele irá desenvolver ao perseguir essa meta.

      Meta do Utilizador: "${input.goalName}"
      Descrição da Meta: "${input.goalDescription}"

      Categorias de Habilidades Existentes:
      ${input.existingCategories.join(', ')}

      Responda em formato JSON seguindo este esquema:
      {
        "skillName": "...",
        "skillDescription": "...",
        "skillCategory": "..."
      }
  `;

  return await generateWithAppwriteAI<GenerateSkillFromGoalOutput>(prompt, true);
}

