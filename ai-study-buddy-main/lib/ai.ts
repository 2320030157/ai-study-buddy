export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ApiResponse {
  message?: string;
  error?: string;
}

export async function sendMessage(messages: Message[]): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return { error: 'Failed to send message' };
  }
} 