export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try { body = await req.json(); } 
  catch { 
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    }); 
  }

  const dreamRaw = (body?.dream || "").toString();
  const dream = dreamRaw.slice(0, 2000); // jednostan limit

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }

  const payload = {
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: "Ti si tumač snova. Odgovaraj na hrvatskom, jasno i konkretno. Daj 2–3 moguća tumačenja: simboličko i psihološko. Završi s 3 praktična savjeta za samorefleksiju." },
      { role: "user", content: dream }
    ]
  };

  try {
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
      return new Response(JSON.stringify({ error: "OpenAI error", detail: data }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    const content = data.choices?.[0]?.message?.content || "Nema sadržaja.";
    return new Response(JSON.stringify({ result: content }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
}
