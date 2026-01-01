/**
 * @fileOverview Um agente de IA que sugere novas conquistas (achievements) personalizadas.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const AchievementCriteriaSchema = z.object({
  type: z.enum(['missions_completed', 'level_reached', 'goals_completed', 'skill_level_reached', 'streak_maintained', 'missions_in_category_completed'])
    .describe("O tipo de critério para desbloquear a conquista."),
  value: z.number().describe("O valor numérico que o critério precisa de atingir (ex: 5, 10, 50)."),
  category: z.string().optional().describe("A categoria específica, se o tipo for 'missions_in_category_completed'.")
});


const AchievementSchema = z.object({
  id: z.string().describe("Um ID único para a conquista (ex: 'python_master_1', 'streak_hero_3')."),
  name: z.string().describe("O nome épico e inspirador para a conquista (ex: 'O Início do Programador', 'Maratonista Consistente')."),
  description: z.string().describe("Uma breve descrição que explica o que é necessário para desbloquear esta conquista."),
  icon: z.enum(['Award', 'Book', 'BarChart', 'Gem', 'Shield', 'Flame', 'Trophy', 'BrainCircuit', 'Star', 'Swords']).describe("O nome de um ícone da biblioteca lucide-react que melhor representa a conquista."),
  criteria: AchievementCriteriaSchema.describe("O critério específico e mensurável para desbloquear a conquista."),
});


const GenerateUserAchievementsInputSchema = z.object({
  profile: z.string().describe("O perfil do utilizador, incluindo nível, estatísticas e streak, como uma string JSON."),
  skills: z.string().describe("As habilidades atuais do utilizador, incluindo nomes, níveis e categorias, como uma string JSON."),
  goals: z.string().describe("As metas ativas do utilizador, como uma string JSON."),
  existingAchievementIds: z.array(z.string()).optional().describe("Uma lista de IDs de conquistas que o utilizador já possui, para evitar duplicatas."),
});
export type GenerateUserAchievementsInput = z.infer<typeof GenerateUserAchievementsInputSchema>;


const GenerateUserAchievementsOutputSchema = z.object({
  achievements: z.array(AchievementSchema).describe("Uma lista de 5 a 7 novas conquistas personalizadas para o utilizador."),
});
export type GenerateUserAchievementsOutput = z.infer<typeof GenerateUserAchievementsOutputSchema>;


export async function generateUserAchievements(
  input: GenerateUserAchievementsInput
): Promise<GenerateUserAchievementsOutput> {
  const prompt = `
      Você é o "Criador de Lendas" do SISTEMA DE VIDA... (seu prompt atual)
  `;

  try {
    return await generateWithAppwriteAI<GenerateUserAchievementsOutput>(prompt, true);
  } catch (error) {
    console.error("Erro ao gerar conquistas, usando conquistas de linhagem:", error);
    return {
      achievements: [
        {
          id: "level_milestone_10",
          name: "Despertar do Poder",
          description: "Alcance o nível 10 para provar seu valor inicial.",
          icon: "Award",
          criteria: { type: "level_reached", value: 10 }
        },
        {
          id: "streak_warrior_7",
          name: "Consistência de Aço",
          description: "Mantenha uma sequência de 7 dias de missões concluídas.",
          icon: "Flame",
          criteria: { type: "streak_maintained", value: 7 }
        },
        {
          id: "goal_slayer_1",
          name: "Conquistador de Destinos",
          description: "Conclua sua primeira meta épica.",
          icon: "Trophy",
          criteria: { type: "goals_completed", value: 1 }
        }
      ]
    };
  }
}

