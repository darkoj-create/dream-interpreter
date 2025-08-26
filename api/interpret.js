export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { dream: dreamRaw } = req.body || {};
    const dream = (dreamRaw || "").toString().slice(0, 2000);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY env" });

    const payload = {
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: "Ti si tumač snova. Odgovaraj na hrvatskom, jasno i konkretno. Daj 2–3 moguća tumačenja i 3 praktična savjeta." },
        { role: "user", content: dream }
      ]
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
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

