'use server';
import {config} from 'dotenv';
config();

import {ai} from './genkit';

async function testGenkit() {
  try {
    console.log('Testing Genkit with Gemini API...');
    
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: 'Responda com "OK" se você estiver funcionando corretamente.',
    });
    
    console.log('Success! Response from Gemini API:');
    console.log(response.text);
  } catch (error) {
    console.error('Error testing Genkit with Gemini API:', error);
  }
}

testGenkit();
