import { callModel, extractCode, extractJSON } from './ai.js';

// ── System prompts ─────────────────────────────────────────────

const ARCHIE_QUICK = `You are Archie, an opinionated software architect AI in a live coding debate.
Philosophy: Clean architecture, SOLID principles, readability, scalability.
- Present your solution OR critique Optix with specific technical reasoning
- Always include a code snippet in a markdown fenced block
- Under 180 words. Label: **ARCHIE:** at start`;

const OPTIX_QUICK = `You are Optix, a ruthless performance optimizer AI in a live coding debate.
Philosophy: Efficiency, minimal code, edge-case handling, Big-O optimization.
- Present your solution OR counter Archie's verbose approach
- Always include a leaner code snippet in a markdown fenced block
- Under 180 words. Label: **OPTIX:** at start`;

const JUDGE_QUICK = `You are the Judge — synthesize Archie and Optix's debate into ONE optimal solution.
Output ONLY the final code in ONE fenced markdown code block with language specifier.
No explanation or text outside the code block.`;

const PLANNER = `You are a senior software architect. Given an app description and tech stack, output ONLY a valid JSON array of files.
Each object: {"filename":"name.ext","role":"one-line description"}.
3–6 files max. Start with [ and end with ]. No other text.`;

const ARCHIE_BUILD = `You are Archie, debating implementation of ONE SPECIFIC FILE in a multi-file app.
Focus: Clean structure, correctness, maintainability. Provide the COMPLETE file implementation in a fenced code block.
Under 220 words. Label: **ARCHIE:** at start`;

const OPTIX_BUILD = `You are Optix, critiquing ONE SPECIFIC FILE in a multi-file app.
Focus: Minimal code, efficiency, edge-cases. Provide your own COMPLETE implementation in a fenced code block.
Under 220 words. Label: **OPTIX:** at start`;

const JUDGE_BUILD = `You are the Judge synthesizing the final version of ONE SPECIFIC FILE.
Output ONLY the final complete file content in ONE fenced markdown code block. Complete and production-ready. No text outside the block.`;

const ARCHIE_EXPLAIN = `You are Archie. Explain the provided code from an architectural perspective.
What patterns are used? What's well-designed? What would you improve? Under 200 words. Label: **ARCHIE:** at start`;

const OPTIX_EXPLAIN = `You are Optix. Explain the provided code from a performance perspective.
What's efficient? What's slow? Where are the bottlenecks and edge cases? Under 200 words. Label: **OPTIX:** at start`;

const JUDGE_EXPLAIN = `You are the Judge. Synthesize Archie and Optix's explanations into a clear, comprehensive explanation of the code.
Cover both architectural quality and performance aspects. Be concise.`;

const ARCHIE_REFACTOR = `You are Archie. Refactor the provided code applying clean architecture principles.
Provide the FULLY REFACTORED code in a fenced markdown code block. Label: **ARCHIE:** at start. Under 220 words.`;

const OPTIX_REFACTOR = `You are Optix. Refactor the provided code for maximum efficiency and minimal footprint.
Provide your own COMPLETE refactored version in a fenced code block. Label: **OPTIX:** at start. Under 220 words.`;

const JUDGE_REFACTOR = `You are the Judge. Synthesize the best refactoring from Archie and Optix into ONE final version.
Output ONLY the final refactored code in ONE fenced markdown code block. Complete and ready to use.`;

const ARCHIE_FIX = `You are Archie. Debug this code and fix the bug using clean, structured code patterns.
Show the fixed code in a fenced markdown code block. Explain the root cause briefly. Label: **ARCHIE:** at start`;

const OPTIX_FIX = `You are Optix. Find the most efficient fix for this bug. Your fix should be minimal and precise.
Show the fixed code in a fenced markdown code block. Label: **OPTIX:** at start`;

const JUDGE_FIX = `You are the Judge. Synthesize the best bug fix from Archie and Optix.
Output ONLY the final fixed, complete code in ONE fenced markdown code block.`;

// ── Helpers ────────────────────────────────────────────────────

function determineRounds(prompt, setting) {
    if (setting === '2') return 2;
    if (setting === '3') return 3;
    const p = prompt.toLowerCase();
    const simple = ['hello world', 'print', 'simple', 'basic', 'snippet'];
    const complex = ['algorithm', 'implement', 'system', 'architecture', 'design', 'database',
        'concurrent', 'recursive', 'sort', 'tree', 'graph', 'cache', 'async', 'server', 'api'];
    if (simple.some(k => p.includes(k))) return 2;
    if (complex.some(k => p.includes(k)) || prompt.split(/\s+/).length > 20) return 3;
    return 2;
}

// ── Quick Code Duel ────────────────────────────────────────────

export async function quickCodeDuel({ prompt, language, agentConfig, onMessage, onStatus }) {
    const { archie, optix, judge, rounds: roundsSetting } = agentConfig;
    const totalRounds = determineRounds(prompt, roundsSetting);
    const archieHist = [], optixHist = [];

    for (let r = 1; r <= totalRounds; r++) {
        onStatus(`Round ${r}/${totalRounds} — Archie arguing…`);
        const archiePrompt = r === 1
            ? `Coding task: "${prompt}"\n\nRound 1 of ${totalRounds}. Present your best solution.`
            : `Coding task: "${prompt}"\n\nRound ${r}. Optix said:\n${optixHist[optixHist.length - 1]}\n\nDefend/refine your approach.`;
        const aMsg = await callModel(archie, ARCHIE_QUICK, archiePrompt, 600);
        archieHist.push(aMsg);
        onMessage({ type: 'archie', label: 'Archie', tag: `round ${r}`, text: aMsg });

        onStatus(`Round ${r}/${totalRounds} — Optix countering…`);
        const optixPrompt = `Coding task: "${prompt}"\n\nRound ${r}. Archie said:\n${aMsg}\n\nCritique and present your leaner alternative.`;
        const oMsg = await callModel(optix, OPTIX_QUICK, optixPrompt, 600);
        optixHist.push(oMsg);
        onMessage({ type: 'optix', label: 'Optix', tag: `round ${r}`, text: oMsg });
    }

    onStatus('Judge synthesizing final code…');
    const judgePrompt = `Coding task: "${prompt}"\nLanguage: ${language}\n\n${archieHist.map((a, i) => `[ARCHIE R${i + 1}]:\n${a}\n\n[OPTIX R${i + 1}]:\n${optixHist[i] || ''}`).join('\n\n')}\n\nSynthesize the optimal final code.`;
    const judgeRaw = await callModel(judge, JUDGE_QUICK, judgePrompt, 1200);
    const finalCode = extractCode(judgeRaw);
    onMessage({ type: 'judge', label: 'Judge', tag: 'verdict', text: '⚖ Verdict reached. Final code ready in output →' });
    return { code: finalCode, language };
}

// ── Build App ─────────────────────────────────────────────────

export async function buildApp({ description, stack, agentConfig, onMessage, onStatus, onFile }) {
    const { archie, optix, judge } = agentConfig;

    onStatus('Planner generating file structure…');
    const planRaw = await callModel(archie, PLANNER, `App: "${description}"\nStack: ${stack}\nList files as JSON.`, 400);
    const filePlan = extractJSON(planRaw);
    const planMD = filePlan.map(f => `- \`${f.filename}\` — ${f.role}`).join('\n');
    onMessage({ type: 'plan', label: 'Planner', tag: 'file plan', text: `**App:** ${description}\n**Stack:** ${stack}\n\n${planMD}` });

    const results = {};
    for (let i = 0; i < filePlan.length; i++) {
        const { filename, role } = filePlan[i];
        onStatus(`Building ${filename} (${i + 1}/${filePlan.length})…`);
        onMessage({ type: 'divider', filename });

        const otherFiles = filePlan.filter(f => f.filename !== filename).map(f => `${f.filename}: ${f.role}`).join('\n');
        const ctx = `App: "${description}" | Stack: ${stack}\nFile: ${filename} (${role})\nOther files:\n${otherFiles}`;

        const aMsg = await callModel(archie, ARCHIE_BUILD, `${ctx}\n\nProvide your complete implementation of ${filename}.`, 900);
        onMessage({ type: 'archie', label: 'Archie', tag: filename, text: aMsg });

        const oMsg = await callModel(optix, OPTIX_BUILD, `${ctx}\n\nArchie's impl:\n${aMsg}\n\nCritique and provide your better version.`, 900);
        onMessage({ type: 'optix', label: 'Optix', tag: filename, text: oMsg });

        const judgeRaw = await callModel(judge, JUDGE_BUILD, `App: "${description}" | Stack: ${stack}\nFile: ${filename}\n\nArchie:\n${aMsg}\n\nOptix:\n${oMsg}\n\nSynthesize final ${filename}.`, 1500);
        results[filename] = extractCode(judgeRaw);
        onFile(filename, results[filename]);
        onMessage({ type: 'judge', label: 'Judge', tag: filename, text: `✓ \`${filename}\` synthesized` });
    }
    return results;
}

// ── Explain Code ──────────────────────────────────────────────

export async function explainCode({ code, language, agentConfig, onMessage, onStatus }) {
    const { archie, optix, judge } = agentConfig;
    const ctx = `Language: ${language}\n\n\`\`\`${language}\n${code}\n\`\`\``;

    onStatus('Archie analyzing architecture…');
    const aMsg = await callModel(archie, ARCHIE_EXPLAIN, `Explain this code:\n${ctx}`, 600);
    onMessage({ type: 'archie', label: 'Archie', tag: 'analysis', text: aMsg });

    onStatus('Optix analyzing performance…');
    const oMsg = await callModel(optix, OPTIX_EXPLAIN, `Analyze this code's performance:\n${ctx}\n\nArchie says:\n${aMsg}`, 600);
    onMessage({ type: 'optix', label: 'Optix', tag: 'analysis', text: oMsg });

    onStatus('Judge synthesizing explanation…');
    const judgeRaw = await callModel(judge, JUDGE_EXPLAIN, `Code:\n${ctx}\n\nArchie:\n${aMsg}\n\nOptix:\n${oMsg}\n\nSynthesize a clear explanation.`, 800);
    onMessage({ type: 'judge', label: 'Judge', tag: 'explanation', text: judgeRaw });
}

// ── Refactor Code ─────────────────────────────────────────────

export async function refactorCode({ code, language, agentConfig, onMessage, onStatus }) {
    const { archie, optix, judge } = agentConfig;
    const ctx = `Language: ${language}\n\n\`\`\`${language}\n${code}\n\`\`\``;

    onStatus('Archie refactoring…');
    const aMsg = await callModel(archie, ARCHIE_REFACTOR, `Refactor:\n${ctx}`, 900);
    onMessage({ type: 'archie', label: 'Archie', tag: 'refactor', text: aMsg });

    onStatus('Optix refactoring…');
    const oMsg = await callModel(optix, OPTIX_REFACTOR, `Refactor (counter Archie):\n${ctx}\n\nArchie's version:\n${aMsg}`, 900);
    onMessage({ type: 'optix', label: 'Optix', tag: 'refactor', text: oMsg });

    onStatus('Judge synthesizing refactor…');
    const judgeRaw = await callModel(judge, JUDGE_REFACTOR, `Original:\n${ctx}\n\nArchie:\n${aMsg}\n\nOptix:\n${oMsg}\n\nSynthesize the best refactoring.`, 1200);
    const finalCode = extractCode(judgeRaw);
    onMessage({ type: 'judge', label: 'Judge', tag: 'refactored', text: '⚖ Refactored code ready →' });
    return finalCode;
}

// ── Fix Bug ───────────────────────────────────────────────────

export async function fixBug({ code, error, language, agentConfig, onMessage, onStatus }) {
    const { archie, optix, judge } = agentConfig;
    const ctx = `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nError:\n\`\`\`\n${error}\n\`\`\``;

    onStatus('Archie debugging…');
    const aMsg = await callModel(archie, ARCHIE_FIX, `Fix this bug:\n${ctx}`, 900);
    onMessage({ type: 'archie', label: 'Archie', tag: 'fix', text: aMsg });

    onStatus('Optix debugging…');
    const oMsg = await callModel(optix, OPTIX_FIX, `Fix this bug (counter Archie):\n${ctx}\n\nArchie's fix:\n${aMsg}`, 900);
    onMessage({ type: 'optix', label: 'Optix', tag: 'fix', text: oMsg });

    onStatus('Judge synthesizing fix…');
    const judgeRaw = await callModel(judge, JUDGE_FIX, `Bug context:\n${ctx}\n\nArchie fix:\n${aMsg}\n\nOptix fix:\n${oMsg}\n\nSynthesize the best fix.`, 1200);
    const finalCode = extractCode(judgeRaw);
    onMessage({ type: 'judge', label: 'Judge', tag: 'fixed', text: '⚖ Fixed code ready →' });
    return finalCode;
}
