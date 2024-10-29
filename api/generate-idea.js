export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }), 
            { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const { topic = 'any' } = await req.json();
    
    let prompt = "Generate one random, interesting idea that could be a project, business, or creative endeavor. Keep it concise, about 1-2 sentences. Make it practical and actionable.";
    
    if (topic !== 'any') {
        prompt += ` The idea should be related to ${topic}.`;
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPEN_AI_TOKEN}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: prompt
                    },
                    {
                        role: "user",
                        content: "Generate a random idea"
                    }
                ],
                temperature: 0.8,
                max_tokens: 100,
                presence_penalty: 0.6,
                frequency_penalty: 0.5
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error: ${error}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0]?.message?.content) {
            throw new Error('Invalid response format from OpenAI');
        }

        return new Response(
            JSON.stringify({ 
                idea: data.choices[0].message.content,
                timestamp: new Date().toISOString()
            }), 
            { 
                status: 200, 
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store'
                } 
            }
        );
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to generate idea' }), 
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
} 