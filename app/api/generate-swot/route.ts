import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { Bento } from '../../../lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const systemPrompt = `You are a business analysis expert specializing in marketing strategy. Based on the user's business description, create a SWOT analysis. A SWOT analysis consists of Strengths, Weaknesses, Opportunities, and Threats.

Your response must be a valid JSON object. This object will contain a "panels" array. Each object in the "panels" array represents a panel in a dynamic grid and must have the following properties:
- title: string (The title of the panel: "Strengths", "Weaknesses", "Opportunities", or "Threats")
- content: string (A bulleted list of 2-3 points for that section, formatted as a single string with newline characters.)
- colSpan: number (The width of the panel in grid units)
- rowSpan: number (The height of the panel in grid units)

Create exactly four panels with the following colSpan/rowSpan values to create a visually balanced, asymmetrical layout:
1.  **Strengths**: colSpan: 2, rowSpan: 1
2.  **Weaknesses**: colSpan: 1, rowSpan: 1
3.  **Opportunities**: colSpan: 1, rowSpan: 1
4.  **Threats**: colSpan: 2, rowSpan: 1

Return ONLY the valid JSON object. Do not include markdown formatting or any other text.`;

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Invalid input: description is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const userMessage = `Here is the user's business description: ${description}`;

    const result = await model.generateContent([systemPrompt, userMessage]);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedResponse = JSON.parse(cleanedText);

    const bento: Bento = {
      id: uuidv4(),
      type: 'swot',
      businessDescription: description,
      panels: parsedResponse.panels,
      timestamp: Date.now(),
    };

    return NextResponse.json(bento);
  } catch (error) {
    console.error('[generate-swot] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate SWOT bento', details: errorMessage }, { status: 500 });
  }
} 