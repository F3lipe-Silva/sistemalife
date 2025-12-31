'use server';
/**
 * @fileOverview Um agente de IA que gera a próxima missão diária com base no progresso.
 *
 * - generateNextDailyMission - Gera a próxima missão diária atómica.
 * - GenerateNextDailyMissionInput - O tipo de entrada para a função.
 * - GenerateNextDailyMissionOutput - O tipo de retorno para a função.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import {generateMissionRewards} from './generate-mission-rewards';
import {z} from 'zod';
import { retryWithBackoff, validateAIOutput, sanitizeUrls, sanitizeText, withTimeout, validateSubTasks } from '@/lib/ai-utils';

const SubTaskSchema = z.object({
  name: z.string().describe("O nome da sub-tarefa específica e acionável (ex: 'Ler um capítulo', 'Fazer 20 flexões')."),
  target: z.number().describe("A meta numérica para esta sub-tarefa (ex: 1, 20)."),
  unit: z.string().optional().describe("A unidade de medida, se aplicável (ex: 'páginas', 'repetições', 'minutos', 'km')."),
  current: z.number().optional().describe("O progresso atual da sub-tarefa, que deve ser inicializado como 0.")
});


const GenerateNextDailyMissionInputSchema = z.object({
  rankedMissionName: z.string().describe("O nome da missão épica ou ranqueada principal."),
  metaName: z.string().describe("A meta de longo prazo associada a esta missão."),
  goalDeadline: z.string().nullable().optional().describe("A data final para a meta (prazo), no formato YYYY-MM-DD."),
  history: z.string().describe("O histórico das últimas missões diárias concluídas para dar contexto."),
  userLevel: z.number().describe("O nível atual do utilizador para ajustar a dificuldade."),
  userStats: z.record(z.string(), z.number()).optional().describe("Estatísticas do jogador (Força, Inteligência, etc.) para personalizar o tipo de desafio."),
  timeOfDay: z.string().optional().describe("O período do dia atual (ex: 'morning', 'afternoon', 'night') para evitar sugerir tarefas inadequadas."),
  feedback: z.string().optional().describe("Feedback do utilizador sobre a missão anterior (ex: 'muito fácil', 'muito difícil', ou um texto descritivo) para calibrar a próxima."),
});
export type GenerateNextDailyMissionInput = z.infer<typeof GenerateNextDailyMissionInputSchema>;

const GenerateNextDailyMissionOutputSchema = z.object({
    nextMissionName: z.string().describe("O nome da próxima pequena missão diária. Deve ser muito específico (ex: 'Treino de Força Fundamental', 'Sessão de Estudo Focada')."),
    nextMissionDescription: z.string().describe("Uma breve descrição da missão diária, explicando o seu propósito em 1-2 frases."),
    xp: z.number().describe("A quantidade de XP para a nova missão."),
    fragments: z.number().describe("A quantidade de fragmentos (moeda do jogo) para a nova missão."),
    learningResources: z.array(z.string()).optional().describe("Uma lista de até 2 recursos TEXTUAIS ou artigos para consultar (ex: 'Documentação oficial do React sobre hooks', 'MDN Web Docs sobre Flexbox CSS'). NUNCA sugira vídeos ou conteúdo do YouTube."),
    subTasks: z.array(SubTaskSchema).describe("Uma lista de 1 a 5 sub-tarefas que compõem a missão diária. Estas devem ser as ações concretas que o utilizador irá realizar e acompanhar."),
});
export type GenerateNextDailyMissionOutput = z.infer<typeof GenerateNextDailyMissionOutputSchema>;

export async function generateNextDailyMission(
  input: GenerateNextDailyMissionInput
): Promise<GenerateNextDailyMissionOutput> {
  const historyPrompt = input.history
    ? `O histórico de missões concluídas recentemente é: ${input.history}`
    : 'Esta é a primeira missão para este objetivo.';

  const feedbackPrompt = input.feedback
      ? `DIRETIVA DE FEEDBACK (CRÍTICO): O utilizador relatou: "${input.feedback}".
- Se 'muito fácil': Aumente a dificuldade, volume ou complexidade IMEDIATAMENTE.
- Se 'muito difícil': Reduza a carga ou quebre a tarefa em passos menores.
- Se 'perfeito': Mantenha o ritmo atual.`
      : 'Nenhum feedback recente. Mantenha a progressão padrão.';

  let deadlinePrompt = '';
  if (input.goalDeadline) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const deadline = new Date(input.goalDeadline);
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0) {
          deadlinePrompt = `STATUS DO PRAZO: Faltam ${diffDays} dias. ${diffDays < 14 ? 'URGÊNCIA ALTA: Aumente a intensidade para garantir a conclusão.' : 'Ritmo: Sustentável.'}`;
      }
  }

  const statsPrompt = input.userStats 
    ? `ATRIBUTOS DO JOGADOR: ${JSON.stringify(input.userStats)}. Use isso para personalizar o desafio (ex: Alta Força -> Desafios físicos mais intensos; Alta Inteligência -> Tarefas de estudo mais complexas).`
    : '';

  const timePrompt = input.timeOfDay
    ? `HORA ATUAL: ${input.timeOfDay}. Ajuste a natureza da tarefa (ex: Evite exercícios intensos ou barulhentos tarde da noite ('night'); Foco mental é melhor pela manhã ('morning')).`
    : '';

  const finalPrompt = `
IDENTITY: Você é o 'SISTEMA' (como em Solo Leveling). Você é frio, objetivo, autoritário, mas focado na evolução máxima do "JOGADOR" (o utilizador).
CONTEXTO: JOGADOR Nível ${input.userLevel}. Missão Épica: "${input.rankedMissionName}". Meta Principal: "${input.metaName}".
${historyPrompt}
${feedbackPrompt}
${deadlinePrompt}
${statsPrompt}
${timePrompt}

OBJETIVO: Gere a PRÓXIMA MISSÃO DIÁRIA. Ela deve ser um passo lógico, acionável e desafiador em direção à Meta Principal.

DIRETIVAS DE GERAÇÃO:
1. **Nome da Missão:** Use linguagem de RPG/Sistema. Imperativo. (ex: "Executar Protocolo de Estudo", "Iniciar Treino de Hipertrofia").
2. **Adaptação:** Se for 'noite', sugira tarefas de preparação, revisão ou relaxamento ativo, a menos que o utilizador tenha hábitos noturnos claros.
3. **Escalabilidade:** Para Nível ${input.userLevel}, as tarefas não podem ser triviais. Devem exigir esforço real.
4. **Sub-tarefas:**
    - Devem ser QUANTIFICÁVEIS (Target numérico obrigatório).
    - Devem ser ATÔMICAS (Uma ação clara).

Gere a resposta em JSON estrito:
{
  "nextMissionName": "Nome Gamificado da Missão",
  "nextMissionDescription": "Descrição direta e motivadora do Sistema.",
  "learningResources": ["URL ou Nome de Livro (apenas se for tarefa de estudo)"],
  "subTasks": [{"name": "Ação específica", "target": 10, "unit": "minutos/reps/páginas", "current": 0}]
}
`;

  try {
    const output = await withTimeout(
      retryWithBackoff(
        async () => await generateWithAppwriteAI<any>(finalPrompt, true),
        3,
        1000,
        'Generate Next Daily Mission'
      ),
      30000,
      'Geração de missão excedeu 30 segundos'
    );

      // Validate output
      validateAIOutput(output, ['nextMissionName', 'nextMissionDescription', 'subTasks'], 'Next Daily Mission');
      
      if (!validateSubTasks(output!.subTasks)) {
        throw new Error('AI generated mission with invalid subtasks structure');
      }

      // Sanitize the output
      const sanitizedName = sanitizeText(output!.nextMissionName, 100);
      const sanitizedDescription = sanitizeText(output!.nextMissionDescription, 500);
      const sanitizedResources = sanitizeUrls(output!.learningResources);

      const missionTextForRewards = `${sanitizedName}: ${output!.subTasks.map((st: { name: string }) => st.name).join(', ')}`;
      const rewards = await generateMissionRewards({
        missionText: missionTextForRewards,
        userLevel: input.userLevel,
      });
      
      const finalXp = rewards.xp;
      const finalFragments = rewards.fragments;

      const subTasksWithProgress = output!.subTasks.map((st: any) => ({...st, current: 0 }));

      return {
        nextMissionName: sanitizedName,
        nextMissionDescription: sanitizedDescription,
        xp: finalXp,
        fragments: finalFragments,
        learningResources: sanitizedResources,
        subTasks: subTasksWithProgress,
      };
    } catch (error) {
      console.error('Failed to generate next daily mission, using fallback:', error);
      
      // Fallback: Generate a simple continuation mission
      const fallbackName = `Continuar: ${input.rankedMissionName}`;
      const fallbackDescription = `Continue progredindo na sua meta "${input.metaName}" com esta tarefa.`;
      const fallbackSubTasks = [{
        name: 'Trabalhar na meta',
        target: 1,
        unit: 'sessão',
        current: 0
      }];
      
      const rewards = await generateMissionRewards({
        missionText: `${fallbackName}: ${fallbackSubTasks[0].name}`,
        userLevel: input.userLevel,
      });

      return {
        nextMissionName: fallbackName,
        nextMissionDescription: fallbackDescription,
        xp: rewards.xp,
        fragments: rewards.fragments,
        learningResources: [],
        subTasks: fallbackSubTasks,
      };
    }
}