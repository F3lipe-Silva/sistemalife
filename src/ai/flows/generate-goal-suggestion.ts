/**
 * @fileOverview Um agente de IA que sugere novas metas com base no perfil do utilizador.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const GoalSuggestionSchema = z.object({
  name: z.string().describe("O nome conciso e inspirador para a nova meta sugerida."),
  description: z.string().describe("Uma breve descrição (1-2 frases) explicando por que esta meta é uma boa sugestão para o utilizador, com base no seu perfil."),
  category: z.string().describe("A categoria que melhor se adequa a esta meta."),
});

const GenerateGoalSuggestionInputSchema = z.object({
  profile: z.string().describe("O perfil do utilizador, incluindo nível, estatísticas e títulos, como uma string JSON."),
  skills: z.string().describe("As habilidades atuais do utilizador, incluindo nomes, níveis e categorias, como uma string JSON."),
  completedGoals: z.string().optional().describe("Uma lista de metas que o utilizador já concluiu, para evitar repetições e dar contexto de sucesso."),
  existingCategories: z.array(z.string()).describe("A lista de categorias de metas existentes para garantir consistência."),
});
export type GenerateGoalSuggestionInput = z.infer<typeof GenerateGoalSuggestionInputSchema>;

const GenerateGoalSuggestionOutputSchema = z.object({
  suggestions: z.array(GoalSuggestionSchema).describe("Uma lista de 3 a 5 sugestões de novas metas personalizadas."),
});
export type GenerateGoalSuggestionOutput = z.infer<typeof GenerateGoalSuggestionOutputSchema>;


export async function generateGoalSuggestion(
  input: GenerateGoalSuggestionInput
): Promise<GenerateGoalSuggestionOutput> {
  const prompt = `
      Você é o "Estratega do Sistema"... (seu prompt atual)
  `;

  try {
    return await generateWithAppwriteAI<GenerateGoalSuggestionOutput>(prompt, true);
  } catch (error) {
    console.error("Erro ao gerar sugestões, usando banco de dados local:", error);
    return {
      suggestions: [
        {
          name: "Mestre da Calistenia",
          description: "Fortaleça sua base física com exercícios de peso corporal.",
          category: "Saúde & Fitness"
        },
        {
          name: "Arquiteto de Conhecimento",
          description: "Dedique tempo à leitura técnica e expansão intelectual.",
          category: "Crescimento Pessoal"
        },
        {
          name: "Guerreiro da Rotina",
          description: "Estabeleça um horário de sono consistente para maximizar sua energia.",
          category: "Saúde & Fitness"
        }
      ]
    };
  }
}

