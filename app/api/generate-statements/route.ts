import { NextRequest, NextResponse } from 'next/server';
import { Bento, Statement } from '../../../lib/types';

export async function POST(req: NextRequest) {
  try {
    const bento: Bento = await req.json();
    if (!bento || typeof bento.businessModel !== 'string' || typeof bento.customerChallenge !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
    }

    const systemPrompt = `You are a behavioral psychologist specializing in consumer behavior. Based on the provided business context, generate 8 assessment statements. Each statement must probe exactly one of the 8 core behavioral dimensions: spend, loyalty, investment, interest, greenisity, social, novelty, value. The statements must be contextually grounded in the business context, written in the format 'They [specific behavioral pattern]'. Each statement must be pure, illuminating only its own dimension. Return ONLY a valid JSON object matching this TypeScript interface: interface Response { statements: { text: string; dimension: BehavioralDimension; }[] }. The array must contain exactly 8 unique statements, one for each dimension. Do not include markdown formatting or explanations. Here is the business context: ${JSON.stringify(bento)}`;

    const geminiRes = await fetch(`https://generativeai.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
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
      return NextResponse.json({ error: 'Gemini API error' }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    // Assume the model returns the JSON as a string in geminiData.candidates[0].content.parts[0].text
    let response: { statements: Statement[] };
    try {
      response = JSON.parse(geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
    } catch {
      return NextResponse.json({ error: 'Invalid response from Gemini' }, { status: 500 });
    }

    if (!Array.isArray(response.statements) || response.statements.length !== 8) {
      return NextResponse.json({ error: 'Incomplete statements data' }, { status: 500 });
    }

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 