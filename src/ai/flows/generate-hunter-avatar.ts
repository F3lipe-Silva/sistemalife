
/**
 * @fileOverview Um agente de IA que gera uma descrição detalhada de um avatar de "Caçador".
 */

import { generateWithAppwriteAI } from '@/lib/appwrite-ai';
import { z } from 'zod';

const GenerateHunterAvatarInputSchema = z.object({
  level: z.number().describe('O nível atual do Caçador.'),
  rank: z.string().describe('O rank atual do Caçador (ex: "Novato (F)", "Lendário (SSS)").'),
  gender: z.string().optional().describe('O género do Caçador, para influenciar a aparência.'),
  topStats: z.array(z.string()).describe('Uma lista dos 2 a 3 principais atributos do Caçador (ex: ["inteligencia", "sabedoria"]).'),
  equippedItems: z.array(z.string()).optional().describe("Uma lista de nomes de itens cosméticos que o personagem está a usar.")
});
export type GenerateHunterAvatarInput = z.infer<typeof GenerateHunterAvatarInputSchema>;

const GenerateHunterAvatarOutputSchema = z.object({
  avatarDataUri: z.string().describe("A imagem do avatar gerada, como um data URI em Base64. Formato esperado: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateHunterAvatarOutput = z.infer<typeof GenerateHunterAvatarOutputSchema>;

export async function generateHunterAvatar(
  input: GenerateHunterAvatarInput
): Promise<GenerateHunterAvatarOutput> {
  const statsDescription = input.topStats.length > 0 ? `focado em ${input.topStats.join(' e ')}` : '';
  const genderTerm = input.gender && input.gender.toLowerCase() !== 'não especificado' ? input.gender : 'figura andrógina';
  const equipmentDescription = input.equippedItems && input.equippedItems.length > 0
    ? `Ele está a usar os seguintes itens: ${input.equippedItems.join(', ')}.`
    : 'Ele não está a usar nenhum equipamento especial.';

  const prompt = `
    Crie um sprite de personagem de corpo inteiro em pixel art.
    O personagem é um Caçador de nível ${input.level}, com o rank de "${input.rank}".
    A sua aparência deve refletir uma ${genderTerm} ${statsDescription}.
    ${equipmentDescription}
    Estilo de arte: pixel art, sprite de personagem de RPG 16-bit, corpo inteiro, pose de pé, fundo simples e escuro.
    
    Responda APENAS com um objeto JSON contendo a URL (placeholder neste caso ou URL real da IA) no campo avatarDataUri.
  `;

  return await generateWithAppwriteAI<GenerateHunterAvatarOutput>(prompt, true);
}
