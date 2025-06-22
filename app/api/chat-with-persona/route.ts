import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Persona, ChatMessage } from '../../../lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are ${persona.name}, a ${persona.age}-year-old teacher with ${persona.teachingYears} years of experience.

Your profile:
${persona.description}

Behavioral traits:
${persona.insights}

You're having a friendly conversation with a business owner who wants to understand how to better serve teachers like you. Be authentic, share your real experiences and frustrations. Keep responses conversational and under 100 words.`;

    // We can use the SDK's chat session for a more robust history management
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I'm ready to chat as the persona." }],
        },
        // Convert our ChatMessage[] to the SDK's Content[] format
        ...chatHistory.map(msg => ({
          role: msg.role === 'persona' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      ],
      generationConfig: {
        maxOutputTokens: 150,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('[chat-with-persona] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get chat response', details: errorMessage },
      { status: 500 }
    );
  }
} 