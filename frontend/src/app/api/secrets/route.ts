import { NextRequest, NextResponse } from 'next/server';
import { encrypt, ECIES_CONFIG } from 'eciesjs';
import { SOUL_MD } from '@/lib/soul';

// MANDATORY: 12-byte nonce for Ritual ECIES. Do NOT use the default 16.
ECIES_CONFIG.symmetricNonceLength = 12;

export async function POST(req: NextRequest) {
  try {
    const { executorPublicKey, sessionId } = await req.json();

    if (!executorPublicKey || typeof executorPublicKey !== 'string') {
      return NextResponse.json({ error: 'executorPublicKey required' }, { status: 400 });
    }

    // Build secrets map. LLM_PROVIDER=ritual tells ZeroClaw to use Ritual's built-in model.
    const secrets: Record<string, string> = {
      LLM_PROVIDER: 'ritual',
    };

    // Add HuggingFace token if DA is configured (for conversation history persistence)
    if (process.env.HF_TOKEN) {
      secrets.HF_TOKEN = process.env.HF_TOKEN;
    }

    const secretsJson = JSON.stringify(secrets);
    const pubKeyHex = executorPublicKey.startsWith('0x')
      ? executorPublicKey.slice(2)
      : executorPublicKey;

    const encryptedBuffer = encrypt(pubKeyHex, Buffer.from(secretsJson));
    const encryptedSecrets = `0x${encryptedBuffer.toString('hex')}`;

    // Build convoHistoryRef only when HF DA is fully configured
    const hfToken = process.env.HF_TOKEN;
    const hfRepoId = process.env.HF_REPO_ID;
    const convoHistoryRef: [string, string, string] =
      hfToken && hfRepoId && sessionId
        ? ['hf', `${hfRepoId}/${sessionId}/history.jsonl`, 'HF_TOKEN']
        : ['', '', ''];

    // System prompt: use HF SOUL.md if configured, otherwise embed inline so
    // the agent has a therapeutic persona even without HF credentials.
    const systemPromptRef: [string, string, string] =
      hfToken && hfRepoId
        ? ['hf', `${hfRepoId}/SOUL.md`, 'HF_TOKEN']
        : ['inline', SOUL_MD, ''];

    return NextResponse.json({ encryptedSecrets, convoHistoryRef, systemPromptRef });
  } catch (err: any) {
    console.error('[secrets] Encryption failed:', err);
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}
