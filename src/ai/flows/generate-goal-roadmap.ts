
import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const RoadmapPhaseSchema = z.object({
  phaseTitle: z.string().describe("O título temático para a fase (ex: 'Fase 1: A Fundação do Conhecimento', 'Fase 2: As Primeiras Batalhas')."),
  phaseDescription: z.string().describe("Uma breve descrição do objetivo principal desta fase da jornada."),
  strategicMilestones: z.array(z.string()).describe("Uma lista de 3 a 5 marcos estratégicos ou objetivos chave a serem alcançados dentro desta fase."),
});

const GenerateGoalRoadmapInputSchema = z.object({
  goalName: z.string().describe("O nome da meta do utilizador."),
  goalDetails: z.string().describe("Os detalhes completos (SMART) da meta do utilizador."),
  userLevel: z.number().describe("O nível atual do utilizador, para contextualizar a complexidade da estratégia."),
});
export type GenerateGoalRoadmapInput = z.infer<typeof GenerateGoalRoadmapInputSchema>;

const GenerateGoalRoadmapOutputSchema = z.object({
  roadmap: z.array(RoadmapPhaseSchema).describe("Uma lista de 2 a 4 fases que compõem o roteiro estratégico completo."),
});
export type GenerateGoalRoadmapOutput = z.infer<typeof GenerateGoalRoadmapOutputSchema>;

export async function generateGoalRoadmap(
  input: GenerateGoalRoadmapInput
): Promise<GenerateGoalRoadmapOutput> {
  const prompt = `Você é o "Estratega Mestre" do SISTEMA DE VIDA... (seu prompt atual)`;

  try {
    return await generateWithAppwriteAI<GenerateGoalRoadmapOutput>(prompt, true);
  } catch (error) {
    console.error("Erro no Roadmap, usando plano de contingência:", error);
    return {
      roadmap: [
        {
          phaseTitle: "Fase 1: Iniciação",
          phaseDescription: "O sistema está processando os dados profundos da sua meta. Comece com o básico.",
          strategicMilestones: ["Estabelecer consistência inicial", "Completar as primeiras 5 missões diárias"]
        },
        {
          phaseTitle: "Fase 2: Ascensão",
          phaseDescription: "Evolução contínua baseada no seu desempenho inicial.",
          strategicMilestones: ["Aumentar a intensidade dos treinos", "Desbloquear novos ranks"]
        }
      ]
    };
  }
}


