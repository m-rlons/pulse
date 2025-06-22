import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Bento, AssessmentResult, Persona } from '../../../lib/types';

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

export async function POST(req: NextRequest) {
  console.log('[generate-persona] Request received');
  try {
    const { bento, results } = await req.json();
    if (!bento || !Array.isArray(results)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Generate Persona Details
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const systemPrompt = getSystemPrompt(bento, results);
    
    const generationResult = await model.generateContent(systemPrompt);
    const generationResponse = await generationResult.response;
    const rawText = generationResponse.text();

    const cleanedText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedPersona = JSON.parse(cleanedText);

    // Generate Persona Image
    let imageUrl: string | null = null;
    const imagePrompt = `a realistic, professional headshot of ${parsedPersona.visualDescriptor}. The subject should be looking directly at the camera with a neutral, yet confident expression. The background must be a solid, plain white background. The final image must be photorealistic, high resolution, 8k, and suitable for a corporate website or LinkedIn profile.`;
    
    try {
      console.log(`[generate-persona] Generating image with prompt: "${imagePrompt}"`);
      const imageModel = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });
      
      const result = await imageModel.generateContent(imagePrompt);
      const response = await result.response;
      
      const firstPart = response.candidates?.[0]?.content?.parts[0];

      if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
        imageUrl = `data:image/png;base64,${firstPart.inlineData.data}`;
        console.log('[generate-persona] Image generated successfully.');
      } else {
        console.error('[generate-persona] No image data found in API response:', JSON.stringify(response, null, 2));
      }

    } catch (imageError) {
      console.error('[generate-persona] Image generation failed:', imageError);
      // Keep imageUrl as null if image generation fails
    }

    const finalPersona: Persona = {
      name: parsedPersona.name,
      age: parsedPersona.age,
      role: parsedPersona.role,
      experience: parsedPersona.experience,
      bio: parsedPersona.bio,
      interests: parsedPersona.interests,
      disinterests: parsedPersona.disinterests,
      insights: parsedPersona.insights,
      imageUrl: imageUrl,
    };

    return NextResponse.json(finalPersona);
  } catch (err: any) {
    console.error('[generate-persona] CATCH BLOCK ERROR:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
} 