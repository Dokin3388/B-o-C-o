const GOOGLE_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzqwNmptNZtSGaJ7_G95Qf8cHIyWAj5MSBOKTaYzlhSf0CDCXcvzj2iQsGOJU7TFNTl/exec';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const phone = String(payload.phone || '').replace(/[^0-9+]/g, '').trim();

    if (!phone || phone.length < 9) {
      return res.status(400).json({ ok: false, error: 'invalid_phone' });
    }

    const form = new URLSearchParams();
    Object.entries({ ...payload, phone }).forEach(([key, value]) => {
      form.set(key, value == null ? '' : String(value));
    });

    const upstream = await fetch(GOOGLE_SCRIPT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: form.toString(),
      redirect: 'follow'
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { ok: false, error: 'invalid_upstream_response', raw: text.slice(0, 300) };
    }

    if (!upstream.ok || data?.ok === false) {
      console.error('Google Apps Script rejected lead', upstream.status, data);
      return res.status(502).json({ ok: false, error: data?.error || 'sheet_write_failed' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Lead API error', err);
    return res.status(500).json({ ok: false, error: 'lead_api_error' });
  }
}
