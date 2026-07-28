import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiTransport,
  AiTransportRequest,
  AiTransportResponse,
} from './ai-transport';

type CloudflareAiSuccessBody = {
  result?: unknown;
  result_id?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getResponseText(data: unknown): string | null {
  if (!isRecord(data)) return null;

  return extractText(data.result);
}

function extractText(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.trim() ? value : null;
  }

  if (Array.isArray(value)) {
    const text = value
      .map((item) => extractText(item))
      .filter((item): item is string => Boolean(item))
      .join('\n')
      .trim();

    return text || null;
  }

  if (!isRecord(value)) return null;

  for (const key of [
    'response',
    'text',
    'generated_text',
    'output',
    'summary',
    'description',
  ]) {
    const text = extractText(value[key]);
    if (text) return text;
  }

  const choices = value.choices;
  if (Array.isArray(choices)) {
    const text = choices
      .map((choice) => {
        if (!isRecord(choice)) return null;
        const message = choice.message;
        return isRecord(message)
          ? extractText(message.content)
          : extractText(choice.text);
      })
      .filter((item): item is string => Boolean(item))
      .join('\n')
      .trim();

    if (text) return text;
  }

  return null;
}

function getRequestId(data: CloudflareAiSuccessBody): string | undefined {
  const id = isRecord(data.result) ? data.result.id : data.result_id;
  return typeof id === 'string' ? id : undefined;
}

function summarizeShape(value: unknown): string {
  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }

  if (isRecord(value)) {
    return `object(${Object.keys(value).slice(0, 8).join(',')})`;
  }

  return typeof value;
}

@Injectable()
export class CloudflareAiTransport implements AiTransport {
  constructor(private readonly cfg: ConfigService) {}

  async complete(request: AiTransportRequest): Promise<AiTransportResponse> {
    const accountId = this.cfg.get<string>('ai.cloudflareAccountId');
    const apiToken = this.cfg.get<string>('ai.cloudflareApiToken');

    if (!accountId || !apiToken) {
      throw new Error(
        'Cloudflare Workers AI credentials are missing (CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN)',
      );
    }

    const models = this.cfg.get<string[]>('ai.models') ?? [];
    if (!models.length) {
      throw new Error('No Cloudflare Workers AI models are configured');
    }

    let lastError = '';

    for (const model of models) {
      const resp = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: request.messages,
            max_tokens: request.maxOutputTokens,
          }),
        },
      );

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        lastError = `${resp.status} ${resp.statusText} ${
          text ? `- ${text}` : ''
        }`;

        if (resp.status === 404) continue;

        throw new Error(`Cloudflare AI request failed: ${lastError}`);
      }

      let data: CloudflareAiSuccessBody;
      try {
        data = (await resp.json()) as CloudflareAiSuccessBody;
      } catch {
        throw new Error(
          `Cloudflare AI returned invalid JSON for model ${model}`,
        );
      }

      const text = getResponseText(data);
      if (text === null) {
        lastError = `unexpected response shape for model ${model}: ${summarizeShape(
          data.result,
        )}`;
        continue;
      }

      return {
        text,
        requestId: getRequestId(data),
        model,
      };
    }

    throw new Error(
      `Cloudflare AI request failed for all configured models (${models.join(
        ', ',
      )}): ${lastError}`,
    );
  }
}
