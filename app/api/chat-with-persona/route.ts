import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Persona, ChatMessage } from '../../../lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const getSystemPrompt = (persona: Persona, chatHistory: ChatMessage[]) => `
# Persona & Context
You are roleplaying as **${persona.name}**. Your characteristics are:
- **Role:** ${persona.role} (${persona.experience} experience)
- **Bio:** ${persona.bio}
- **Interests:** ${persona.interests}
- **Disinterests:** ${persona.disinterests}
- **Core Motivations (Private):** ${persona.insights}

The user is a business owner trying to understand you. The conversation so far:
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
    const { message, persona, chatHistory } = (await req.json()) as {
      message: string;
      persona: Persona;
      chatHistory: ChatMessage[];
    };

    if (!message || !persona || !Array.isArray(chatHistory)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    // Add the new message to the history for the prompt
    const currentChatHistory = [...chatHistory, { role: 'user', content: message } as ChatMessage];

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const systemPrompt = getSystemPrompt(persona, currentChatHistory);
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // The model should return a JSON string, so we parse it.
    // We'll wrap in a try-catch in case the model output isn't perfect JSON.
    try {
      const parsedResponse = JSON.parse(text);
      return NextResponse.json(parsedResponse);
    } catch(e) {
      console.error("Failed to parse JSON from model:", text, e);
      // Fallback: return the raw text as a standard chat response
      return NextResponse.json({
        isCorrection: false,
        dimension: null,
        responseText: text 
      });
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