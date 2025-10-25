// Server-side only
export async function callGemini(prompt: string, systemPrompt: string = ''): Promise<string> {
  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'; // Updated to 2.5-flash (latest)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not set');
  }

  const payload = {
    contents: [{
      parts: [{ text: systemPrompt + '\n\nUser: ' + prompt }]
    }]
  };

  const response = await fetch(GEMINI_URL, {  // Removed ?key=, use header
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY 
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}