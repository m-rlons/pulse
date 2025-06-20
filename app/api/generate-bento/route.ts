import { NextRequest, NextResponse } from 'next/server';
import { Bento } from '../../../lib/types';

export async function POST(req: NextRequest) {
  try {
    const { businessInput } = await req.json();
    if (typeof businessInput !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
    }

    const systemPrompt = `You are an expert business analyst. Your task is to analyze the following business description. Distill it into its core 'businessModel' and the primary 'customerChallenge'. Respond ONLY with a valid JSON object matching this TypeScript interface: interface Bento { businessModel: string; customerChallenge: string; }. Do not include markdown formatting, backticks, or any explanatory text. Here is the user's input: ${businessInput}`;

    // Use Gemini API key as a query parameter
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('Full Gemini API error:', errorText);
      return NextResponse.json({ error: 'Gemini API error', details: errorText }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    // Assume the model returns the JSON as a string in geminiData.candidates[0].content.parts[0].text
    let bento: Bento;
    try {
      bento = JSON.parse(geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
    } catch {
      return NextResponse.json({ error: 'Invalid response from Gemini' }, { status: 500 });
    }

    if (!bento.businessModel || !bento.customerChallenge) {
      return NextResponse.json({ error: 'Incomplete Bento data' }, { status: 500 });
    }

    return NextResponse.json(bento);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 