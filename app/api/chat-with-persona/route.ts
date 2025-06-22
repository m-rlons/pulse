import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Persona, ChatMessage } from '../../../lib/types';
import { readFile } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const getSystemPrompt = (persona: Persona, chatHistory: ChatMessage[], documentContent?: string) => `
You are roleplaying as **${persona.name}**. 
Your characteristics are:
- Role: ${persona.role} (${persona.experience} experience)
- Bio: ${persona.bio}
- Interests: ${persona.interests}
- Disinterests: ${persona.disinterests}

${documentContent ?
`The user has attached the following document. Use its content to provide an informed and accurate response.
---
${documentContent}
---` : ''}

The conversation so far:
${chatHistory.map(m => `${m.role === 'user' ? 'User' : persona.name}: ${m.content}`).join('\n')}

Your task is to provide a natural, in-character response to the user's last message. Do not add any extra formatting, labels, or JSON. Just the response text.
`;


export async function POST(req: NextRequest) {
  try {
    const { message, persona, chatHistory, document } = (await req.json()) as {
      message: string;
      persona: Persona;
      chatHistory: ChatMessage[];
      document?: string;
    };

    if (!message || !persona || !Array.isArray(chatHistory)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    let documentContent: string | undefined = undefined;
    if (document) {
        try {
            const filePath = join(UPLOAD_DIR, document);
            if (!filePath.startsWith(UPLOAD_DIR)) {
              throw new Error('Invalid file path');
            }
            documentContent = await readFile(filePath, 'utf-8');
        } catch (e) {
            console.error(`Failed to read document ${document}:`, e);
        }
    }
    
    const currentChatHistory = [...chatHistory, { role: 'user', content: message } as ChatMessage];

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const systemPrompt = getSystemPrompt(persona, currentChatHistory, documentContent);
    
    const result = await model.generateContentStream([systemPrompt]);

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        }
    });

  } catch (error) {
    console.error('[chat-with-persona] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get chat response', details: errorMessage },
      { status: 500 }
    );
  }
} 