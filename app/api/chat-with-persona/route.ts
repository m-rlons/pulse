import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { Persona, ChatMessage } from '../../../lib/types';
import { readFile } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const getSystemPrompt = (persona: Persona, chatHistory: ChatMessage[], documentContent?: string) => `
# Persona & Context
You are roleplaying as **${persona.name}**. Your characteristics are:
- **Role:** ${persona.role} (${persona.experience} experience)
- **Bio:** ${persona.bio}
- **Interests:** ${persona.interests}
- **Disinterests:** ${persona.disinterests}
- **Core Motivations (Private):** ${persona.insights}

${documentContent ?
`# Attached Document
The user has attached the following document. Use its content to provide an informed and accurate response. Do not mention the document unless the user does.
---
${documentContent}
---` : ''}

The conversation so far:
${chatHistory.map(m => `${m.role === 'user' ? 'User' : persona.name}: ${m.content}`).join('\n')}

# Task
Analyze the user's last message for corrections. Then, generate a response.

1.  **Correction Analysis**: Is the user's last message correcting a misunderstanding you (as the persona) have?
    - If NO: isCorrection = false, dimension = null.
    - If YES: isCorrection = true, identify the core topic being corrected (e.g., "Price Sensitivity", "Brand Loyalty", "Feature Needs") and populate 'dimension'.

2.  **Response Generation**:
    - If **isCorrection = false**: Write a natural, in-character response.
    - If **isCorrection = true**: Apologize and explain the misunderstanding based on the 'dimension'. Ask the user if they'd be willing to answer a few more questions to help you understand better.

# Output Format
Respond with a single, minified JSON object. Do not include markdown, backticks, or any other text.

Example (No Correction):
{"isCorrection":false,"dimension":null,"responseText":"That's a really interesting question. In my experience..."}

Example (Correction Detected):
{"isCorrection":true,"dimension":"Pricing","responseText":"Oh, I see. My apologies, I think I misunderstood your customers' priorities regarding price. Would you be open to answering a few more specific questions so I can get a better handle on that?"}

Provide only the JSON object.
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
            // Basic security: prevent path traversal
            if (!filePath.startsWith(UPLOAD_DIR)) {
              throw new Error('Invalid file path');
            }
            documentContent = await readFile(filePath, 'utf-8');
        } catch (e) {
            console.error(`Failed to read document ${document}:`, e);
            // Proceed without document, but could also return an error
        }
    }
    
    // Add the new message to the history for the prompt
    const currentChatHistory = [...chatHistory, { role: 'user', content: message } as ChatMessage];

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const systemPrompt = getSystemPrompt(persona, currentChatHistory, documentContent);
    
    // For streaming, we need to handle the response differently
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