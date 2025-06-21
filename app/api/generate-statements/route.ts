import { NextRequest, NextResponse } from 'next/server';
import { Bento, Statement } from '../../../lib/types';

export async function POST(req: NextRequest) {
  console.log('[generate-statements] Environment check - API key exists:', !!process.env.GEMINI_API_KEY);
  
  console.log('[generate-statements] Request received');
  try {
    const bento: Bento = await req.json();
    console.log('[generate-statements] Received bento:', JSON.stringify(bento, null, 2));
    
    if (!bento || typeof bento.businessModel !== 'string' || typeof bento.customerChallenge !== 'string') {
      console.error('[generate-statements] Invalid input:', bento);
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[generate-statements] Missing API key');
      return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
    }

    const systemPrompt = `You are a behavioral psychologist specializing in consumer behavior. Based on the provided business context, generate 8 assessment statements. Each statement must probe exactly one of the 8 core behavioral dimensions: spend, loyalty, investment, interest, greenisity, social, novelty, value. 

CRITICAL: Keep statements SHORT - maximum 12 words, ideally 8-10 words. Use simple, conversational language. Write in the format 'They [simple action/behavior]'. 

Examples of good length:
- "They pay extra for eco-friendly options"
- "They try new features immediately"
- "They recommend this to friends often"

Each statement must be pure, illuminating only its own dimension. Return ONLY a valid JSON object matching this TypeScript interface: interface Response { statements: { text: string; dimension: BehavioralDimension; }[] }. The array must contain exactly 8 unique statements, one for each dimension. Do not include markdown formatting or explanations. Here is the business context: ${JSON.stringify(bento)}`;

    console.log('[generate-statements] Making Gemini API call...');
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
    
    console.log('[generate-statements] Gemini status:', geminiRes.status);

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error('[generate-statements] Full Gemini API error:', errorText);
      return NextResponse.json({ error: 'Gemini API error', details: errorText }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    console.log('[generate-statements] Gemini response:', JSON.stringify(geminiData, null, 2));
    
    let response: { statements: Statement[] };
    try {
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('[generate-statements] Raw text:', rawText);
      
      if (!rawText) {
        throw new Error('No text in response');
      }
      
      // Clean potential markdown
      const cleanedText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      response = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('[generate-statements] Parse error:', parseError);
      return NextResponse.json({ error: 'Invalid response from Gemini' }, { status: 500 });
    }

    if (!Array.isArray(response.statements) || response.statements.length !== 8) {
      return NextResponse.json({ error: 'Incomplete statements data' }, { status: 500 });
    }

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('[generate-statements] CATCH BLOCK ERROR:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
} 