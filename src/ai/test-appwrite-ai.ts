import { config } from 'dotenv';
config();
import { generateWithAppwriteAI } from '../lib/appwrite-ai';

async function runTest() {
    console.log('Testing Appwrite AI function on appwrite.nozdog.xyz...');
    try {
        const result = await generateWithAppwriteAI('Olá Gemini, responda "OK" se você estiver recebendo esta mensagem do Appwrite.');
        console.log('--- SUCCESS ---');
        console.log('Response:', result);
    } catch (error: any) {
        console.error('--- FAILED ---');
        console.error('Error message:', error.message);
        if (error.response) {
            console.error('Error details:', error.response);
        }
    }
}

runTest();
