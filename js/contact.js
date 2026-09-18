(function(){
  var whatsappBtn = document.getElementById('whatsappFloatBtn');
  var contactForm = document.getElementById('contactForm');
  var contactStatus = document.getElementById('contactStatus');

  function currentTranslation(){
    return (window.TRANSLATIONS && TRANSLATIONS[window.currentLang]) || TRANSLATIONS.en;
  }

  function updateWhatsappLink(){
    var greeting = currentTranslation().whatsappGreeting;
    whatsappBtn.href = 'https://wa.me/' + CONFIG.WHATSAPP_BOT_NUMBER + '?text=' + encodeURIComponent(greeting);
  }
  window.addEventListener('languagechange', updateWhatsappLink);
  document.addEventListener('DOMContentLoaded', updateWhatsappLink);

  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    var t = currentTranslation();
    contactStatus.textContent = t.statusSending;

    var payload = {
      name: document.getElementById('cName').value.trim(),
      phone: document.getElementById('cPhone').value.trim(),
      message: document.getElementById('cMessage').value.trim(),
    };

    fetch(CONFIG.BACKEND_URL + '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function(res){
        return res.json().then(function(data){ return { ok: res.ok, data: data }; });
      })
      .then(function(result){
        if(!result.ok) throw new Error(result.data.error || t.statusErrorGeneric);
        contactStatus.textContent = t.statusSuccess;
        contactForm.reset();
      })
      .catch(function(err){
        contactStatus.textContent = t.statusErrorPrefix + ' ' + err.message;
      });
  });
})();
