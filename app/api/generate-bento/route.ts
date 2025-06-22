import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { Bento } from '../../../lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const systemPrompt = `You are a business analysis expert. Based on the user's business description, create a comprehensive business "bento box" with the following components:

1. Business Model: A one-sentence description of how the business operates
2. Customer Challenge: The main problem customers face that this business solves
3. Product/Service: A clear description of what the business offers
4. Positioning: How the business differentiates itself in the market
5. Why We Exist: The company's mission or purpose
6. Competitors: List 3-5 direct competitors

Return ONLY a valid JSON object with this structure:
{
  "businessModel": "string",
  "customerChallenge": "string",
  "productService": "string",
  "positioning": "string",
  "whyWeExist": "string",
  "competitors": ["competitor1", "competitor2", "competitor3"]
}`;

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Invalid input: description is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
      businessDescription: description,
      businessModel: parsedResponse.businessModel,
      customerChallenge: parsedResponse.customerChallenge,
      productService: parsedResponse.productService,
      positioning: parsedResponse.positioning,
      whyWeExist: parsedResponse.whyWeExist,
      competitors: parsedResponse.competitors,
      timestamp: Date.now(),
    };

    return NextResponse.json(bento);
  } catch (error) {
    console.error('[generate-bento] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate bento', details: errorMessage }, { status: 500 });
  }
} 