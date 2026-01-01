
/**
 * @fileOverview Um agente de IA que gera a primeira missão épica para uma nova meta.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import {generateMissionRewards} from './generate-mission-rewards';
import {z} from 'zod';
import { retryWithBackoff, validateAIOutput, sanitizeUrls, sanitizeText, withTimeout, validateSubTasks } from '@/lib/ai-utils';

const EpicMissionSchema = z.object({
    epicMissionName: z.string().describe("O nome temático e inspirador para a Missão Épica (ex: 'A Senda do Maratonista')."),
    epicMissionDescription: z.string().describe("Uma breve descrição da Missão Épica, explicando o seu objetivo principal."),
    rank: z.enum(['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']).describe("O rank sugerido para esta missão específica na progressão."),
    level_requirement: z.number().describe("O nível mínimo que o Caçador deve ter para esta missão ser desbloqueada.")
});

const SubTaskSchema = z.object({
  name: z.string().describe("O nome da sub-tarefa específica e acionável (ex: 'Ler um capítulo', 'Fazer 20 flexões')."),
  target: z.number().describe("A meta numérica para esta sub-tarefa (ex: 1, 20)."),
  unit: z.string().optional().describe("A unidade de medida, se aplicável (ex: 'páginas', 'repetições', 'minutos', 'km')."),
  current: z.number().optional().describe("O progresso atual da sub-tarefa, que deve ser inicializado como 0.")
});

const FirstDailyMissionSchema = z.object({
    firstDailyMissionName: z.string().describe("O nome da primeira missão diária. Deve ser um primeiro passo lógico e específico para a primeira missão épica da lista."),
    firstDailyMissionDescription: z.string().describe("Uma breve descrição da primeira missão diária."),
    firstDailyMissionSubTasks: z.array(SubTaskSchema).describe("A lista de 1 a 3 sub-tarefas para a primeira missão diária."),
    firstDailyMissionLearningResources: z.array(z.string()).optional().describe("Recursos de aprendizagem para a primeira missão diária (textos descritivos ou URLs)."),
});

const GenerateInitialEpicMissionInputSchema = z.object({
  goalName: z.string().describe("O nome da nova meta SMART do utilizador."),
  goalDetails: z.string().describe("Os detalhes completos (SMART) da meta do utilizador."),
  userLevel: z.number().describe("O nível atual do utilizador para ajudar a calibrar a dificuldade."),
});
export type GenerateInitialEpicMissionInput = z.infer<typeof GenerateInitialEpicMissionInputSchema>;

const GenerateInitialEpicMissionOutputSchema = z.object({
    progression: z.array(EpicMissionSchema).describe("Uma lista de 3 a 5 missões épicas que representam uma clara progressão de dificuldade."),
    firstDailyMissionName: z.string().describe("O nome da primeira missão diária. Deve ser um primeiro passo lógico e específico para a primeira missão épica da lista."),
    firstDailyMissionDescription: z.string().describe("Uma breve descrição da primeira missão diária."),
    firstDailyMissionXp: z.number().describe("A quantidade de XP para a primeira missão."),
    firstDailyMissionFragments: z.number().describe("A quantidade de fragmentos (moeda do jogo) para a primeira missão."),
    firstDailyMissionSubTasks: z.array(SubTaskSchema).describe("A lista de sub-tarefas para a primeira missão diária."),
    firstDailyMissionLearningResources: z.array(z.string()).optional().describe("Recursos de aprendizagem para a primeira missão diária (textos descritivos ou URLs)."),
    fallback: z.boolean().optional().describe("Indica se a resposta foi gerada usando um plano de fallback devido a um erro de IA."),
});
export type GenerateInitialEpicMissionOutput = z.infer<typeof GenerateInitialEpicMissionOutputSchema>;

export async function generateInitialEpicMission(
  input: GenerateInitialEpicMissionInput
): Promise<GenerateInitialEpicMissionOutput> {
  try {
    const finalPrompt = `Você é o "Planeador Mestre" do Sistema de um RPG da vida real. A sua função é analisar uma nova meta do utilizador e criar uma "Árvore de Progressão" completa e equilibrada.

Utilizador: Nível ${input.userLevel}
Nova Meta: "${input.goalName}"
Detalhes da Meta (SMART): ${input.goalDetails}

A sua tarefa é:
1.  **Criar Árvore de Progressão:** Gere uma lista de 3 a 5 "Missões Épicas" em sequência. Comece com Rank 'F'.
2.  **Criar a Primeira Missão Diária:** Com base na *primeira* missão épica (Rank F), gere a *primeira* missão diária atómica.

Responda em formato JSON seguindo este esquema:
{
  "progression": [
    { "epicMissionName": "...", "epicMissionDescription": "...", "rank": "F", "level_requirement": 1 }
  ],
  "firstDailyMission": {
    "firstDailyMissionName": "...",
    "firstDailyMissionDescription": "...",
    "firstDailyMissionSubTasks": [{"name": "...", "target": 1, "unit": "..."}],
    "firstDailyMissionLearningResources": ["..."]
  }
}
`;

    const output = await withTimeout(
      retryWithBackoff(
        async () => await generateWithAppwriteAI<any>(finalPrompt, true),
        3,
        1000,
        'Generate Initial Epic Mission'
      ),
      30000,
      'Geração de missão inicial excedeu 30 segundos'
    );

    // Validate output
    validateAIOutput(output, ['progression', 'firstDailyMission'], 'Initial Epic Mission');
    
    // Sanitize outputs
    const sanitizedName = sanitizeText(output.firstDailyMission.firstDailyMissionName, 100);
    const sanitizedDescription = sanitizeText(output.firstDailyMission.firstDailyMissionDescription, 500);
    const sanitizedResources = sanitizeUrls(output.firstDailyMission.firstDailyMissionLearningResources);

    const missionTextForRewards = `${sanitizedName}: ${output.firstDailyMission.firstDailyMissionSubTasks.map((st: any) => st.name).join(', ')}`;
    const rewards = await generateMissionRewards({
        missionText: missionTextForRewards,
        userLevel: input.userLevel,
    });

    return {
        progression: output.progression,
        firstDailyMissionName: sanitizedName,
        firstDailyMissionDescription: sanitizedDescription,
        firstDailyMissionXp: rewards.xp,
        firstDailyMissionFragments: rewards.fragments,
        firstDailyMissionSubTasks: output.firstDailyMission.firstDailyMissionSubTasks.map((st: any) => ({...st, current: 0 })),
        firstDailyMissionLearningResources: sanitizedResources,
        fallback: false,
    };
  } catch (error) {
    console.error("Falha ao gerar árvore de progressão, acionando fallback:", error);

    const fallbackProgression = [{
        epicMissionName: `Missão Épica: ${input.goalName}`,
        epicMissionDescription: `Uma grande jornada em direção ao seu objetivo: ${input.goalName}.`,
        rank: 'F' as const,
        level_requirement: 1,
    }];

    const fallbackDailyMissionName = `Início: ${input.goalName}`;
    const fallbackDailyMissionDescription = `Dê o primeiro passo prático na sua jornada de ${input.goalName}.`;
    const fallbackDailyMissionSubTasks = [{ 
        name: `Primeira sessão de ${input.goalName}`, 
        target: 1, 
        unit: 'unidade', 
        current: 0 
    }];
    const missionText = `${fallbackDailyMissionName}: Completar o primeiro passo`;
    const {xp, fragments} = await generateMissionRewards({ missionText, userLevel: input.userLevel });

    return {
        progression: fallbackProgression,
        firstDailyMissionName: fallbackDailyMissionName,
        firstDailyMissionDescription: fallbackDailyMissionDescription,
        firstDailyMissionXp: xp,
        firstDailyMissionFragments: fragments,
        firstDailyMissionSubTasks: fallbackDailyMissionSubTasks,
        firstDailyMissionLearningResources: [],
        fallback: true,
    };
  }
}

