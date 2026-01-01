
/**
 * @fileOverview Um agente de IA que sugere uma rotina diária equilibrada.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const RoutineItemSchema = z.object({
  id: z.number(),
  start_time: z.string().describe("Horário de início no formato HH:MM."),
  end_time: z.string().describe("Horário de término no formato HH:MM."),
  activity: z.string().describe("Nome da atividade."),
});

const GenerateRoutineSuggestionInputSchema = z.object({
  routine: z.array(RoutineItemSchema).describe("A lista de atividades e horários da rotina para o dia especificado."),
  dayOfWeek: z.string().describe("O dia da semana para o qual a sugestão está a ser pedida (ex: 'segunda-feira')."),
  missionName: z.string().describe("O nome da missão diária para a qual se precisa de uma sugestão."),
  missionDescription: z.string().describe("A descrição da missão diária."),
});
export type GenerateRoutineSuggestionInput = z.infer<typeof GenerateRoutineSuggestionInputSchema>;

const GenerateRoutineSuggestionOutputSchema = z.object({
  suggestionText: z.string().describe('A sugestão gerada pela IA sobre quando e como realizar a missão. Ex: "Sugestão: Na sua segunda-feira, que tal realizar esta missão entre as 13:30 e as 14:00..."'),
  suggestedStartTime: z.string().describe("O horário de início sugerido no formato HH:MM."),
  suggestedEndTime: z.string().describe("O horário de término sugerido no formato HH:MM."),
  modifiedBlockId: z.number().optional().describe("O ID do item da rotina que será modificado (dividido) pela sugestão. Se a sugestão for para um tempo livre, este campo deve ser nulo."),
});
export type GenerateRoutineSuggestionOutput = z.infer<typeof GenerateRoutineSuggestionOutputSchema>;

export async function generateRoutineSuggestion(
  input: GenerateRoutineSuggestionInput
): Promise<GenerateRoutineSuggestionOutput> {
  const prompt = `
      Você é o 'Sistema', um estratega de produtividade de elite. Sua tarefa é analisar a rotina de um utilizador para um dia específico e a sua missão atual para encontrar o momento perfeito para a execução.

      A missão atual do utilizador é:
      - Nome: "${input.missionName}"
      - Descrição: "${input.missionDescription}"

      Esta é a rotina do utilizador para ${input.dayOfWeek} (cada item possui um ID único):
      ${JSON.stringify(input.routine, null, 2)}

      Analise a missão para determinar a sua natureza e o tempo estimado necessário.
      
      Siga esta ordem de prioridade:
      1. Incorporação Contextual (Prioridade Máxima)
      2. Agrupamento de Hábitos (Habit Stacking)
      3. Encontrar Lacunas (Último Recurso)

      Responda em formato JSON seguindo este esquema:
      {
        "suggestionText": "...",
        "suggestedStartTime": "HH:MM",
        "suggestedEndTime": "HH:MM",
        "modifiedBlockId": 123 ou null
      }
  `;

  return await generateWithAppwriteAI<GenerateRoutineSuggestionOutput>(prompt, true);
}

