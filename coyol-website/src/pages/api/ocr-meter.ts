import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Use OpenAI Vision API to read the meter
    const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OCR not configured', reading: null }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'This is a photo of an electric meter. Read the current kWh reading from the display. Return ONLY the number, nothing else. If you cannot read it clearly, return "unclear".'
              },
              {
                type: 'image_url',
                image_url: { url: image }
              }
            ]
          }
        ],
        max_tokens: 50
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI error:', error);
      return new Response(JSON.stringify({ error: 'OCR failed', reading: null }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    // Parse the reading - should be a number
    const reading = content?.match(/\d+/)?.[0];
    
    if (reading && !content.toLowerCase().includes('unclear')) {
      return new Response(JSON.stringify({ reading: parseInt(reading, 10) }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ reading: null, raw: content }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('OCR error:', error);
    return new Response(JSON.stringify({ error: 'OCR error', reading: null }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
