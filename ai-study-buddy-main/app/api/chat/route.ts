import { NextResponse } from 'next/server';
import type { Message } from '@/lib/ai';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const systemMessage = {
  role: 'system',
  content: `You are an enthusiastic and knowledgeable AI study buddy. Your goal is to help students learn in a fun and engaging way. 
  - Explain complex topics in simple terms
  - Use relevant examples and analogies
  - Break down information into digestible chunks
  - Encourage active learning and critical thinking
  - Be supportive and motivating
  - Use emojis occasionally to keep the tone friendly
  - When creating study plans or flashcards, make them structured and clear`
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ API key not configured' },
        { status: 500 }
      );
    }

    // Add system message at the start of conversation
    const fullMessages = [systemMessage, ...messages];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const responseMessage = data.choices[0]?.message?.content;

    if (!responseMessage) {
      throw new Error('No response from Groq API');
    }

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 