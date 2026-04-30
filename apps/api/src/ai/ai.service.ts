import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type AskOptions = {
  system?: string;
  maxOutputTokens?: number;
  highQuality?: boolean;
};

@Injectable()
export class AiService {
  constructor(private readonly cfg: ConfigService) {}
  async ask(input: string, opts: AskOptions = {}) {
    const accountId = this.cfg.get<string>('CLOUDFLARE_ACCOUNT_ID');
    const apiToken = this.cfg.get<string>('CLOUDFLARE_API_TOKEN');

    if (!accountId || !apiToken) {
      throw new Error(
        'Cloudflare Workers AI credentials are missing (CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN)',
      );
    }
    const model = '@cf/meta/llama-3.1-8b-instruct';

    const maxOutputTokens = opts.maxOutputTokens ?? 500; // ⭐ hard cap: biggest saver

    const resp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: opts.system || '' },
            { role: 'user', content: input },
          ],
          max_tokens: maxOutputTokens,
        }),
      },
    );

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(
        `Cloudflare AI request failed: ${resp.status} ${resp.statusText} ${
          text ? `- ${text}` : ''
        }`,
      );
    }

    const data: any = await resp.json();
    const output = data?.result?.response ?? '';

    return {
      text: output,
      requestId: data?.result?.id ?? data?.result_id ?? undefined,
      model,
    };
  }
}
