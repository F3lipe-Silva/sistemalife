import { functions } from './appwrite';
import { ExecutionMethod } from 'appwrite';

/**
 * Interface para a resposta da função Gemini no Appwrite
 */
interface GeminiResponse {
    success: boolean;
    text?: string;
    error?: string;
    details?: any;
}

/**
 * Chama a função Gemini do Appwrite para gerar conteúdo.
 * 
 * @param prompt O texto a ser enviado para a IA
 * @param jsonMode Se true, tenta parsear a resposta como JSON
 * @returns A resposta gerada pela IA (string ou objeto)
 */
export async function generateWithAppwriteAI<T = string>(prompt: string, jsonMode: boolean = false): Promise<T> {
    try {
        // Se estiver em modo JSON, adiciona instrução ao prompt
        const finalPrompt = jsonMode 
            ? `${prompt}\n\nIMPORTANTE: Responda APENAS com um objeto JSON válido, sem blocos de código (markdown) ou texto adicional.`
            : prompt;

        const execution = await functions.createExecution(
            'gemini-api', 
            JSON.stringify({ prompt: finalPrompt }),
            false,
            '/',
            ExecutionMethod.POST
        );

        if (execution.status === 'completed') {
            const responseData: GeminiResponse = JSON.parse(execution.responseBody);
            
            if (responseData.success && responseData.text) {
                if (jsonMode) {
                    try {
                        // Remove possíveis blocos de código markdown que a IA possa ter incluído
                        const cleanJson = responseData.text.replace(/```json|```/g, '').trim();
                        return JSON.parse(cleanJson) as T;
                    } catch (e) {
                        console.error('Erro ao parsear resposta JSON da IA:', responseData.text);
                        throw new Error('A IA não retornou um formato JSON válido');
                    }
                }
                return responseData.text as unknown as T;
            } else {
                throw new Error(responseData.error || 'Erro desconhecido na resposta da IA');
            }
        } else {
            throw new Error(`A execução da função falhou com status: ${execution.status}`);
        }
    } catch (error: any) {
        console.error('Erro ao chamar Appwrite AI:', error);
        throw error;
    }
}