const whatsappBtn = document.getElementById('whatsappFloatBtn');
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

function currentTranslation() {
  return TRANSLATIONS[window.currentLang] || TRANSLATIONS.ar;
}

// زرار واتساب العائم بيفتح شات مباشر مع رقم البوت، برسالة ترحيب بلغة الصفحة الحالية
function updateWhatsappLink() {
  const greeting = currentTranslation().whatsappGreeting;
  whatsappBtn.href = `https://wa.me/${CONFIG.WHATSAPP_BOT_NUMBER}?text=${encodeURIComponent(greeting)}`;
}

window.addEventListener('languagechange', updateWhatsappLink);
document.addEventListener('DOMContentLoaded', updateWhatsappLink);

// فورم التواصل بيبعت البيانات للباك اند، والباك اند بيوديها لصاحب الصفحة عبر البوت
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const t = currentTranslation();
  formStatus.textContent = t.statusSending;

  const payload = {
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    message: document.getElementById('message').value.trim(),
  };

  try {
    const res = await fetch(`${CONFIG.BACKEND_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || t.statusErrorGeneric);
    }

    formStatus.textContent = t.statusSuccess;
    contactForm.reset();
  } catch (err) {
    formStatus.textContent = `${t.statusErrorPrefix} ${err.message}`;
  }
});
