const LEAD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzqwNmptNZtSGaJ7_G95Qf8cHIyWAj5MSBOKTaYzlhSf0CDCXcvzj2iQsGOJU7TFNTl/exec';

document.getElementById('menuBtn')?.addEventListener('click',()=>document.getElementById('mainNav').classList.toggle('open'));

document.querySelectorAll('.faq-q').forEach(btn=>btn.addEventListener('click',()=>{
  const a=btn.nextElementSibling;
  a.classList.toggle('open');
  btn.querySelector('span').textContent=a.classList.contains('open')?'−':'+';
}));

function getUtmData(){
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get('utm_source') || '',
    utm_campaign: p.get('utm_campaign') || '',
    utm_content: p.get('utm_content') || ''
  };
}

function normalizePhone(value){
  return String(value || '').replace(/[^0-9+]/g,'').trim();
}

document.getElementById('leadForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const form = e.currentTarget;
  const f = new FormData(form);
  const phone = normalizePhone(f.get('phone'));
  const msg = document.getElementById('formMsg');
  const submitBtn = form.querySelector('button[type="submit"]');

  if(phone.length < 9){
    msg.textContent='Vui lòng kiểm tra lại số điện thoại.';
    return;
  }

  const utm = getUtmData();
  const payload = {
    name: String(f.get('name') || '').trim(),
    phone,
    area: String(f.get('area') || '').trim(),
    interest: String(f.get('interest') || '').trim(),
    source: 'Landing Page',
    utm_source: utm.utm_source,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
    page_url: window.location.href
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Đang gửi...';
  msg.textContent = '';

  try {
    await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      keepalive: true
    });

    msg.textContent='Đã ghi nhận thông tin. Đội ngũ Mao Trung Home sẽ liên hệ tư vấn.';
    form.reset();
  } catch (err) {
    console.error('Lead submit failed', err);
    msg.textContent='Chưa gửi được thông tin. Anh/chị vui lòng thử lại hoặc gọi 093 636 36 33.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Nhận báo giá công trình';
  }
});
