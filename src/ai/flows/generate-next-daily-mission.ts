
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
  userAttributes: z.record(z.number()).optional().describe("Os atributos do utilizador (força, inteligência, etc.)."),
  skillCategory: z.string().optional().describe("A categoria da habilidade associada (ex: 'Saúde & Fitness', 'Desenvolvimento de Carreira')."),
});
export type GenerateNextDailyMissionInput = z.infer<typeof GenerateNextDailyMissionInputSchema>;

const GenerateNextDailyMissionOutputSchema = z.object({
    nextMissionName: z.string().describe("O nome da próxima pequena missão diária. Deve ser muito específico (ex: 'Treino de Força Fundamental', 'Sessão de Estudo Focada')."),
    nextMissionDescription: z.string().describe("Uma breve descrição da missão diária, explicando o seu propósito em 1-2 frases."),
    xp: z.number().describe("A quantidade de XP para a nova missão."),
    fragments: z.number().describe("A quantidade de fragmentos (moeda do jogo) para a nova missão."),
    learningResources: z.array(z.string()).optional().describe("Uma lista de até 2 recursos TEXTUAIS ou artigos para consultar (ex: 'Documentação oficial do React sobre hooks', 'MDN Web Docs sobre Flexbox CSS'). NUNCA sugira vídeos ou conteúdo do YouTube."),
    subTasks: z.array(SubTaskSchema).describe("Uma lista de 1 a 5 sub-tarefas que compõem a missão diária. Estas devem ser as ações concretas que o utilizador irá realizar e acompanhar."),
    missionType: z.enum(['PROGRESSION', 'REVIEW', 'REST', 'CHALLENGE']).optional().describe("O tipo de missão gerada."),
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

    const attributesPrompt = input.userAttributes 
        ? `ATRIBUTOS DO JOGADOR: ${JSON.stringify(input.userAttributes)}. Categoria da Habilidade: ${input.skillCategory || 'Geral'}.
Foque a missão em atividades que façam sentido para estes atributos e categoria (ex: se a categoria for 'Saúde' e a força for alta, sugira algo desafiador de força).`
        : '';

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


    const finalPrompt = `Você é o 'Sistema' de um RPG da vida real. O utilizador (Nível ${input.userLevel}) está na missão épica "${input.rankedMissionName}", para a meta "${input.metaName}". 
${historyPrompt} 
${feedbackPrompt} 
${deadlinePrompt}
${attributesPrompt}

Sua tarefa é criar a PRÓXIMA missão diária. 

**VARIEDADE DE MISSÕES (IMPORTANTE):**
Escolha um tipo de missão para gerar:
- **PROGRESSION** (70% das vezes): Próximo passo lógico para a meta.
- **REVIEW** (15% das vezes): Revisar ou consolidar algo já feito no histórico.
- **CHALLENGE** (10% das vezes): Um "pico" de dificuldade para testar os limites do utilizador.
- **REST** (5% das vezes): Focar em organização, reflexão ou uma tarefa de baixa intensidade relacionada à meta para evitar burnout.

**EXEMPLOS DE ESTRUTURA:**
1. Meta: "Correr 5km" -> Nome: "Sessão de Intervalos" | Descrição: "Alternar entre corrida rápida e trote para melhorar a resistência." | Sub-tarefas: [{"name": "Corrida rápida", "target": 5, "unit": "minutos"}, {"name": "Trote de recuperação", "target": 10, "unit": "minutos"}]
2. Meta: "Aprender Python" -> Nome: "Refatoração de Código" | Descrição: "Revisar um script antigo e aplicar os novos conceitos aprendidos." | Sub-tarefas: [{"name": "Identificar redundâncias", "target": 3, "unit": "blocos"}, {"name": "Reescrever funções", "target": 2, "unit": "funções"}]

**DIRETIVA DE DIFICULDADE:** A dificuldade DEVE escalar com o nível do utilizador. Um Caçador de nível ${input.userLevel} precisa de um desafio maior do que um de nível 1.

**REGRAS GERAIS:**
1.  **Nome da Missão:** Criativo e temático.
2.  **Sub-tarefas (1 a 5):** Ações concretas, mensuráveis com 'target' e 'unit'.
3.  **Recursos de Aprendizagem:** Até 2 recursos TEXTUAIS. NUNCA sugira vídeos.
`;

    const MissionSchema = z.object({
        nextMissionName: z.string(),
        nextMissionDescription: z.string(),
        learningResources: z.array(z.string()).optional(),
        subTasks: z.array(SubTaskSchema),
        missionType: z.enum(['PROGRESSION', 'REVIEW', 'REST', 'CHALLENGE']).optional(),
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

      const rewards = await generateMissionRewards({
        missionText: sanitizedName,
        missionDescription: sanitizedDescription,
        subTasks: output!.subTasks,
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
        missionType: output!.missionType,
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
        missionText: fallbackName,
        missionDescription: fallbackDescription,
        subTasks: fallbackSubTasks,
        userLevel: input.userLevel,
      });

      return {
        nextMissionName: fallbackName,
        nextMissionDescription: fallbackDescription,
        xp: rewards.xp,
        fragments: rewards.fragments,
        learningResources: [],
        subTasks: fallbackSubTasks,
        missionType: 'PROGRESSION',
      };
    }
  }
);
