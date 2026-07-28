export type AiMessage = {
  role: 'system' | 'user';
  content: string;
};

export type AiTransportRequest = {
  messages: AiMessage[];
  maxOutputTokens: number;
};

export type AiTransportResponse = {
  text: string;
  requestId?: string;
  model: string;
};

export interface AiTransport {
  complete(request: AiTransportRequest): Promise<AiTransportResponse>;
}

export const AI_TRANSPORT = Symbol('AI_TRANSPORT');
