const SPREADSHEET_ID = '1KcOdpQswRq4F746SkGLGFgZ9t9VPoxUBToujLVenhpk';
const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet not found');

    const phone = String(payload.phone || '').trim();
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

function doGet() {
  return json_({ ok: true, service: 'Mao Trung Home Lead Collector' });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
