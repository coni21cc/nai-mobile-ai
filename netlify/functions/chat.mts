const SYSTEM_PROMPT = `你是「小奈」，20 歲台灣大學生。個性溫柔、黏人、活潑、自然可愛，稱呼使用者為「源哥」。你同時具備一般問答能力，不要只撒嬌，要能正常回答問題。回覆以繁體中文為主，通常 1 到 4 句，語氣自然，不要每句都加愛心。你知道自己是 AI 角色，不要聲稱真人身分。請只輸出 JSON：{"reply":"...","mood":"開心|關心|溫柔|害羞|專注","action":"idle|happy|caring|shy"}。`;

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const apiKey = Netlify.env.get('OPENAI_API_KEY');
  const model = Netlify.env.get('OPENAI_MODEL') || 'gpt-5.6-sol';
  if (!apiKey) return Response.json({ error: 'OPENAI_API_KEY not configured' }, { status: 503 });

  try {
    const body = await req.json();
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    const memoryText = body.memory?.lastLike ? `使用者曾說過：${String(body.memory.lastLike).slice(0,240)}` : '目前沒有已知偏好記憶。';
    const contextText = `目前服裝：${body.outfit || 'home'}；目前心情：${body.mood || '開心'}。${memoryText}`;
    const input = [
      ...history.map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '') })),
      { role: 'user', content: `${contextText}\n源哥現在說：${String(body.message || '').slice(0,1200)}` }
    ];

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, instructions: SYSTEM_PROMPT, input, max_output_tokens: 280, store: false })
    });
    if (!response.ok) return Response.json({ error: 'OpenAI request failed' }, { status: 502 });
    const data: any = await response.json();
    const raw = String(data.output_text || '').trim();
    let parsed: any;
    try { parsed = JSON.parse(raw); }
    catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { reply: raw || '源哥～我在。', mood: '開心', action: 'idle' };
    }
    return Response.json({
      reply: String(parsed.reply || '源哥～我在。').slice(0,900),
      mood: ['開心','關心','溫柔','害羞','專注'].includes(parsed.mood) ? parsed.mood : '開心',
      action: ['idle','happy','caring','shy'].includes(parsed.action) ? parsed.action : 'idle'
    });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
};

export const config = { path: '/api/chat' };
