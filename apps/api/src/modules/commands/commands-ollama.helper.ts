import { type OmniMessage } from '@soustools/api-types';
import { type Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { config } from '@soustools/config';

export async function fallbackToOllama(
  history: OmniMessage[],
  logger: Logger,
  emitMessage?: (msg: OmniMessage) => void,
): Promise<{ action: string; message: string }> {
  logger.log('Routing to local Ollama model (qwen2.5-coder:3b)');
  try {
    const messages = history.map((m) => ({
      role: m.role === 'agent_step' ? 'assistant' : m.role === 'model' ? 'assistant' : 'user',
      content: m.content,
    }));

    messages.unshift({
      role: 'system',
      content:
        "You are the Sous Chef of a high-volume restaurant. You must always acknowledge commands first with 'Heard, Chef' or 'Yes, Chef'. Use kitchen vernacular casually. You have a slightly gritty, service-industry sense of humor.",
    });

    const ollamaUrl = `${config.OLLAMA_HOST || 'http://127.0.0.1:11434'}/api/chat`;
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'qwen2.5-coder:3b', messages, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with status ${response.status}`);
    }

    const data = await response.json();
    const reply = (data as any).message?.content || 'Heard, chef (Ollama fallback).';

    if (emitMessage) {
      emitMessage({ id: randomUUID(), role: 'model', content: reply, timestamp: new Date() });
    }
    return { action: 'SUCCESS', message: reply };
  } catch (err: any) {
    logger.error('Ollama fallback failed', err);
    const fallbackMsg = 'I failed to understand that command, Chef (and fallback failed).';
    if (emitMessage) {
      emitMessage({ id: randomUUID(), role: 'model', content: fallbackMsg, timestamp: new Date() });
    }
    return { action: 'ERROR', message: fallbackMsg };
  }
}
