const SPREADSHEET_ID = '1KcOdpQswRq4F746SkGLGFgZ9t9VPoxUBToujLVenhpk';
const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet not found');

    const phone = String(payload.phone || '').replace(/[^0-9+]/g, '').trim();
    if (!phone || phone.length < 9) {
      return json_({ ok: false, error: 'invalid_phone' });
    }

    const now = new Date();
    const leadId = 'MTH-' + Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'yyyyMMdd-HHmmss') + '-' + Math.floor(1000 + Math.random() * 9000);

    sheet.appendRow([
      leadId,
      Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss'),
      payload.name || '',
      phone,
      payload.area || '',
      payload.interest || '',
      payload.source || 'Landing Page',
      payload.utm_source || '',
      payload.utm_campaign || '',
      payload.utm_content || '',
      payload.page_url || '',
      'New',
      '',
      ''
    ]);

    return json_({ ok: true, lead_id: leadId });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function parsePayload_(e) {
  if (e && e.parameter && Object.keys(e.parameter).length) {
    return e.parameter;
  }
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
  try {
    return JSON.parse(raw);
  } catch (_) {
    const out = {};
    raw.split('&').forEach(pair => {
      const idx = pair.indexOf('=');
      const key = decodeURIComponent(idx >= 0 ? pair.slice(0, idx) : pair).replace(/\+/g, ' ');
      const val = decodeURIComponent(idx >= 0 ? pair.slice(idx + 1) : '').replace(/\+/g, ' ');
      if (key) out[key] = val;
    });
    return out;
  }
}

function doGet() {
  return json_({ ok: true, service: 'Mao Trung Home Lead Collector' });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
