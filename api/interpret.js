export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { dream: dreamRaw, lang = "hr" } = req.body || {};
    const dream = (dreamRaw || "").toString().slice(0, 2000);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY env" });

    const prompts = {
      hr: "Ti si tumač snova. Odgovaraj na hrvatskom jeziku jasno i praktično. Daj 2–3 simbolička i psihološka tumačenja te 3 praktična savjeta.",
      en: "You are a dream interpreter. Respond in English clearly and practically. Provide 2–3 symbolic/psychological interpretations and 3 actionable tips."
    };

    const payload = {
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: prompts[lang] || prompts.hr },
        { role: "user", content: dream }
      ]
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    if (!r.ok) {
      const detail = data?.error?.message || data?.message || data;
      return res.status(r.status).json({ error: "OpenAI error", detail });
    }

    const content = data.choices?.[0]?.message?.content || "Nema sadržaja.";
    return res.status(200).json({ result: content });

  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
