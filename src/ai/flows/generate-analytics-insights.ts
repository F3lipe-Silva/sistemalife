
/**
 * @fileOverview Um agente de IA que analisa os dados de progresso e gera insights.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const InsightSchema = z.object({
  title: z.string().describe("Um título curto e impactante para o insight (ex: 'Pico de Produtividade Matinal', 'Oportunidade de Equilíbrio')."),
  description: z.string().describe("Uma descrição detalhada do padrão observado nos dados."),
  suggestion: z.string().describe("Um conselho acionável e estratégico para o utilizador com base no insight."),
  icon: z.enum(['TrendingUp', 'Target', 'Activity', 'BarChart', 'Sparkles', 'Zap', 'ShieldCheck']).describe("O nome de um ícone da biblioteca lucide-react que melhor representa o insight."),
});

const GenerateAnalyticsInsightsInputSchema = z.object({
  metas: z.string().describe("Os objetivos do utilizador (metas ativas e concluídas) como uma string JSON."),
  missions: z.string().describe("O histórico completo de missões (épicas e diárias concluídas) como uma string JSON."),
});
export type GenerateAnalyticsInsightsInput = z.infer<typeof GenerateAnalyticsInsightsInputSchema>;

const GenerateAnalyticsInsightsOutputSchema = z.object({
  insights: z.array(InsightSchema).describe("Uma lista de 2 a 3 insights analíticos e estratégicos."),
});
export type GenerateAnalyticsInsightsOutput = z.infer<typeof GenerateAnalyticsInsightsOutputSchema>;

export async function generateAnalyticsInsights(
  input: GenerateAnalyticsInsightsInput
): Promise<GenerateAnalyticsInsightsOutput> {
  const prompt = `
    Você é o "Oráculo Analítico" do SISTEMA DE VIDA, um RPG da vida real. A sua especialidade é analisar dados de progresso e transformar números brutos em sabedoria estratégica.

    A sua tarefa é analisar os seguintes dados de um Caçador:
    - Metas (Ativas e Concluídas): ${input.metas}
    - Histórico de Missões Concluídas: ${input.missions}

    **DIRETIVAS PARA A ANÁLISE:**
    1.  **Identifique Padrões Significativos:** Procure por padrões interessantes nos dados.
    2.  **Gere de 2 a 3 Insights de Alta Qualidade:** Para cada padrão, crie um título, descrição, sugestão acionável e escolha um ícone.

    Responda em formato JSON seguindo este esquema:
    {
      "insights": [
        { "title": "...", "description": "...", "suggestion": "...", "icon": "..." }
      ]
    }
  `;

  return await generateWithAppwriteAI<GenerateAnalyticsInsightsOutput>(prompt, true);
}


