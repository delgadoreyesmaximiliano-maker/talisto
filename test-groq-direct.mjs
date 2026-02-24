import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const groqKeyMatch = envFile.match(/GROQ_API_KEY=(.*)/);
const apiKey = groqKeyMatch ? groqKeyMatch[1].trim() : '';

console.log('API Key starts with:', apiKey.substring(0, 5));

const groq = createGroq({
    apiKey: apiKey,
});

async function main() {
    try {
        const result = await streamText({
            model: groq('llama-3.3-70b-versatile'),
            messages: [{ role: 'user', content: 'hola' }],
        });
        for await (const chunk of result.textStream) {
            process.stdout.write(chunk);
        }
    } catch (err) {
        console.error('Groq Error Name:', err.name);
        console.error('Groq Error Message:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
    }
}

main();
