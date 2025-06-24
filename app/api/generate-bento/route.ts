import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { Bento } from '../../../lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const systemPrompt = `You are a business analysis expert and a visual storyteller. Your task is to transform a user's business description into a "Business Model Bento Box".

Your response MUST be a valid JSON object. This object must contain a "panels" array. Each object in the "panels" array represents a panel in a dynamic grid and must have the following properties:
- colSpan: number (The width of the panel in grid units. Total width of a row is 3.)
- rowSpan: number (The height of the panel in grid units.)
- data: An object with a "type" property and other properties based on that type.

Choose the best "type" for each piece of information from the following vocabulary:
- 'text': For standard descriptive text. Requires 'title' and 'content' properties.
- 'feature-large-text': For a key metric or headline fact. Requires 'label' and 'value' properties.
- 'competitors': For listing competitors. Requires 'title' and a 'competitors' array of objects with 'name' and 'domain'.

Construct the Bento using the following layout and panel types:
1.  **Why We Exist**: The company's mission. Use the 'text' type. (colSpan: 3, rowSpan: 1)
2.  **Positioning**: How the business is unique. Use the 'text' type. (colSpan: 2, rowSpan: 1)
3.  **Customer Challenge**: The main problem this business solves. Use the 'text' type. (colSpan: 1, rowSpan: 1)
4.  **Direct Competitors**: List 3-5 competitors. Use the 'competitors' type. (colSpan: 3, rowSpan: 1)

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
      type: 'business-model',
      businessDescription: description,
      panels: parsedResponse.panels,
      timestamp: Date.now(),
    };

    return NextResponse.json(bento);
  } catch (error) {
    console.error('[generate-bento] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate bento', details: errorMessage }, { status: 500 });
  }
} 