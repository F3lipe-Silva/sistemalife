
'use server';
/**
 * @fileOverview Um agente de IA que gera a próxima missão diária com base no progresso.
 *
 * - generateNextDailyMission - Gera a próxima missão diária atómica.
 * - GenerateNextDailyMissionInput - O tipo de entrada para a função.
 * - GenerateNextDailyMissionOutput - O tipo de retorno para a função.
 */

import {ai} from '@/ai/genkit';
import {generateMissionRewards} from './generate-mission-rewards';
import {z} from 'genkit';
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
  return generateNextDailyMissionFlow(input);
}

const generateNextDailyMissionFlow = ai.defineFlow(
  {
    name: 'generateNextDailyMissionFlow',
    inputSchema: GenerateNextDailyMissionInputSchema,
    outputSchema: GenerateNextDailyMissionOutputSchema,
  },
  async (input) => {
    const historyPrompt = input.history
      ? `O histórico de missões concluídas recentemente é: ${input.history}`
      : 'Esta é a primeira missão para este objetivo.';

    const feedbackPrompt = input.feedback
        ? `DIRETIVA DE FEEDBACK (MAIS IMPORTANTE): O utilizador deu um feedback sobre a última missão: "${input.feedback}". Leve isto em consideração como a principal diretriz para a dificuldade.
- Se o feedback for 'muito fácil', aumente a complexidade ou a quantidade nas sub-tarefas significativamente. Considere criar uma tarefa que já contribua para a próxima Missão Épica, acelerando a progressão.
- Se o feedback for 'muito difícil', reduza drasticamente a complexidade. Crie uma missão mais simples ou quebre a tarefa anterior num passo ainda menor.
- Se o feedback for 'perfeito' ou descritivo, mantenha uma progressão natural e lógica.`
        : 'Nenhum feedback foi dado. Prossiga com uma progressão natural.';

    let deadlinePrompt = '';
    if (input.goalDeadline) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const deadline = new Date(input.goalDeadline);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0) {
            deadlinePrompt = `DIRETIVA DE PRAZO: A data de hoje é ${today.toLocaleDateString()}. A meta final tem um prazo. Faltam ${diffDays} dias. Se o tempo for curto (menos de 14 dias), sugira uma missão um pouco mais ambiciosa ou impactante para garantir que o objetivo seja alcançado a tempo. Se o prazo estiver confortável (mais de 30 dias), mantenha um ritmo sustentável.`;
        }
    }


    const finalPrompt = `Você é o 'Sistema' de um RPG da vida real. O utilizador (Nível ${input.userLevel}) está na missão épica "${input.rankedMissionName}", para a meta "${input.metaName}". ${historyPrompt} ${feedbackPrompt} ${deadlinePrompt}
Sua tarefa é criar a PRÓXIMA missão diária. A missão deve ser uma lista de objetivos claros e mensuráveis.

**DIRETIVA DE DIFICULDADE (MUITO IMPORTANTE):** A dificuldade da missão DEVE escalar com o nível do utilizador. Um Caçador de nível ${input.userLevel} precisa de um desafio maior do que um de nível 1. Ajuste a complexidade e a quantidade (target) das sub-tarefas para serem apropriadas para este nível.

**REGRAS GERAIS:**
1.  **Nome da Missão:** Crie um nome geral e inspirador para a missão diária.
2.  **Descrição da Missão:** Escreva uma breve descrição (1-2 frases) que explique o propósito da missão diária.
3.  **Sub-tarefas (O MAIS IMPORTANTE):** Crie de 1 a 5 sub-tarefas. ESTAS são as ações que o utilizador irá realizar.
    *   O **NOME** da sub-tarefa deve ser a ação concreta (ex: "Caminhada leve", "Escrever código de teste").
    *   Defina um **'target'** numérico claro para cada sub-tarefa.
    *   Defina uma **'unit'** (unidade) quando apropriado (ex: "minutos", "repetições", "páginas", "problemas").
4.  **Recursos de Aprendizagem (Opcional e IMPORTANTE):** Se a missão envolver conhecimento técnico, forneça até 2 **RECURSOS TEXTUAIS** como documentação oficial, artigos ou guias. NUNCA sugira vídeos, tutoriais do YouTube ou conteúdo em vídeo.
    *   **EXEMPLO BOM:** "Documentação oficial de React Hooks"
    *   **EXEMPLO BOM:** "MDN Web Docs: CSS Flexbox Guide"
    *   **EXEMPLO BOM:** "Artigo: Como usar Flexbox no desenvolvimento web"
    *   **EXEMPLO MAU:** "Tutorial em vídeo de React" (NÃO FAÇA ISTO)
    *   **EXEMPLO MAU:** "https://some-random-blog.com/react-hooks" (NÃO FAÇA ISTO)

Gere uma missão que seja o próximo passo lógico e atómico. Não repita missões do histórico.
`;

    const MissionSchema = z.object({
        nextMissionName: z.string(),
        nextMissionDescription: z.string(),
        learningResources: z.array(z.string()).optional(),
        subTasks: z.array(SubTaskSchema),
    });

    try {
      const {output} = await withTimeout(
        retryWithBackoff(
          async () => await ai.generate({
            prompt: finalPrompt,
            model: 'googleai/gemini-2.5-flash',
            output: {schema: MissionSchema},
          }),
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

      const missionTextForRewards = `${sanitizedName}: ${output!.subTasks.map(st => st.name).join(', ')}`;
      const rewards = await generateMissionRewards({
        missionText: missionTextForRewards,
        userLevel: input.userLevel,
      });
      
      const finalXp = rewards.xp;
      const finalFragments = rewards.fragments;

      const subTasksWithProgress = output!.subTasks.map(st => ({...st, current: 0 }));

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
);
