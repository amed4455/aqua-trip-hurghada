const TRANSLATIONS = {
  ar: {
    dir: 'rtl',
    pageTitle: 'الصفحة الرئيسية',
    heroTitle: 'مرحبًا بيك 👋',
    heroSubtitle: 'تواصل معانا مباشرة، وهيتم الرد عليك أوتوماتيك عبر بوت واتساب.',
    contactHeading: 'تواصل معنا',
    labelName: 'الاسم',
    labelPhone: 'رقم الهاتف',
    labelMessage: 'الرسالة',
    phonePlaceholder: 'مثال: 201xxxxxxxxx',
    submitBtn: 'إرسال عبر واتساب',
    whatsappAria: 'تواصل عبر واتساب',
    whatsappGreeting: 'مرحبا',
    statusSending: 'جاري الإرسال...',
    statusSuccess: 'تم الإرسال بنجاح! هيتم الرد عليك قريبًا.',
    statusErrorPrefix: 'خطأ:',
    statusErrorGeneric: 'حصل خطأ أثناء الإرسال',
  },
  en: {
    dir: 'ltr',
    pageTitle: 'Home Page',
    heroTitle: 'Welcome 👋',
    heroSubtitle: "Contact us directly and you'll get an automatic reply via our WhatsApp bot.",
    contactHeading: 'Contact Us',
    labelName: 'Name',
    labelPhone: 'Phone Number',
    labelMessage: 'Message',
    phonePlaceholder: 'e.g. 201xxxxxxxxx',
    submitBtn: 'Send via WhatsApp',
    whatsappAria: 'Contact via WhatsApp',
    whatsappGreeting: 'Hello',
    statusSending: 'Sending...',
    statusSuccess: "Sent successfully! You'll get a reply soon.",
    statusErrorPrefix: 'Error:',
    statusErrorGeneric: 'An error occurred while sending',
  },
  es: {
    dir: 'ltr',
    pageTitle: 'Página de inicio',
    heroTitle: 'Bienvenido 👋',
    heroSubtitle: 'Contáctanos directamente y recibirás una respuesta automática a través de nuestro bot de WhatsApp.',
    contactHeading: 'Contáctanos',
    labelName: 'Nombre',
    labelPhone: 'Número de teléfono',
    labelMessage: 'Mensaje',
    phonePlaceholder: 'ej.: 201xxxxxxxxx',
    submitBtn: 'Enviar por WhatsApp',
    whatsappAria: 'Contactar por WhatsApp',
    whatsappGreeting: 'Hola',
    statusSending: 'Enviando...',
    statusSuccess: '¡Enviado con éxito! Recibirás una respuesta pronto.',
    statusErrorPrefix: 'Error:',
    statusErrorGeneric: 'Ocurrió un error al enviar',
  },
  ru: {
    dir: 'ltr',
    pageTitle: 'Главная страница',
    heroTitle: 'Добро пожаловать 👋',
    heroSubtitle: 'Свяжитесь с нами напрямую, и вы получите автоматический ответ через нашего WhatsApp-бота.',
    contactHeading: 'Связаться с нами',
    labelName: 'Имя',
    labelPhone: 'Номер телефона',
    labelMessage: 'Сообщение',
    phonePlaceholder: 'напр.: 201xxxxxxxxx',
    submitBtn: 'Отправить через WhatsApp',
    whatsappAria: 'Связаться через WhatsApp',
    whatsappGreeting: 'Здравствуйте',
    statusSending: 'Отправка...',
    statusSuccess: 'Успешно отправлено! Скоро вы получите ответ.',
    statusErrorPrefix: 'Ошибка:',
    statusErrorGeneric: 'Произошла ошибка при отправке',
  },
  de: {
    dir: 'ltr',
    pageTitle: 'Startseite',
    heroTitle: 'Willkommen 👋',
    heroSubtitle: 'Kontaktieren Sie uns direkt und erhalten Sie eine automatische Antwort über unseren WhatsApp-Bot.',
    contactHeading: 'Kontaktiere uns',
    labelName: 'Name',
    labelPhone: 'Telefonnummer',
    labelMessage: 'Nachricht',
    phonePlaceholder: 'z. B.: 201xxxxxxxxx',
    submitBtn: 'Über WhatsApp senden',
    whatsappAria: 'Über WhatsApp kontaktieren',
    whatsappGreeting: 'Hallo',
    statusSending: 'Wird gesendet...',
    statusSuccess: 'Erfolgreich gesendet! Sie erhalten bald eine Antwort.',
    statusErrorPrefix: 'Fehler:',
    statusErrorGeneric: 'Beim Senden ist ein Fehler aufgetreten',
  },
  sk: {
    dir: 'ltr',
    pageTitle: 'Domovská stránka',
    heroTitle: 'Vitajte 👋',
    heroSubtitle: 'Kontaktujte nás priamo a dostanete automatickú odpoveď prostredníctvom nášho WhatsApp bota.',
    contactHeading: 'Kontaktujte nás',
    labelName: 'Meno',
    labelPhone: 'Telefónne číslo',
    labelMessage: 'Správa',
    phonePlaceholder: 'napr.: 201xxxxxxxxx',
    submitBtn: 'Odoslať cez WhatsApp',
    whatsappAria: 'Kontaktovať cez WhatsApp',
    whatsappGreeting: 'Ahoj',
    statusSending: 'Odosiela sa...',
    statusSuccess: 'Úspešne odoslané! Čoskoro dostanete odpoveď.',
    statusErrorPrefix: 'Chyba:',
    statusErrorGeneric: 'Pri odosielaní nastala chyba',
  },
  pt: {
    dir: 'ltr',
    pageTitle: 'Página inicial',
    heroTitle: 'Bem-vindo 👋',
    heroSubtitle: 'Entre em contato diretamente e receba uma resposta automática pelo nosso bot do WhatsApp.',
    contactHeading: 'Fale conosco',
    labelName: 'Nome',
    labelPhone: 'Número de telefone',
    labelMessage: 'Mensagem',
    phonePlaceholder: 'ex.: 201xxxxxxxxx',
    submitBtn: 'Enviar pelo WhatsApp',
    whatsappAria: 'Contatar pelo WhatsApp',
    whatsappGreeting: 'Olá',
    statusSending: 'Enviando...',
    statusSuccess: 'Enviado com sucesso! Você receberá uma resposta em breve.',
    statusErrorPrefix: 'Erro:',
    statusErrorGeneric: 'Ocorreu um erro ao enviar',
  },
};

const LANG_NAMES = {
  ar: 'العربية',
  en: 'English',
  es: 'Español',
  ru: 'Русский',
  de: 'Deutsch',
  sk: 'Slovenčina',
  pt: 'Português',
};

const LANG_FLAGS = {
  ar: '🇪🇬',
  en: '🇬🇧',
  es: '🇪🇸',
  ru: '🇷🇺',
  de: '🇩🇪',
  sk: '🇸🇰',
  pt: '🇵🇹',
};

const LANG_STORAGE_KEY = 'siteLang';

function detectDefaultLang() {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (saved && TRANSLATIONS[saved]) return saved;

  const browserLang = (navigator.language || 'ar').slice(0, 2).toLowerCase();
  if (TRANSLATIONS[browserLang]) return browserLang;

  return 'ar';
}

function applyLanguage(lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  document.documentElement.lang = lang;
  document.documentElement.dir = t.dir;
  document.title = t.pageTitle;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.setAttribute('placeholder', t[key]);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
  });

  localStorage.setItem(LANG_STORAGE_KEY, lang);
  window.currentLang = lang;
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang, t } }));
}

function renderLangSwitcher(activeLang) {
  const container = document.getElementById('langSwitcher');
  if (!container) return;

  container.innerHTML = '';
  Object.keys(TRANSLATIONS).forEach((code) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-btn' + (code === activeLang ? ' active' : '');
    btn.setAttribute('data-lang', code);
    btn.innerHTML = `<span class="lang-flag">${LANG_FLAGS[code]}</span><span class="lang-name">${LANG_NAMES[code]}</span>`;
    btn.addEventListener('click', () => {
      applyLanguage(code);
      renderLangSwitcher(code);
    });
    container.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const initialLang = detectDefaultLang();
  renderLangSwitcher(initialLang);
  applyLanguage(initialLang);
});
