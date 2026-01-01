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
        console.log("Iniciando chamada Appwrite AI...");
        // Se estiver em modo JSON, adiciona instrução ao prompt
        const finalPrompt = jsonMode 
            ? `${prompt}\n\nIMPORTANTE: Responda APENAS com um objeto JSON válido. NUNCA use aspas duplas (") dentro dos valores de texto, use apenas aspas simples (') se necessário. Não inclua blocos de código (markdown) ou texto explicativo.`
            : prompt;

        const execution = await functions.createExecution(
            'gemini-api', 
            JSON.stringify({ prompt: finalPrompt }),
            false,
            '/',
            ExecutionMethod.POST
        );

        console.log("Execução Appwrite concluída. Status:", execution.status);

        if (execution.status === 'completed') {
            const responseBody = execution.responseBody;
            console.log("Corpo da resposta:", responseBody.substring(0, 100) + "...");
            
            const responseData: GeminiResponse = JSON.parse(responseBody);
            
            if (responseData.success && responseData.text) {
                if (jsonMode) {
                    let cleanJson = responseData.text.trim();
                    try {
                        // 1. Remove blocos de código markdown
                        cleanJson = cleanJson.replace(/```json|```/g, '').trim();
                        return JSON.parse(cleanJson) as T;
                    } catch (e) {
                        console.error('Erro crítico de parse JSON. Conteúdo bruto:', cleanJson);
                        // Tenta uma limpeza mais agressiva se falhar
                        try {
                            const superClean = cleanJson
                                .replace(/\n/g, ' ')
                                .replace(/\r/g, ' ')
                                .replace(/\t/g, ' ');
                            return JSON.parse(superClean) as T;
                        } catch (e2) {
                            throw new Error('A IA não retornou um formato JSON válido e não foi possível reparar');
                        }
                    }
                }
                return responseData.text as unknown as T;
            } else {
                console.error("Erro na resposta da IA:", responseData.error);
                throw new Error(responseData.error || 'Erro desconhecido na resposta da IA');
            }
        } else {
            const errorBody = execution.responseBody;
            if (errorBody.includes('429') || errorBody.includes('quota')) {
                throw new Error('SISTEMA EM SOBRECARGA: O limite de processamento da IA foi atingido. Tente novamente em alguns minutos.');
            }
            console.error("Execução falhou:", execution.responseBody);
            throw new Error(`A execução da função falhou com status: ${execution.status}`);
        }
    } catch (error: any) {
        console.error('Erro ao chamar Appwrite AI:', error);
        throw error;
    }
}