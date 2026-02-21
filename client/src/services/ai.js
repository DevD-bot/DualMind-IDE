// ── Multi-Provider AI Service ──────────────────────────────────
// Supports: Google Gemini | OpenAI | Anthropic | Groq | OpenRouter
//           Mistral | Cohere | DeepSeek | xAI Grok | Ollama (local)

export const PROVIDER_MODELS = {
    gemini: [
        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash ⚡' },
        { value: 'gemini-2.0-flash-thinking-exp', label: 'Gemini 2.0 Flash Thinking' },
        { value: 'gemini-2.5-pro-exp-03-25', label: 'Gemini 2.5 Pro (exp)' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
        { value: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash 8B' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
    openai: [
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini ⚡' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        { value: 'o1-mini', label: 'o1 Mini (reasoning)' },
        { value: 'o3-mini', label: 'o3 Mini (reasoning)' },
    ],
    anthropic: [
        { value: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet ✨' },
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
        { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku ⚡' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    ],
    groq: [
        { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B ⚡' },
        { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B' },
        { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Fastest)' },
        { value: 'llama3-70b-8192', label: 'Llama 3 70B' },
        { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
        { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
        { value: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill 70B' },
        { value: 'qwen-qwq-32b', label: 'Qwen QwQ 32B (reasoning)' },
    ],
    openrouter: [
        { value: 'openai/gpt-4o', label: 'GPT-4o (via OR)' },
        { value: 'openai/o3-mini', label: 'o3 Mini (via OR)' },
        { value: 'anthropic/claude-3.7-sonnet', label: 'Claude 3.7 Sonnet (via OR)' },
        { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (via OR)' },
        { value: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash (via OR)' },
        { value: 'google/gemini-2.5-pro-exp-03-25', label: 'Gemini 2.5 Pro (via OR)' },
        { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B (via OR)' },
        { value: 'deepseek/deepseek-r1', label: 'DeepSeek R1 (via OR)' },
        { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (via OR)' },
        { value: 'mistralai/mistral-large', label: 'Mistral Large (via OR)' },
        { value: 'qwen/qwq-32b', label: 'Qwen QwQ 32B (via OR)' },
        { value: 'x-ai/grok-2', label: 'Grok 2 (via OR)' },
        { value: 'cohere/command-r-plus', label: 'Cohere Command R+ (via OR)' },
    ],
    mistral: [
        { value: 'mistral-large-latest', label: 'Mistral Large ✨' },
        { value: 'mistral-small-latest', label: 'Mistral Small ⚡' },
        { value: 'codestral-latest', label: 'Codestral (code)' },
        { value: 'mistral-nemo', label: 'Mistral Nemo' },
        { value: 'open-mixtral-8x22b', label: 'Mixtral 8x22B' },
    ],
    deepseek: [
        { value: 'deepseek-chat', label: 'DeepSeek V3' },
        { value: 'deepseek-reasoner', label: 'DeepSeek R1 (reasoning)' },
    ],
    xai: [
        { value: 'grok-2-1212', label: 'Grok 2' },
        { value: 'grok-2-vision-1212', label: 'Grok 2 Vision' },
        { value: 'grok-beta', label: 'Grok Beta' },
    ],
    cohere: [
        { value: 'command-r-plus', label: 'Command R+' },
        { value: 'command-r', label: 'Command R ⚡' },
        { value: 'command', label: 'Command' },
    ],
    ollama: [
        { value: 'llama3.3', label: 'Llama 3.3 (local)' },
        { value: 'llama3.1', label: 'Llama 3.1 (local)' },
        { value: 'qwen2.5-coder', label: 'Qwen 2.5 Coder (local)' },
        { value: 'deepseek-r1', label: 'DeepSeek R1 (local)' },
        { value: 'mistral', label: 'Mistral (local)' },
        { value: 'codellama', label: 'CodeLlama (local)' },
        { value: 'phi4', label: 'Phi-4 (local)' },
    ],
};

export const PROVIDER_HINTS = {
    gemini: 'Get free key → aistudio.google.com',
    openai: 'Get key → platform.openai.com',
    anthropic: 'Get key → console.anthropic.com',
    groq: 'Get FREE key → console.groq.com',
    openrouter: 'Get key → openrouter.ai (200+ models via one key)',
    mistral: 'Get key → console.mistral.ai',
    deepseek: 'Get key → platform.deepseek.com (very cheap)',
    xai: 'Get key → console.x.ai',
    cohere: 'Get key → dashboard.cohere.com',
    ollama: 'No key needed — run Ollama locally (ollama.ai)',
};

// ── Gemini ──────────────────────────────────────
async function callGemini({ apiKey, model }, systemPrompt, userMsg, maxTokens) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userMsg }] }],
            generationConfig: { maxOutputTokens: maxTokens, temperature: 0.85 },
        }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Gemini ${res.status}`); }
    const d = await res.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── OpenAI-compatible (OpenAI, Groq, OpenRouter, Mistral, DeepSeek, xAI, Cohere, Ollama) ──
async function callOpenAICompat({ apiKey, model }, systemPrompt, userMsg, maxTokens, baseURL) {
    const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }],
            max_tokens: maxTokens,
            temperature: 0.85,
        }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `API ${res.status}`); }
    const d = await res.json();
    return d.choices?.[0]?.message?.content || '';
}

// ── Anthropic ────────────────────────────────────
async function callAnthropic({ apiKey, model }, systemPrompt, userMsg, maxTokens) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMsg }],
        }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Anthropic ${res.status}`); }
    const d = await res.json();
    return d.content?.[0]?.text || '';
}

// ── Cohere ───────────────────────────────────────
async function callCohere({ apiKey, model }, systemPrompt, userMsg, maxTokens) {
    const res = await fetch('https://api.cohere.com/v2/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMsg },
            ],
            max_tokens: maxTokens,
        }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.message || `Cohere ${res.status}`); }
    const d = await res.json();
    return d.message?.content?.[0]?.text || '';
}

// ── Main dispatcher ──────────────────────────────
export async function callModel(agentCfg, systemPrompt, userMsg, maxTokens = 700) {
    const { provider } = agentCfg;
    switch (provider) {
        case 'gemini': return callGemini(agentCfg, systemPrompt, userMsg, maxTokens);
        case 'openai': return callOpenAICompat(agentCfg, systemPrompt, userMsg, maxTokens, 'https://api.openai.com/v1');
        case 'groq': return callOpenAICompat(agentCfg, systemPrompt, userMsg, maxTokens, 'https://api.groq.com/openai/v1');
        case 'openrouter': return callOpenAICompat(agentCfg, systemPrompt, userMsg, maxTokens, 'https://openrouter.ai/api/v1');
        case 'anthropic': return callAnthropic(agentCfg, systemPrompt, userMsg, maxTokens);
        case 'mistral': return callOpenAICompat(agentCfg, systemPrompt, userMsg, maxTokens, 'https://api.mistral.ai/v1');
        case 'deepseek': return callOpenAICompat(agentCfg, systemPrompt, userMsg, maxTokens, 'https://api.deepseek.com/v1');
        case 'xai': return callOpenAICompat(agentCfg, systemPrompt, userMsg, maxTokens, 'https://api.x.ai/v1');
        case 'cohere': return callCohere(agentCfg, systemPrompt, userMsg, maxTokens);
        case 'ollama': return callOpenAICompat(agentCfg, systemPrompt, userMsg, maxTokens, 'http://localhost:11434/v1');
        default: throw new Error(`Unknown provider: ${provider}`);
    }
}

export function extractCode(text) {
    const m = text.match(/```[\w]*\n?([\s\S]*?)```/);
    return m ? m[1].trim() : text.trim();
}

export function extractJSON(text) {
    const m = text.match(/\[[\s\S]*\]/);
    if (!m) throw new Error('AI did not return a valid JSON file list. Try again.');
    return JSON.parse(m[0]);
}
