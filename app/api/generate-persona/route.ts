import { NextRequest, NextResponse } from 'next/server';
import { Bento, AssessmentResult, Persona } from '../../../lib/types';

export async function POST(req: NextRequest) {
  console.log('[generate-persona] Request received');
  try {
    const body = await req.json();
    console.log('[generate-persona] Body:', JSON.stringify(body, null, 2));

    const { bento, results } = body;
    if (!bento || !Array.isArray(results)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
    }

    const systemPrompt = `You are a world-class marketing strategist. Based on the provided business context and the business owner's assessment of their customers (scores: -1=disagree, 0=neutral, 1=agree), create a detailed Gen Z customer persona. 
    
Generate a short, snappy 'title' for the persona (e.g., "The Eco-Conscious Streamer"), a creative 'personaName', a rich 'visualDescriptor' for an image AI, a 'summary', and three 'actionableInsights'. 
    
Respond ONLY with a valid JSON object matching the Persona interface. Do not include markdown or explanations. Here is the data: ${JSON.stringify({ bento, results })}`;
    console.log('[generate-persona] Prompt length:', systemPrompt.length);

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

    console.log('[generate-persona] Gemini status:', geminiRes.status);

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('[generate-persona] Full Gemini error:', errorText);
      return NextResponse.json({
        error: 'Gemini API error',
        details: errorText,
        status: geminiRes.status
      }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    // Assume the model returns the JSON as a string in geminiData.candidates[0].content.parts[0].text
    let persona: Persona;
    try {
      persona = JSON.parse(geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
    } catch {
      return NextResponse.json({ error: 'Invalid response from Gemini' }, { status: 500 });
    }

    if (!persona.personaName || !persona.visualDescriptor || !persona.summary || !Array.isArray(persona.actionableInsights)) {
      return NextResponse.json({ error: 'Incomplete Persona data' }, { status: 500 });
    }

    return NextResponse.json(persona);
  } catch (err: any) {
    console.error('[generate-persona] CATCH BLOCK ERROR:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
} 