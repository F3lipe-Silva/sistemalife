'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
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
  return generateStorySegmentFlow(input);
}

const generateStorySegmentFlow = ai.defineFlow(
  {
    name: 'generateStorySegmentFlow',
    inputSchema: GenerateStorySegmentInputSchema,
    outputSchema: GenerateStorySegmentOutputSchema,
  },
  async (input) => {
    const genrePrompt = input.preferredGenre 
      ? `O género deste segmento deve focar-se em: ${input.preferredGenre}.` 
      : 'O género deve fluir naturalmente da narrativa, podendo variar entre Ação, Aventura, Mistério, Terror, Romance ou Drama.';

    const nsfwPrompt = input.isNSFW
      ? 'AVISO: O modo "Sem Censura" está ATIVO. Você tem permissão total para descrever cenas de violência gráfica, horror intenso, temas adultos, romance explícito ou situações moralmente ambíguas se a história pedir. Não suavize o conteúdo. Seja visceral e realista.'
      : 'Mantenha o conteúdo adequado para uma audiência geral (PG-13). Evite descrições excessivamente gráficas de violência ou conteúdo sexual explícito.';

    const choicePrompt = input.userChoice
      ? `O utilizador escolheu anteriormente: "${input.userChoice}". A história DEVE reagir a esta escolha, mostrando as consequências imediatas.`
      : 'Este é o início de um novo capítulo ou arco.';

    const finalPrompt = `
Você é um autor mestre de Light Novels e Manhwas (como Solo Leveling, Omniscient Reader's Viewpoint, The Beginning After The End).
Você está a escrever uma história interativa única para um "Caçador" (o utilizador) que usa um "Sistema" para evoluir na vida real.

**Contexto do Utilizador:**
${input.userProfile}

**Eventos Recentes (O "Sistema" na vida real):**
${input.recentEvents}
(Use estes eventos como inspiração para o que acontece na história. Se ele completou uma missão de "Estudar Python", na história isso pode ser traduzido como "Decifrar runas antigas" ou "Aprender uma nova linguagem mágica". Se foi "Correr 5km", pode ser "Uma perseguição" ou "Treino de resistência".)

**História até agora:**
${input.storyContext}

**Situação Atual:**
${choicePrompt}

**Diretrizes de Conteúdo:**
${nsfwPrompt}

**Diretrizes de Estilo:**
1.  **Narrativa:** Escreva na segunda pessoa ("Você...") ou terceira pessoa limitada ao protagonista.
2.  **Tom:** Épico, emocional e imersivo. Não tenha medo de temas maduros ou complexos (dentro dos limites de segurança). Misture géneros conforme necessário (${genrePrompt}).
3.  **O Sistema:** O "Sistema" é uma entidade misteriosa que guia o utilizador. Pode ser benevolente, frio ou até manipulador.
4.  **Criatividade:** Transforme as metas mundanas do utilizador em aventuras fantásticas. O mundo real e o mundo do "Sistema" sobrepõem-se.

**Tarefa:**
Escreva o próximo segmento da história.
Termine com um momento de decisão (cliffhanger) e forneça 2 ou 3 escolhas distintas para o utilizador.
As escolhas devem ser significativas e levar a caminhos diferentes (ex: Combate vs Diplomacia, Arriscar vs Cautela, Paixão vs Dever).
`;

    try {
      const {output} = await retryWithBackoff(
        async () => await ai.generate({
          prompt: finalPrompt,
          model: 'googleai/gemini-2.5-flash',
          output: {schema: GenerateStorySegmentOutputSchema},
        }),
        3,
        2000,
        'Generate Story Segment'
      );

      validateAIOutput(output, ['title', 'content', 'choices', 'newSummary'], 'Story Segment');

      return {
        title: sanitizeText(output!.title, 100),
        content: output!.content, // Allow longer content for story
        choices: output!.choices,
        newSummary: sanitizeText(output!.newSummary, 1000),
        genre: sanitizeText(output!.genre, 50),
      };
    } catch (error) {
      console.error('Failed to generate story segment:', error);
      throw new Error('Falha ao gerar a história. O Sistema está instável.');
    }
  }
);
