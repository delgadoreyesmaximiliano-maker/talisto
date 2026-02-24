import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
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
        console.error('Error:', err);
    }
}

main();
