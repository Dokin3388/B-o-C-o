const GOOGLE_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzqwNmptNZtSGaJ7_G95Qf8cHIyWAj5MSBOKTaYzlhSf0CDCXcvzj2iQsGOJU7TFNTl/exec';

async function parseResponse(response) {
  const text = await response.text();
  try {
    return { status: response.status, ok: response.ok, data: JSON.parse(text) };
  } catch {
    return { status: response.status, ok: response.ok, data: { ok: false, error: 'invalid_upstream_response', raw: text.slice(0, 300) } };
  }
}

async function postJson(payload) {
  const response = await fetch(GOOGLE_SCRIPT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow'
  });
  return parseResponse(response);
}

async function postForm(payload) {
  const form = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    form.set(key, value == null ? '' : String(value));
  });
  const response = await fetch(GOOGLE_SCRIPT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: form.toString(),
    redirect: 'follow'
  });
  return parseResponse(response);
}

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

    const cleanPayload = { ...payload, phone };

    let result = await postJson(cleanPayload);
    if (!result.ok || result.data?.ok === false) {
      console.warn('JSON lead write failed, retrying form encoding', result.status, result.data);
      result = await postForm(cleanPayload);
    }

    if (!result.ok || result.data?.ok === false) {
      console.error('Google Apps Script rejected lead', result.status, result.data);
      return res.status(502).json({
        ok: false,
        error: result.data?.error || 'sheet_write_failed',
        upstream_status: result.status
      });
    }

    return res.status(200).json(result.data);
  } catch (err) {
    console.error('Lead API error', err);
    return res.status(500).json({ ok: false, error: 'lead_api_error' });
  }
}
