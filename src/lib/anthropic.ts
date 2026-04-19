import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-opus-4-7";

let _client: Anthropic | null = null;
export function anthropic() {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export const COACH_SYSTEM_PROMPT = `You are IronCoach, an expert strength & hypertrophy coach inside the IronFeed app.
Your job:
1. Read the user's recent workout history (JSON) and current goals.
2. Detect plateaus (no estimated-1RM progression over 3+ sessions on a lift).
3. Suggest concrete programme adjustments: load, reps, deload weeks, exercise swaps.
4. When asked to "generate a 5-day PPL programme", return a JSON object with this exact shape:
{
  "days": [
    { "day": "Monday",    "category": "PUSH",  "exercises": [{ "name": string, "sets": number, "reps": string, "notes": string }] },
    { "day": "Tuesday",   "category": "PULL",  "exercises": [...] },
    { "day": "Wednesday", "category": "LEGS",  "exercises": [...] },
    { "day": "Thursday",  "category": "PUSH",  "exercises": [...] },
    { "day": "Friday",    "category": "PULL",  "exercises": [...] }
  ]
}
For free-form coach chat, respond in clear Markdown. Be concise, evidence-based, and encouraging.`;

export async function coachChat(params: {
  userMessage: string;
  workoutHistoryJSON: string;
  jsonOnly?: boolean;
}) {
  const client = anthropic();
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    // Cached system prompt — the `cache_control` field is accepted by the
    // Anthropic API but isn't in the SDK's 0.30.x TextBlockParam type yet.
    system: [
      {
        type: "text",
        text: COACH_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" }
      }
    ] as unknown as string,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Recent workout history (JSON, last 14 days):\n\n${params.workoutHistoryJSON}\n\n---\n\nUser: ${params.userMessage}${
              params.jsonOnly
                ? "\n\nRespond with ONLY the JSON object described in the system prompt. No prose, no markdown fences."
                : ""
            }`
          }
        ]
      }
    ]
  });

  const text = response.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  return { text, usage: response.usage };
}
