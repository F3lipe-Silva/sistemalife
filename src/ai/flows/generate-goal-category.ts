/**
 * @fileOverview Um agente de IA que categoriza uma nova meta.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const GenerateGoalCategoryInputSchema = z.object({
  goalName: z.string().describe('O nome da meta inserida pelo utilizador.'),
  categories: z.array(z.string()).describe('A lista de categorias pré-definidas para escolher.'),
});
export type GenerateGoalCategoryInput = z.infer<typeof GenerateGoalCategoryInputSchema>;

const GenerateGoalCategoryOutputSchema = z.object({
  category: z.string().describe('A categoria sugerida que melhor se adequa à meta.'),
});
export type GenerateGoalCategoryOutput = z.infer<typeof GenerateGoalCategoryOutputSchema>;

export async function generateGoalCategory(
  input: GenerateGoalCategoryInput
): Promise<GenerateGoalCategoryOutput> {
  const prompt = `Analise o nome da meta a seguir e escolha a categoria mais apropriada da lista fornecida.

Meta: "${input.goalName}"

Categorias disponíveis:
${input.categories.map(c => `- ${c}`).join('\n')}

Responda APENAS com a categoria escolhida da lista. Não adicione nenhuma outra palavra ou pontuação.`;

  const category = await generateWithAppwriteAI(prompt);
  return { category: category.trim() };
}

