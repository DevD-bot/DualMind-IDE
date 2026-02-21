import { callModel, extractCode, extractJSON } from './ai.js';

// ── Prompt builders ────────────────────────────────────────────

function debaterPrompt(agent, role) {
    return `You are ${agent.name}, an AI in a live coding debate. Your role: ${role || agent.role || 'Debater'}.
Present or defend your solution OR critique the previous response with specific technical reasoning.
Always include a code snippet in a fenced markdown code block.
Under 180 words. Start your reply with **${agent.name.toUpperCase()}:**`;
}

function judgePrompt(agent) {
    return `You are ${agent.name} — the final synthesizer. Review all debate responses and output ONE optimal solution.
Output ONLY the final code in ONE fenced markdown code block with language specifier.
No explanation or text outside the code block.`;
}

const PLANNER = `You are a senior software architect. Given an app description and tech stack, output ONLY a valid JSON array of files.
Each object: {"filename":"name.ext","role":"one-line description"}.
3–6 files max. Start with [ and end with ]. No other text.`;

// ── Helpers ────────────────────────────────────────────────────

function getDebaters(agentConfig) {
    // Support both new {agents:[]} and legacy {archie,optix,judge} shapes
    if (agentConfig.agents && agentConfig.agents.length >= 2) {
        const agents = agentConfig.agents;
        const debaters = agents.slice(0, -1);   // all except last
        const judge = agents[agents.length - 1]; // last = judge
        return { debaters, judge };
    }
    // Legacy fallback
    const debaters = [
        { ...agentConfig.archie, name: 'Archie', role: 'Architect' },
        { ...agentConfig.optix, name: 'Optix', role: 'Optimizer' },
    ];
    const judge = { ...agentConfig.judge, name: 'Judge', role: 'Synthesizer' };
    return { debaters, judge };
}

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
    const { debaters, judge } = getDebaters(agentConfig);
    const totalRounds = determineRounds(prompt, agentConfig.rounds);

    // Per-agent history
    const history = debaters.map(() => []);

    for (let r = 1; r <= totalRounds; r++) {
        for (let d = 0; d < debaters.length; d++) {
            const agent = debaters[d];
            onStatus(`Round ${r}/${totalRounds} — ${agent.name} arguing…`);

            const prevMsgs = debaters
                .filter((_, i) => i !== d)
                .flatMap((a, i) => history[i].length >= r ? [`${a.name} said:\n${history[i][r - 1]}`] : [])
                .join('\n\n');

            const userMsg = r === 1 && d === 0
                ? `Coding task: "${prompt}"\n\nRound 1 of ${totalRounds}. Present your best solution.`
                : `Coding task: "${prompt}"\n\nRound ${r}${prevMsgs ? `. Context:\n${prevMsgs}` : ''}.\n\nPresent/refine your approach.`;

            const msg = await callModel(agent, debaterPrompt(agent), userMsg, 600);
            history[d].push(msg);
            onMessage({ type: agent.name.toLowerCase(), label: agent.name, tag: `round ${r}`, text: msg, color: agent.color });
        }
    }

    // Judge synthesizes
    onStatus(`${judge.name} synthesizing final code…`);
    const transcript = debaters.map((a, i) =>
        history[i].map((m, r) => `[${a.name} R${r + 1}]:\n${m}`).join('\n\n')
    ).join('\n\n---\n\n');
    const judgeRaw = await callModel(judge, judgePrompt(judge),
        `Coding task: "${prompt}"\nLanguage: ${language}\n\n${transcript}\n\nSynthesize the optimal final code.`, 1200);
    const finalCode = extractCode(judgeRaw);
    onMessage({ type: judge.name.toLowerCase(), label: judge.name, tag: 'verdict', text: '⚖ Verdict reached. Final code ready in output →', color: judge.color });
    return { code: finalCode, language };
}

// ── Build App ─────────────────────────────────────────────────

export async function buildApp({ description, stack, agentConfig, onMessage, onStatus, onFile }) {
    const { debaters, judge } = getDebaters(agentConfig);
    const planner = debaters[0];

    onStatus('Planner generating file structure…');
    const planRaw = await callModel(planner, PLANNER, `App: "${description}"\nStack: ${stack}\nList files as JSON.`, 400);
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

        let prevMsg = '';
        const buildSys = (agent) =>
            `You are ${agent.name}, debating implementation of ONE SPECIFIC FILE in a multi-file app. Role: ${agent.role || 'Architect'}.
Focus: Correctness and quality. Provide the COMPLETE file implementation in a fenced code block.
Under 220 words. Start with **${agent.name.toUpperCase()}:**`;

        for (const agent of debaters) {
            const userMsg = `${ctx}\n\nProvide your complete implementation of ${filename}.${prevMsg ? `\n\nPrevious agent said:\n${prevMsg}` : ''}`;
            const msg = await callModel(agent, buildSys(agent), userMsg, 900);
            prevMsg = msg;
            onMessage({ type: agent.name.toLowerCase(), label: agent.name, tag: filename, text: msg, color: agent.color });
        }

        const finalDebate = `App: "${description}" | Stack: ${stack}\nFile: ${filename}\n\nDebate:\n${prevMsg}\n\nSynthesize final ${filename}.`;
        const judgeRaw = await callModel(judge, judgePrompt(judge), finalDebate, 1500);
        results[filename] = extractCode(judgeRaw);
        onFile(filename, results[filename]);
        onMessage({ type: judge.name.toLowerCase(), label: judge.name, tag: filename, text: `✓ \`${filename}\` synthesized`, color: judge.color });
    }
    return results;
}

// ── Explain Code ──────────────────────────────────────────────

export async function explainCode({ code, language, agentConfig, onMessage, onStatus }) {
    const { debaters, judge } = getDebaters(agentConfig);
    const ctx = `Language: ${language}\n\n\`\`\`${language}\n${code}\n\`\`\``;

    const explainSys = (agent) =>
        `You are ${agent.name}. Explain the provided code from your unique perspective (role: ${agent.role || 'Analyst'}).
What patterns are used? What's well/poorly designed? Under 200 words. Start with **${agent.name.toUpperCase()}:**`;

    let latestMsg = '';
    for (const agent of debaters) {
        onStatus(`${agent.name} analyzing…`);
        const msg = await callModel(agent, explainSys(agent),
            `Explain this code:\n${ctx}${latestMsg ? `\n\nPrevious analysis:\n${latestMsg}` : ''}`, 600);
        latestMsg = msg;
        onMessage({ type: agent.name.toLowerCase(), label: agent.name, tag: 'analysis', text: msg, color: agent.color });
    }

    onStatus(`${judge.name} synthesizing explanation…`);
    const judgeRaw = await callModel(judge,
        `You are ${judge.name}. Synthesize all agents' explanations into one clear, comprehensive explanation.`,
        `Code:\n${ctx}\n\nAgent analyses:\n${latestMsg}\n\nSynthesize a clear explanation.`, 800);
    onMessage({ type: judge.name.toLowerCase(), label: judge.name, tag: 'explanation', text: judgeRaw, color: judge.color });
}

// ── Refactor Code ─────────────────────────────────────────────

export async function refactorCode({ code, language, agentConfig, onMessage, onStatus }) {
    const { debaters, judge } = getDebaters(agentConfig);
    const ctx = `Language: ${language}\n\n\`\`\`${language}\n${code}\n\`\`\``;

    const refactorSys = (agent) =>
        `You are ${agent.name}. Refactor the provided code applying your philosophy (role: ${agent.role || 'Refactorer'}).
Provide the FULLY REFACTORED code in a fenced markdown code block. Under 220 words. Start with **${agent.name.toUpperCase()}:**`;

    let latestMsg = '';
    for (const agent of debaters) {
        onStatus(`${agent.name} refactoring…`);
        const msg = await callModel(agent, refactorSys(agent),
            `Refactor:\n${ctx}${latestMsg ? `\n\nPrevious agent's version:\n${latestMsg}` : ''}`, 900);
        latestMsg = msg;
        onMessage({ type: agent.name.toLowerCase(), label: agent.name, tag: 'refactor', text: msg, color: agent.color });
    }

    onStatus(`${judge.name} synthesizing refactor…`);
    const judgeRaw = await callModel(judge,
        `You are ${judge.name}. Synthesize the best refactoring from all agents. Output ONLY the final code in a fenced code block.`,
        `Original:\n${ctx}\n\nRefactoring debate:\n${latestMsg}\n\nSynthesize the best refactoring.`, 1200);
    const finalCode = extractCode(judgeRaw);
    onMessage({ type: judge.name.toLowerCase(), label: judge.name, tag: 'refactored', text: '⚖ Refactored code ready →', color: judge.color });
    return finalCode;
}

// ── Fix Bug ───────────────────────────────────────────────────

export async function fixBug({ code, error, language, agentConfig, onMessage, onStatus }) {
    const { debaters, judge } = getDebaters(agentConfig);
    const ctx = `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nError:\n\`\`\`\n${error}\n\`\`\``;

    const fixSys = (agent) =>
        `You are ${agent.name}. Debug this code and propose your fix (role: ${agent.role || 'Debugger'}).
Show the fixed code in a fenced markdown code block. Explain the root cause briefly. Under 220 words. Start with **${agent.name.toUpperCase()}:**`;

    let latestMsg = '';
    for (const agent of debaters) {
        onStatus(`${agent.name} debugging…`);
        const msg = await callModel(agent, fixSys(agent),
            `Fix this bug:\n${ctx}${latestMsg ? `\n\nPrevious agent's fix:\n${latestMsg}` : ''}`, 900);
        latestMsg = msg;
        onMessage({ type: agent.name.toLowerCase(), label: agent.name, tag: 'fix', text: msg, color: agent.color });
    }

    onStatus(`${judge.name} synthesizing fix…`);
    const judgeRaw = await callModel(judge,
        `You are ${judge.name}. Synthesize the best bug fix. Output ONLY the final fixed code in ONE fenced code block.`,
        `Bug context:\n${ctx}\n\nFix debate:\n${latestMsg}\n\nSynthesize the best fix.`, 1200);
    const finalCode = extractCode(judgeRaw);
    onMessage({ type: judge.name.toLowerCase(), label: judge.name, tag: 'fixed', text: '⚖ Fixed code ready →', color: judge.color });
    return finalCode;
}
