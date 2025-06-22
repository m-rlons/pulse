import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Bento } from '../../../lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const getSystemPrompt = (bento: Bento, refinementDimension?: string | null): string => {
  if (refinementDimension) {
    return `
You are an expert in psychometric testing and market research. A business owner needs to better understand a specific aspect of their customer persona: **${refinementDimension}**.

Based on the following business context, generate 8-10 nuanced statements that will help clarify the persona's stance on **${refinementDimension}**. The statements should be debatable, not obviously true or false.

BUSINESS CONTEXT
- Business Model: ${bento.businessModel}
- Customer Challenge: ${bento.customerChallenge}
- Product/Service: ${bento.productService}
- Positioning: ${bento.positioning}

STATEMENTS JSON FORMAT
Generate a JSON object with a single key "statements" which is an array of objects.
Each object in the array must have a "dimension" key (which should be "${refinementDimension}") and a "text" key.

EXAMPLE:
{
  "statements": [
    { "dimension": "${refinementDimension}", "text": "Statement about the dimension." },
    { "dimension": "${refinementDimension}", "text": "Another statement about it." }
  ]
}

Return ONLY the JSON object.
`;
  }

  // --- Default prompt from before ---
  return `
You are an expert in psychometric testing and market research. Based on the provided business context, generate 20-25 debatable statements for a "Swipe Right/Left" style assessment. These statements will help a business owner understand their customer's values and motivations.

BUSINESS CONTEXT
- Business Model: ${bento.businessModel}
- Customer Challenge: ${bento.customerChallenge}
- Product/Service: ${bento.productService}
- Positioning: ${bento.positioning}
- Why We Exist: ${bento.whyWeExist}
- Competitors: ${bento.competitors.map(c => c.name).join(', ')}

INSTRUCTIONS
- Generate statements across these 5 dimensions: Price Sensitivity, Brand Loyalty, Innovation Adoption, Social Proof, and Convenience.
- Create 4-5 statements per dimension.
- The statements should be nuanced and debatable, not obviously true or false.

STATEMENTS JSON FORMAT
Generate a JSON object with a single key "statements" which is an array of objects.
Each object in the array must have a "dimension" key and a "text" key.

EXAMPLE:
{
  "statements": [
    { "dimension": "Price Sensitivity", "text": "I always check for discounts before buying." },
    { "dimension": "Brand Loyalty", "text": "I prefer sticking to brands I know and trust." }
  ]
}

Return ONLY the JSON object.
`;
};

export async function POST(req: NextRequest) {
  try {
    const { bento, refinementDimension } = await req.json();

    if (!bento) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const systemPrompt = getSystemPrompt(bento, refinementDimension);
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedStatements = JSON.parse(cleanedText);

    return NextResponse.json(parsedStatements);
  } catch (err: any) {
    console.error('[generate-statements] CATCH BLOCK ERROR:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
} 