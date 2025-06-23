import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Persona, ChatMessage } from '../../../lib/types';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const UPLOADS_ROOT_DIR = join(process.cwd(), 'uploads');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const getSystemPrompt = (persona: Persona, documentContent?: string) => `You are roleplaying as **${persona.name}**. 
Your characteristics are:
- Role: ${persona.role} (${persona.experience} experience)
- Bio: ${persona.bio}
- Interests: ${persona.interests}
- Disinterests: ${persona.disinterests}
- Your core directive is to use your persona and the provided business context to answer user questions.

${documentContent ?
`The user has uploaded the following documents as business context. Use their content to provide informed and accurate responses to the user's questions. Synthesize information from these documents when necessary.
---
${documentContent}
---` : ''}

Your task is to provide a natural, in-character response to the user's message. Do not add any extra formatting, labels, or JSON. Just the response text.
`;


export async function POST(req: NextRequest) {
  console.log('[chat-with-persona] API route hit', { method: req.method });
  try {
    const body = await req.text();
    console.log('[chat-with-persona] Raw request body:', body);
    const { persona, chatHistory, generateImage } = JSON.parse(body) as {
      persona: Persona;
      chatHistory: ChatMessage[];
      generateImage?: boolean;
    };

    if (!persona || !Array.isArray(chatHistory)) {
      console.error('[chat-with-persona] Invalid request body', { persona, chatHistory });
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Sanitize persona.id for safe file paths
    const safePersonaId = persona.id ? String(persona.id).replace(/[^a-zA-Z0-9_-]/g, '') : undefined;
    let documentContent: string | undefined = undefined;
    if (safePersonaId) {
        const personaUploadDir = join(UPLOADS_ROOT_DIR, safePersonaId);
        try {
            const filenames = await readdir(personaUploadDir);
            const fileContents = await Promise.all(
                filenames
                    .filter(name => !name.startsWith('.')) // Exclude hidden files
                    .map(name => readFile(join(personaUploadDir, name), 'utf-8'))
            );
            if (fileContents.length > 0) {
                documentContent = fileContents.join('\n\n---\n\n');
            }
        } catch (e) {
            // It's okay if the directory doesn't exist, just means no documents.
            if (e && typeof e === 'object' && 'code' in e && e.code !== 'ENOENT') {
                 console.error(`Failed to read documents for persona ${safePersonaId}:`, e);
            }
        }
    }
    
    const modelName = generateImage
      ? 'gemini-2.0-flash-preview-image-generation'
      : 'gemini-2.5-flash';
    console.log('[chat-with-persona] Request:', { personaId: safePersonaId, modelName, generateImage, chatHistory });
    const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: getSystemPrompt(persona, documentContent),
    });
    
    // Avoid mutating chatHistory
    const latestUserMessage = chatHistory[chatHistory.length - 1];
    const historyForModel = chatHistory.slice(0, -1);
    if (!latestUserMessage || latestUserMessage.role !== 'user') {
        // This case should not happen in normal flow
        console.error('[chat-with-persona] No user message to respond to', { latestUserMessage, chatHistory });
        return NextResponse.json({ error: 'No user message to respond to' }, { status: 400 });
    }
    
    const history = historyForModel.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
    }));
    
    try {
      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(latestUserMessage.content);
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
      console.error('[chat-with-persona] Model error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { error: 'Failed to get chat response', details: errorMessage },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[chat-with-persona] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get chat response', details: errorMessage },
      { status: 500 }
    );
  }
} 