
/**
 * @fileOverview Um agente de IA que gera uma versão SMART simplificada de uma meta com base em respostas.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';
import { retryWithBackoff, validateAIOutput, sanitizeText } from '@/lib/ai-utils';

const SmartGoalSchema = z.object({
  name: z.string().describe('O nome original da meta, conforme inserido pelo utilizador.'),
  specific: z.string().describe('O detalhe Específico (Specific) da meta.'),
  measurable: z.string().describe('O detalhe Mensurável (Measurable) da meta.'),
  achievable: z.string().describe('O detalhe Atingível (Achievable) da meta.'),
  relevant: z.string().describe('O detalhe Relevante (Relevant) da meta.'),
  timeBound: z.string().describe('O detalhe com Prazo (Time-bound) da meta.'),
});

const GenerateSimpleSmartGoalInputSchema = z.object({
  goalName: z.string().describe('O nome da meta inserida pelo utilizador.'),
});
export type GenerateSimpleSmartGoalInput = z.infer<typeof GenerateSimpleSmartGoalInputSchema>;

const GenerateSimpleSmartGoalOutputSchema = z.object({
  refinedGoal: SmartGoalSchema.describe('A meta SMART completa e detalhada.'),
  fallback: z.boolean().optional().describe("Indica se a resposta foi gerada usando um plano de fallback devido a um erro de IA."),
});
export type GenerateSimpleSmartGoalOutput = z.infer<typeof GenerateSimpleSmartGoalOutputSchema>;

export async function generateSimpleSmartGoal(
  input: GenerateSimpleSmartGoalInput
): Promise<GenerateSimpleSmartGoalOutput> {
  console.log("🚀 Server Action generateSimpleSmartGoal started", input);
  try {
    const prompt = `Você é um coach de produtividade de elite, mestre em transformar ideias em metas acionáveis.
Sua tarefa é pegar o nome de uma meta fornecida pelo utilizador e expandi-la para uma meta SMART completa.

Meta do Utilizador: "${input.goalName}"

Seja criativo, mas realista. Crie detalhes específicos, mensuráveis, atingíveis, relevantes e com prazo para a meta.
IMPORTANTE: O campo 'name' na resposta DEVE ser exatamente igual à "Meta do Utilizador" fornecida. Não modifique o nome.
Para o campo 'timeBound', defina um prazo realista e futuro (ex: "nos próximos 3 meses", "até ao final do ano fiscal atual"). Não use uma data específica com ano, como "até 31/12/2024".

Responda em formato JSON seguindo este esquema exato para o objeto refinedGoal:
{
  "name": "${input.goalName}",
  "specific": "...",
  "measurable": "...",
  "achievable": "...",
  "relevant": "...",
  "timeBound": "..."
}
`;
    console.log("📝 Generating Prompt...", prompt.substring(0, 50) + "...");
    const response = await retryWithBackoff(
      async () => await generateWithAppwriteAI<any>(prompt, true),
      3,
      1000,
      'Generate Simple SMART Goal'
    );
    console.log("✅ AI Response received:", response ? "Success" : "Empty");

    // Se o retorno for { refinedGoal: { ... } }, extraímos. Se for direto { ... }, usamos.
    const refinedData = response.refinedGoal || response;

    const refinedGoal = {
      name: sanitizeText(refinedData.name || input.goalName, 200),
      specific: sanitizeText(refinedData.specific, 500),
      measurable: sanitizeText(refinedData.measurable, 500),
      achievable: sanitizeText(refinedData.achievable, 500),
      relevant: sanitizeText(refinedData.relevant, 500),
      timeBound: sanitizeText(refinedData.timeBound, 200),
    };

    return { refinedGoal, fallback: false };
  } catch (error: any) {
    console.error("❌ Critical Error in generateSimpleSmartGoal:", error);
    console.error("Stack Trace:", error.stack);
    
    const fallbackGoal = {
        name: input.goalName,
        specific: `Definir e alcançar o objetivo: ${input.goalName}.`,
        measurable: 'Defina aqui os marcos e KPIs para medir o progresso.',
        achievable: 'Liste os passos e recursos necessários para tornar isto possível.',
        relevant: 'Descreva aqui porque esta meta é importante para si neste momento.',
        timeBound: 'Defina um prazo realista para a conclusão desta meta.',
    };

    return {
        refinedGoal: fallbackGoal,
        fallback: true,
    };
  }
}

