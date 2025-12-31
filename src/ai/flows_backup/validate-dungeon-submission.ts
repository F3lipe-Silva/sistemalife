
'use server';
/**
 * @fileOverview Um agente de IA que valida as submissões dos Caçadores na Masmorra.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const ValidateDungeonSubmissionInputSchema = z.object({
    skillName: z.string(),
    challengeName: z.string(),
    challengeDescription: z.string(),
    successCriteria: z.string(),
    userSubmission: z.string(),
});
export type ValidateDungeonSubmissionInput = z.infer<typeof ValidateDungeonSubmissionInputSchema>;

const ValidateDungeonSubmissionOutputSchema = z.object({
  valid: z.boolean().describe("True se a submissão provar que o desafio foi completado, false caso contrário."),
  feedback: z.string().describe("Uma mensagem curta e temática do Sistema validando ou corrigindo o Caçador."),
});
export type ValidateDungeonSubmissionOutput = z.infer<typeof ValidateDungeonSubmissionOutputSchema>;

export async function validateDungeonSubmission(
  input: ValidateDungeonSubmissionInput
): Promise<ValidateDungeonSubmissionOutput> {
  const prompt = `
    Você é o "Mestre da Masmorra" e sua tarefa é VALIDAR a submissão de um Caçador.

    **CONTEXTO DO DESAFIO:**
    - Habilidade: ${input.skillName}
    - Desafio: ${input.challengeName}
    - O que era pedido: ${input.challengeDescription}
    - Critério de Verificação: ${input.successCriteria}

    **SUBMISSÃO DO CAÇADOR:**
    "${input.userSubmission}"

    **SUA TAREFA:**
    Analise se a submissão do Caçador satisfaz genuinamente o que foi pedido.
    - Se a resposta for genérica, aleatória ou não demonstrar o cumprimento do desafio, marque como "valid: false".
    - Se a resposta demonstrar esforço e cumprimento do critério, marque como "valid: true".

    Responda APENAS com um objeto JSON válido:
    {
      "valid": boolean,
      "feedback": "Sua mensagem aqui (curta, épica e direta)"
    }
  `;

  return await generateWithAppwriteAI<ValidateDungeonSubmissionOutput>(prompt, true);
}
