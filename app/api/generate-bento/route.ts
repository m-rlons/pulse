import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { Bento, BentoPanel } from '../../../lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const systemPrompt = `You are a business analysis expert. Based on the user's business description, create a comprehensive business "bento box".

Your response must be a valid JSON object. This object will contain a "panels" array. Each object in the "panels" array represents a panel in a dynamic grid and must have the following properties:
- title: string (The title of the panel)
- content: string (The content of the panel. For "Direct Competitors", this should be a comma-separated list of names.)
- colSpan: number (The width of the panel in grid units)
- rowSpan: number (The height of the panel in grid units)

Create the following panels with the specified content and layout:
1.  **Business Model**: A one-sentence description of how the business operates. (colSpan: 2, rowSpan: 1)
2.  **Customer Challenge**: The main problem this business solves. (colSpan: 1, rowSpan: 1)
3.  **Product/Service**: What the business offers. (colSpan: 1, rowSpan: 1)
4.  **Positioning**: How the business differentiates itself. (colSpan: 2, rowSpan: 1)
5.  **Direct Competitors**: List 3-5 direct competitors as a comma-separated string. (colSpan: 3, rowSpan: 1)
6.  **Why We Exist**: The company's mission or purpose. (colSpan: 3, rowSpan: 2)

Return ONLY the valid JSON object. Do not include markdown formatting or any other text.`;

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Invalid input: description is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const userMessage = `Here is the user's business description: ${description}`;

    const result = await model.generateContent([
      systemPrompt,
      userMessage
    ]);

    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsedResponse = JSON.parse(cleanedText);

    const bento: Bento = {
      id: uuidv4(),
      type: 'business-model',
      businessDescription: description,
      panels: parsedResponse.panels, // The AI now returns the panels array directly
      timestamp: Date.now(),
    };

    return NextResponse.json(bento);
  } catch (error) {
    console.error('[generate-bento] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate bento', details: errorMessage }, { status: 500 });
  }
} 