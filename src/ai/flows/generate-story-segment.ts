/**
 * @fileOverview Um agente de IA que gera segmentos de história (lore) personalizados.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';
import { retryWithBackoff, validateAIOutput, sanitizeText } from '@/lib/ai-utils';

const StoryChoiceSchema = z.object({
  id: z.string().describe("Um ID único curto para a escolha (ex: 'lutar', 'fugir', 'negociar')."),
  text: z.string().describe("O texto da escolha que o utilizador verá (ex: 'Sacar a espada e atacar', 'Tentar conversar com a criatura')."),
  consequenceHint: z.string().describe("Uma dica interna para a IA sobre a consequência provável desta escolha (ex: 'Leva a um combate difícil', 'Pode desbloquear uma rota diplomática')."),
});

const GenerateStorySegmentInputSchema = z.object({
  userProfile: z.string().describe("Resumo do perfil do utilizador (nome, classe/rank, nível)."),
  recentEvents: z.string().describe("Eventos recentes (missões completadas, níveis ganhos, conquistas)."),
  storyContext: z.string().describe("Resumo da história até agora e o arco atual."),
  userChoice: z.string().optional().describe("A escolha que o utilizador fez no segmento anterior (se houver)."),
  preferredGenre: z.string().optional().describe("O género preferido para este segmento (ex: 'Ação', 'Romance', 'Terror', 'Mistério'). Se vazio, a IA decide."),
  isNSFW: z.boolean().optional().describe("Se verdadeiro, permite conteúdo adulto, violento ou explícito sem censura."),
});

export type GenerateStorySegmentInput = z.infer<typeof GenerateStorySegmentInputSchema>;

const GenerateStorySegmentOutputSchema = z.object({
  title: z.string().describe("Um título evocativo para este segmento da história."),
  content: z.string().describe("O texto narrativo do segmento. Deve ser envolvente, bem escrito e com estilo de light novel/manhwa."),
  choices: z.array(StoryChoiceSchema).describe("2 a 3 escolhas para o utilizador fazer a seguir."),
  newSummary: z.string().describe("Um resumo atualizado da história incluindo este novo segmento, para ser usado como contexto futuro."),
  genre: z.string().describe("O género predominante deste segmento gerado."),
});

export type GenerateStorySegmentOutput = z.infer<typeof GenerateStorySegmentOutputSchema>;

export async function generateStorySegment(
  input: GenerateStorySegmentInput
): Promise<GenerateStorySegmentOutput> {
  const genrePrompt = input.preferredGenre 
    ? `O género deste segmento deve focar-se em: ${input.preferredGenre}.` 
    : 'O género deve fluir naturalmente da narrativa.';

  const nsfwPrompt = input.isNSFW
    ? 'AVISO: O modo "Sem Censura" está ATIVO.'
    : 'Mantenha o conteúdo adequado para uma audiência geral (PG-13).';

  const choicePrompt = input.userChoice
    ? `O utilizador escolheu anteriormente: "${input.userChoice}".`
    : 'Este é o início de um novo capítulo ou arco.';

  const finalPrompt = `
    Você é um autor mestre de Light Novels e Manhwas.
    Você está a escrever uma história interativa para um "Caçador".

    **Contexto do Utilizador:** ${input.userProfile}
    **Eventos Recentes:** ${input.recentEvents}
    **História até agora:** ${input.storyContext}
    **Situação Atual:** ${choicePrompt}
    **Diretrizes:** ${nsfwPrompt} ${genrePrompt}

    Escreva o próximo segmento da história. Termine com um cliffhanger e 2 ou 3 escolhas.

    Responda em formato JSON seguindo este esquema:
    {
      "title": "...",
      "content": "...",
      "choices": [{ "id": "...", "text": "...", "consequenceHint": "..." }],
      "newSummary": "...",
      "genre": "..."
    }
  `;

  try {
    const output = await retryWithBackoff(
      async () => await generateWithAppwriteAI<any>(finalPrompt, true),
      3,
      2000,
      'Generate Story Segment'
    );

    validateAIOutput(output, ['title', 'content', 'choices', 'newSummary'], 'Story Segment');

    return {
      title: sanitizeText(output!.title, 100),
      content: output!.content,
      choices: output!.choices,
      newSummary: sanitizeText(output!.newSummary, 1000),
      genre: sanitizeText(output!.genre, 50),
    };
  } catch (error) {
    console.error('Failed to generate story segment:', error);
    throw new Error('Falha ao gerar a história. O Sistema está instável.');
  }
}

