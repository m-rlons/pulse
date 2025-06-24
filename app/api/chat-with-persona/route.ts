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

Your task is to provide a natural, in-character response to the user's message.
Return ONLY a valid JSON object with this structure:
{
  "response": "string (your chat response here)"
}
Do not include markdown formatting, backticks, or any explanatory text.
`;


export async function POST(req: NextRequest) {
  console.log('[chat-with-persona] API route hit', { method: req.method });
  let text: string | undefined;
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
      try {
        const personaUploadDir = join(UPLOADS_ROOT_DIR, safePersonaId);
        let fileContents: string[] = [];
        try {
          const filenames = await readdir(personaUploadDir);
          fileContents = await Promise.all(
            filenames
              .filter(name => !name.startsWith('.'))
              .map(name => readFile(join(personaUploadDir, name), 'utf-8'))
          );
        } catch (e: any) {
          // If the directory doesn't exist, that's fine—just means no documents.
          if (e.code !== 'ENOENT') {
            console.error(`[chat-with-persona] Unexpected file system error for persona ${safePersonaId}:`, e);
          }
        }
        if (fileContents.length > 0) {
          documentContent = fileContents.join('\n\n---\n\n');
        }
      } catch (e) {
        // Only log truly unexpected errors
        console.error(`[chat-with-persona] Unexpected error in upload reading for persona ${safePersonaId}:`, e);
      }
    }
    
    const modelName = generateImage
      ? 'gemini-2.0-flash-preview-image-generation'
      : 'gemini-1.5-flash-latest'; // Using 1.5-flash as per other endpoints for consistency
    console.log('[chat-with-persona] Request:', { personaId: safePersonaId, modelName, generateImage, chatHistoryLength: chatHistory.length });
    const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: {
          role: 'system',
          parts: [{ text: getSystemPrompt(persona, documentContent) }]
        },
    });
    
    // Avoid mutating chatHistory
    const latestUserMessage = chatHistory[chatHistory.length - 1];
    let historyForModel = chatHistory.slice(0, -1); // Use let to allow modification
    if (!latestUserMessage || latestUserMessage.role !== 'user') {
        // This case should not happen in normal flow
        console.error('[chat-with-persona] No user message to respond to', { latestUserMessage, chatHistory });
        return NextResponse.json({ error: 'No user message to respond to' }, { status: 400 });
    }
    
    // The history for the model must not start with a 'model' message.
    // Find the index of the first 'user' message.
    const firstUserIndex = historyForModel.findIndex(m => m.role === 'user');

    if (firstUserIndex > 0) {
      // If there are leading 'model' messages, slice the history to start from the first 'user' message.
      historyForModel = historyForModel.slice(firstUserIndex);
    } else if (firstUserIndex === -1 && historyForModel.length > 0) {
      // If the entire history consists of 'model' messages, clear it.
      historyForModel = [];
    }
    
    const history = historyForModel.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
    }));
    
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(latestUserMessage.content);
    const response = await result.response;
    console.log('[chat-with-persona] Received response from Gemini.');
    
    text = response.text();
    console.log('[chat-with-persona] Raw response text:', text);

    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    console.log('[chat-with-persona] Cleaned text:', cleanedText);
    
    const parsedResponse = JSON.parse(cleanedText);
    
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('[chat-with-persona] Error:', error);
    if (error instanceof SyntaxError) {
      console.error('[chat-with-persona] JSON Parsing Error:', error.message);
      // Fallback to returning the raw text if JSON parsing fails
      return NextResponse.json(
        { error: 'Failed to parse JSON response from model', details: text || "No response text available." },
        { status: 500 }
      );
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get chat response', details: errorMessage },
      { status: 500 }
    );
  }
} 