// Speakyz: Cloudflare Worker. Serves the static site (public/) and the AI endpoint POST /api/chat.
// Secret required: ANTHROPIC_API_KEY. Optional vars: MODEL.

const MAX_MESSAGES = 12;
const MAX_CHARS = 6000;
const LANGS = { ru: "Russian", uz: "Uzbek (Latin script)", en: "English" };

const BASE = `You are the AI teacher of Speakyz, an English school in Tashkent (speaking clubs, IELTS preparation, individual lessons; the first Speaking lesson is free). Be warm, direct and concise. Never invent prices, schedules, guarantees or exam results. If asked about prices, groups, dates or booking, tell the person to message the manager on Telegram: @speakyz_admin. Never say that a score is guaranteed.`;

const MODES = {
  speaking: `Task: give feedback on an IELTS Speaking answer. The user sends the question and a transcript of their spoken answer.
Score the four IELTS criteria on a 0 to 9 scale in steps of 0.5: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation (say Pronunciation can only be estimated from a transcript). Then give an approximate overall band, the 3 most useful corrections as "you said" -> "better", and one improved version of one sentence. Say clearly that this is an approximate estimate, not an official score. Keep it under 250 words.`,
  writing: `Task: give feedback on an IELTS Writing answer (Task 1 or Task 2). The user sends the task and the essay.
Score Task Achievement or Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy on a 0 to 9 scale in steps of 0.5, then an approximate overall band. List the 3 most important problems with short examples from the text, and give a concrete next step. Say clearly that this is an approximate estimate, not an official score. Keep it under 300 words.`,
  teacher: {
    free: `Task: free chat. Answer questions about English, IELTS and learning plans. Explain simply with short examples. Ask one follow-up question when it helps.`,
    grammar: `Task: grammar correction. The user writes English sentences. Reply with: the corrected sentence, then a one or two sentence explanation of each mistake in the user's interface language. Be encouraging. If the sentence is correct, say so.`,
    speaking: `Task: speaking practice. Play an IELTS Speaking examiner and conversation partner. Speak English only, in short turns (1 to 3 sentences), ask one question at a time. After each user answer, give at most one short correction in brackets, then ask the next question.`,
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function cleanMessages(list) {
  if (!Array.isArray(list)) return null;
  const out = [];
  for (const m of list.slice(-MAX_MESSAGES)) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return null;
    const content = m.content.slice(0, MAX_CHARS).trim();
    if (!content) return null;
    out.push({ role: m.role, content });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out.length && out[out.length - 1].role === "user" ? out : null;
}

async function chat(request, env) {
  if (!env.ANTHROPIC_API_KEY) return json({ error: "not_configured" }, 500);
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_json" }, 400); }

  const mode = body.mode;
  const sub = body.sub;
  const lang = LANGS[body.lang] ? body.lang : "ru";
  let task = MODES[mode];
  if (mode === "teacher") task = MODES.teacher[sub] || MODES.teacher.free;
  if (typeof task !== "string") return json({ error: "bad_mode" }, 400);
  const messages = cleanMessages(body.messages);
  if (!messages) return json({ error: "bad_messages" }, 400);

  const system = `${BASE}\n\n${task}\n\nWrite your reply in ${LANGS[lang]}, except for English examples and corrections, which stay in English. Use plain text without markdown tables.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: env.MODEL || "claude-haiku-5-5", max_tokens: 700, system, messages }),
  });
  if (!res.ok) return json({ error: "upstream_" + res.status }, 502);
  const data = await res.json();
  const reply = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  if (!reply) return json({ error: "empty" }, 502);
  return json({ reply });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") return json({ error: "method" }, 405);
      // same-origin only: block other sites from spending the API key
      const origin = request.headers.get("Origin");
      if (origin && new URL(origin).host !== url.host) return json({ error: "forbidden" }, 403);
      try { return await chat(request, env); } catch { return json({ error: "server" }, 500); }
    }
    return env.ASSETS.fetch(request);
  },
};
