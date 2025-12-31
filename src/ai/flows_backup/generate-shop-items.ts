
'use server';
/**
 * @fileOverview Um agente de IA que gera uma seleção de itens de loja personalizados.
 *
 * - generateShopItems - Analisa o perfil do utilizador e seleciona itens relevantes da loja.
 * - GenerateShopItemsInput - O tipo de entrada para a função.
 * - GenerateShopItemsOutput - O tipo de retorno para a função.
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const ShopItemSchema = z.object({
    id: z.string().describe("O ID único do item, conforme definido no catálogo de itens."),
    name: z.string().describe("O nome do item."),
    description: z.string().describe("A descrição do item."),
    price: z.number().describe("O preço do item em fragmentos."),
    category: z.string().describe("A categoria do item (ex: 'Consumíveis')."),
    reasoning: z.string().optional().describe("Uma breve explicação (1 frase) do porquê este item está a ser recomendado ao utilizador."),
});

const GenerateShopItemsInputSchema = z.object({
    profile: z.string().describe("O perfil do utilizador, incluindo nível, fragmentos, streak, etc., como uma string JSON."),
    skills: z.string().describe("As habilidades atuais do utilizador, como uma string JSON."),
    activeMissions: z.string().describe("As missões ativas do utilizador, como uma string JSON."),
    allItems: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        price: z.number(),
        category: z.string(),
        effect: z.any(),
    })).describe("O catálogo completo de todos os itens disponíveis no jogo, sem os componentes de ícone."),
});
export type GenerateShopItemsInput = z.infer<typeof GenerateShopItemsInputSchema>;

const GenerateShopItemsOutputSchema = z.object({
    recommendedItems: z.array(ShopItemSchema).describe("Uma lista de 3 a 5 itens recomendados para o utilizador."),
});
export type GenerateShopItemsOutput = z.infer<typeof GenerateShopItemsOutputSchema>;

export async function generateShopItems(
  input: GenerateShopItemsInput
): Promise<GenerateShopItemsOutput> {
  const prompt = `
      Você é o "Mercador do Sistema", uma IA especializada em economia de jogos.
      Sua tarefa é selecionar entre 3 a 5 itens personalizados para a loja do utilizador.

      Dados do Utilizador: ${input.profile}
      Habilidades: ${input.skills}
      Missões Ativas: ${input.activeMissions}

      Catálogo Completo:
      ${JSON.stringify(input.allItems, null, 2)}

      Responda em formato JSON seguindo este esquema:
      {
        "recommendedItems": [
          { "id": "...", "name": "...", "description": "...", "price": 10, "category": "...", "reasoning": "..." }
        ]
      }
  `;

  return await generateWithAppwriteAI<GenerateShopItemsOutput>(prompt, true);
}

