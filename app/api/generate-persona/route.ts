import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Bento, AssessmentResult, Persona } from '../../../lib/types';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const getSystemPrompt = (bento: Bento, results: AssessmentResult[]): string => `
You are a world-class marketing strategist and storyteller. Based on the provided business context and the business owner's assessment of their customers (scores: -1=disagree, 0=neutral, 1=agree), create a detailed, realistic customer persona. The persona should feel like a real person that is a potential customer for the described business.

BUSINESS CONTEXT
- Business Model: ${bento.businessModel}
- Customer Challenge: ${bento.customerChallenge}
- Product/Service: ${bento.productService}
- Positioning: ${bento.positioning}
- Why We Exist: ${bento.whyWeExist}
- Competitors: ${bento.competitors.map(c => c.name).join(', ')}

ASSESSMENT RESULTS
${results.map(r => `- ${r.dimension}: ${r.score === 1 ? 'agree' : r.score === 0 ? 'neutral' : 'disagree'}`).join('\n')}

INSTRUCTIONS
Generate a JSON object with EXACTLY this TypeScript structure:
\`\`\`json
{
  "name": "string (e.g., 'Alex Chen')",
  "age": "number (e.g., 42)",
  "role": "string (The persona's job title or primary role, e.g., 'Senior Project Manager')",
  "experience": "string (A brief summary of their years/type of experience, e.g., '15 years in tech')",
  "bio": "string (A 2-3 sentence summary of the persona's professional life, their core motivations, and primary frustrations related to their work.)",
  "interests": "string (A short paragraph describing their relevant professional and personal interests.)",
  "disinterests": "string (A short paragraph describing things they dislike or find uninteresting, both professionally and personally.)",
  "insights": "string (A single paragraph of 3-4 actionable insights for a business owner trying to connect with this persona. What are their key purchasing drivers? What messages will resonate? What are their biggest unmet needs?)",
  "visualDescriptor": "string (A detailed visual description for an image generator. Describe their appearance, clothing, and a subtle expression that hints at their personality. e.g., 'A 42-year-old Asian man with glasses, wearing a sharp, well-fitting business-casual shirt. He has a focused, determined expression.')"
}
\`\`\`

Return ONLY the JSON object. Do not include markdown formatting, backticks, or any explanatory text.
`;

async function generatePersona(
  bento: Bento, 
  results: AssessmentResult[], 
  existingPersonaId?: string
): Promise<Persona> {
  const systemPrompt = getSystemPrompt(bento, results);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const result = await model.generateContent(systemPrompt);
  const response = await result.response;
  const text = response.text();

  // The model should return a JSON object. We'll try to parse it.
  try {
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const personaData = JSON.parse(cleanedText);
    
    // Use existing ID if provided, otherwise generate a new one
    const personaId = existingPersonaId || uuidv4();
    const personaWithId = { ...personaData, id: personaId };

    // Generate Persona Image
    let imageUrl: string | null = null;
    const imagePrompt = `a photorealistic headshot of ${personaWithId.visualDescriptor}. The subject should be looking directly at the camera with a neutral, yet confident expression. The background must be a solid, pure white, empty background. The final image must be ultra-realistic, high resolution, 8k, and suitable for a corporate website or LinkedIn profile. Do not include shoulders or torso.`;
    
    try {
      console.log(`[generate-persona] Generating image with prompt: "${imagePrompt}"`);
      const imageApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`;
      
      const imageResponse = await fetch(imageApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: imagePrompt }],
          parameters: { sampleCount: 1 }
        })
      });

      if (!imageResponse.ok) {
        const errorBody = await imageResponse.text();
        throw new Error(`Image generation API failed with status ${imageResponse.status}: ${errorBody}`);
      }

      const imageResult = await imageResponse.json();
      
      if (imageResult.predictions && imageResult.predictions.length > 0) {
        const base64Data = imageResult.predictions[0].bytesBase64Encoded;
        imageUrl = `data:image/png;base64,${base64Data}`;
        console.log('[generate-persona] Image generated successfully.');
      } else {
        console.error('[generate-persona] No image data found in API response:', imageResult);
      }
    } catch (imageError) {
      console.error('[generate-persona] Image generation failed:', imageError);
    }

    const finalPersona: Persona = {
      ...personaWithId,
      imageUrl: imageUrl,
    };

    return finalPersona;
  } catch (e) {
    console.error("Failed to parse JSON from model:", text, e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error parsing model response';
    throw new Error(errorMessage);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bento, results, existingPersonaId } = await req.json();
    if (!bento || !results) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
    }
    
    const finalPersona = await generatePersona(bento, results, existingPersonaId);
    return NextResponse.json(finalPersona);

  } catch (err: any) {
    console.error('[generate-persona] CATCH BLOCK ERROR:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Server error', details: errorMessage }, { status: 500 });
  }
} 