import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiTransport,
  AiTransportRequest,
  AiTransportResponse,
} from './ai-transport';

type CloudflareAiSuccessBody = {
  result?: {
    response?: unknown;
    id?: unknown;
  };
  result_id?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getResponseText(data: unknown): string | null {
  if (!isRecord(data) || !isRecord(data.result)) return null;

  const response = data.result.response;
  return typeof response === 'string' ? response : null;
}

function getRequestId(data: CloudflareAiSuccessBody): string | undefined {
  const id = data.result?.id ?? data.result_id;
  return typeof id === 'string' ? id : undefined;
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
        throw new Error(
          `Cloudflare AI returned an unexpected response shape for model ${model}`,
        );
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
