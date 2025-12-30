
'use server';
/**
 * @fileOverview Um agente de IA que ajuda a definir metas SMART de forma conversacional.
 *
 * - generateSmartGoalQuestion - Faz a próxima pergunta para refinar uma meta.
 * - GenerateSmartGoalQuestionInput - O tipo de entrada para a função.
 * - GenerateSmartGoalQuestionOutput - O tipo de retorno para a função.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const SmartGoalSchema = z.object({
  name: z.string().describe('O nome inicial ou atual da meta.'),
  specific: z.string().optional().describe('O detalhe Específico (Specific) da meta.'),
  measurable: z.string().optional().describe('O detalhe Mensurável (Measurable) da meta.'),
  achievable: z.string().optional().describe('O detalhe Atingível (Achievable) da meta.'),
  relevant: z.string().optional().describe('O detalhe Relevante (Relevant) da meta.'),
  timeBound: z.string().optional().describe('O detalhe com Prazo (Time-bound) da meta.'),
});

const GenerateSmartGoalQuestionInputSchema = z.object({
    goal: SmartGoalSchema,
    history: z.array(z.object({
        question: z.string(),
        answer: z.string()
    })).optional().describe("Histórico da conversa atual para dar contexto.")
});
export type GenerateSmartGoalQuestionInput = z.infer<typeof GenerateSmartGoalQuestionInputSchema>;

const GenerateSmartGoalQuestionOutputSchema = z.object({
  nextQuestion: z.string().optional().describe('A próxima pergunta a ser feita ao utilizador para refinar a meta.'),
  exampleAnswers: z.array(z.string()).optional().describe('Uma lista de três exemplos de respostas para a pergunta feita.'),
  isComplete: z.boolean().describe('Indica se a definição da meta SMART está concluída.'),
  refinedGoal: SmartGoalSchema.optional().describe('A meta final refinada após todas as perguntas terem sido respondidas.'),
});
export type GenerateSmartGoalQuestionOutput = z.infer<typeof GenerateSmartGoalQuestionOutputSchema>;

export async function generateSmartGoalQuestion(
  input: GenerateSmartGoalQuestionInput
): Promise<GenerateSmartGoalQuestionOutput> {
  const { goal, history } = input;
  let nextStep = '';
  if (!goal.specific) nextStep = 'specific';
  else if (!goal.measurable) nextStep = 'measurable';
  else if (!goal.achievable) nextStep = 'achievable';
  else if (!goal.relevant) nextStep = 'relevant';
  else if (!goal.timeBound) nextStep = 'timeBound';

  if (!nextStep) {
      return { isComplete: true, refinedGoal: goal };
  }

  const historyString = history ? history.map(h => `- Pergunta: "${h.question}" / Resposta: "${h.answer}"`).join('\n') : '';

  const prompt = `
      Você é um coach de produtividade de elite.
      O utilizador está a definir a meta: "${goal.name}".
      Estado atual: S:${goal.specific}, M:${goal.measurable}, A:${goal.achievable}, R:${goal.relevant}, T:${goal.timeBound}
      ${historyString}

      Formule a próxima pergunta para o componente '${nextStep}'.

      Responda em formato JSON seguindo este esquema:
      {
        "nextQuestion": "...",
        "exampleAnswers": ["...", "...", "..."]
      }
  `;

  const output = await generateWithAppwriteAI<any>(prompt, true);
  
  return {
      isComplete: false,
      nextQuestion: output.nextQuestion,
      exampleAnswers: output.exampleAnswers,
  };
}

