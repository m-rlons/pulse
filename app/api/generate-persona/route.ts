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

    const systemPrompt = `You are a world-class marketing strategist. Based on the provided business context and the business owner's assessment of their customers (scores: -1=disagree, 0=neutral, 1=agree), create a detailed customer persona.

Business Model: ${bento.businessModel}
Customer Challenge: ${bento.customerChallenge}

Assessment Results:
${results.map(r => `${r.dimension}: ${r.score === 1 ? 'agree' : r.score === 0 ? 'neutral' : 'disagree'}`).join('\n')}

Generate a JSON object with EXACTLY this structure:
{
  "title": "Short catchy title like 'The Eco-Conscious Streamer'",
  "personaName": "Creative name like 'Maya Chen'",
  "visualDescriptor": "Detailed description for image generation",
  "summary": "2-3 sentence persona summary",
  "actionableInsights": [
    {"title": "Insight 1 Title", "insight": "Detailed insight 1"},
    {"title": "Insight 2 Title", "insight": "Detailed insight 2"},
    {"title": "Insight 3 Title", "insight": "Detailed insight 3"}
  ]
}

Return ONLY the JSON object, no markdown, no explanation.`;
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
    console.log('[generate-persona] Gemini response structure:', Object.keys(geminiData));

    let persona: Persona;
    try {
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('[generate-persona] Raw response text:', rawText);

      if (!rawText) {
        throw new Error('No text in Gemini response');
      }

      // Clean any potential markdown formatting
      const cleanedText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      persona = JSON.parse(cleanedText);
      console.log('[generate-persona] Parsed persona:', persona);
    } catch (parseError) {
      console.error('[generate-persona] Parse error:', parseError);
      console.error('[generate-persona] Full gemini data:', JSON.stringify(geminiData, null, 2));
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