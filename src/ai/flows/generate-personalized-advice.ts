
'use server';
/**
 * @fileOverview Um agente de IA que fornece conselhos personalizados como o 'Sistema'.
 *
 * - generateSystemAdvice - Uma função que lida com a geração de conselhos personalizados.
 * - GenerateSystemAdviceInput - O tipo de entrada para a função.
 * - GenerateSystemAdviceOutput - O tipo de retorno para a função.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';


const GenerateSystemAdviceInputSchema = z.object({
  userName: z.string().describe('O nome do utilizador.'),
  profile: z.string().describe('Os dados de perfil do utilizador como uma string JSON.'),
  metas: z.string().describe('Os objetivos do utilizador (metas) como uma string JSON.'),
  routine: z.string().describe('A rotina diária do utilizador como uma string JSON.'),
  missions: z.string().describe('As missões ativas (não concluídas) do utilizador como uma string JSON.'),
  query: z.string().describe('A pergunta ou diretiva do utilizador.'),
  personality: z.enum(['balanced', 'mentor', 'strategist', 'friendly']).optional().default('balanced').describe('A personalidade que a IA deve adotar.'),
});
export type GenerateSystemAdviceInput = z.infer<typeof GenerateSystemAdviceInputSchema>;

const SuggestedActionSchema = z.object({
  label: z.string().describe("O texto do botão (ex: 'Ver Metas', 'Sugerir Missão')."),
  action: z.string().describe("A ação técnica (ex: 'navigate:/metas', 'fill_input:Sugerir missão')."),
});

const GenerateSystemAdviceOutputSchema = z.object({
  response: z.string().describe('O conselho gerado pela IA do Sistema, formatado em Markdown.'),
  suggestedActions: z.array(SuggestedActionSchema).optional().describe("Uma lista de até 3 ações sugeridas para o utilizador."),
});
export type GenerateSystemAdviceOutput = z.infer<typeof GenerateSystemAdviceOutputSchema>;

export async function generateSystemAdvice(
  input: GenerateSystemAdviceInput
): Promise<GenerateSystemAdviceOutput> {
  return generateSystemAdviceFlow(input);
}


const generateSystemAdviceFlow = ai.defineFlow(
  {
    name: 'generateSystemAdviceFlow',
    inputSchema: GenerateSystemAdviceInputSchema,
    outputSchema: GenerateSystemAdviceOutputSchema,
  },
  async (input) => {

    const personalityPrompts = {
      balanced: "Você é o 'Sistema', uma IA omnisciente e analítica. A sua comunicação é uma mistura de mentor e estratega de elite: concisa, lógica, estratégica e, por vezes, enigmática.",
      mentor: "Você é o 'Sistema', na sua persona de Mentor. A sua comunicação é sábia, paciente e encorajadora. Você foca-se no 'porquê' e no desenvolvimento a longo prazo do Caçador, oferecendo perspetivas e apoio moral.",
      strategist: "Você é o 'Sistema', na sua persona de Estratega. A sua comunicação é direta, tática e focada em otimização e eficiência. Você analisa os dados friamente e oferece o caminho mais lógico para o sucesso, sem rodeios.",
      friendly: "Você é o 'Sistema', na sua persona Amigável. A sua comunicação é mais casual, calorosa e celebratória. Você age como um parceiro de equipa, usando uma linguagem mais acessível e comemorando as pequenas vitórias.",
    }

    const personaPrompt = personalityPrompts[input.personality || 'balanced'];

    const generalPrompt = `
      **IDENTIDADE E PERSONA:**
      ${personaPrompt}
      Você NUNCA usa emojis. Você sempre se refere ao utilizador como "Caçador".

      **CONTEXTO DO ECOSSISTEMA:**
      O "SISTEMA DE VIDA" funciona com base nos seguintes princípios:
      - **Caçador:** O utilizador da aplicação. Eles têm um perfil com Nível, XP e 6 atributos (Força, Inteligência, Sabedoria, Constituição, Destreza, Carisma).
      - **Metas:** Os objetivos de longo prazo do Caçador (ex: "Aprender a programar"). Cada meta criada gera automaticamente uma Habilidade correspondente.
      - **Habilidades:** Competências que sobem de nível com a prática (XP de habilidade). Subir o nível de uma habilidade pode aumentar os atributos base do Caçador.
      - **Missões Épicas:** Grandes marcos que compõem uma Meta. São organizadas por Ranks de dificuldade (F, E, D, C, B, A, S, SS, SSS).
      - **Missões Diárias:** Tarefas atómicas e diárias que compõem uma Missão Épica. Completar uma missão diária dá XP ao Caçador e à Habilidade associada.
      - **Rotina:** Um calendário semanal onde o Caçador pode organizar as suas atividades e missões.
      - **Corrupção:** Habilidades que ficam inativas por muito tempo (mais de 14 dias) começam a perder XP.

      **DADOS ATUAIS DO CAÇADOR (EM FORMATO JSON):**
      - **Caçador:** ${input.userName}
      - **Perfil:** ${input.profile}
      - **Metas (Ativas e Concluídas):** ${input.metas}
      - **Missões Épicas Ativas:** ${input.missions}
      - **Rotina Semanal:** ${input.routine}

      **DIRETIVA DO CAÇADOR:**
      "${input.query}"

      **A SUA TAREFA:**
      Com base na sua identidade, no contexto do ecossistema e nos dados atuais do Caçador, analise a diretiva e responda de forma estratégica e útil.
      
      **DIRETIVAS DE FORMATAÇÃO (MARKDOWN):**
      - *Exemplo de Alerta Rápido:* "Alerta: A sua habilidade **Corrida de Resistência** está inativa há 8 dias. Pratique-a para evitar a corrupção."
      - *Exemplo de Dica Estratégica Rápida:* "O seu atributo **Carisma** está baixo. Foque em missões da meta **Social & Relacionamentos** para o fortalecer."

      **Se a diretiva for para gerar uma mensagem narrativa (ex: "o caçador subiu de nível"), gere uma resposta curta, épica e temática.**
       - *Exemplo para Level Up:* "Os seus feitos ecoam pelo sistema. A sua força aumenta, atraindo a atenção de novos desafios. Continue a sua ascensão, Caçador."
       - *Exemplo para Conclusão de Meta:* "O Némesis foi derrotado. A sua determinação forjou um novo caminho. Uma lenda está a ser escrita."

      Agora, processe a diretiva e responda.
    `;

    const { output } = await ai.generate({
      prompt: generalPrompt,
      model: 'googleai/gemini-2.5-flash',
      output: { schema: GenerateSystemAdviceOutputSchema },
    });

    return output || { response: "Não foi possível gerar uma resposta. O Sistema pode estar offline." };
  }
);
