(function(){
  var header = document.getElementById('siteHeader');
  var onScroll = function(){
    if(window.scrollY > 30){ header.classList.add('scrolled'); } else { header.classList.remove('scrolled'); }
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  toggle.addEventListener('click', function(){
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ links.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); });
  });

  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:0.12});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  var filterBtns = document.querySelectorAll('.filter-btn');
  var items = document.querySelectorAll('.gallery-item');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      items.forEach(function(it){
        var show = f === 'all' || it.getAttribute('data-cat') === f;
        it.classList.toggle('hidden-item', !show);
      });
    });
  });

  var slides = document.querySelectorAll('.value-slide');
  var dots = document.querySelectorAll('.value-dots button');
  var idx = 0;
  function showSlide(i){
    slides.forEach(function(s,n){ s.classList.toggle('active', n===i); });
    dots.forEach(function(d,n){ d.classList.toggle('active', n===i); });
    idx = i;
  }
  dots.forEach(function(d){ d.addEventListener('click', function(){ showSlide(+d.getAttribute('data-i')); }); });
  var slideTimer = setInterval(function(){ showSlide((idx+1) % slides.length); }, 6000);

  var newsForm = document.getElementById('newsForm');
  var newsMsg = document.getElementById('newsMsg');
  newsForm.addEventListener('submit', function(e){
    e.preventDefault();
    newsMsg.classList.add('show');
    newsForm.reset();
  });

  var isEmbed = new URLSearchParams(location.search).get('embed') === '1';
  if(isEmbed){ document.documentElement.classList.add('is-embed'); }

  var btnDesktop = document.getElementById('btnDesktop');
  var btnMobile = document.getElementById('btnMobile');
  var overlay = document.getElementById('deviceOverlay');
  var frame = document.getElementById('deviceFrame');
  var closeBtn = document.getElementById('deviceClose');

  function openMobilePreview(){
    var url = location.pathname + (location.search ? location.search.replace(/[?&]embed=1/, '') : '');
    url += (url.indexOf('?') === -1 ? '?' : '&') + 'embed=1';
    frame.src = url;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    btnMobile.classList.add('active'); btnMobile.setAttribute('aria-pressed','true');
    btnDesktop.classList.remove('active'); btnDesktop.setAttribute('aria-pressed','false');
  }
  function closeMobilePreview(){
    overlay.classList.remove('open');
    frame.src = 'about:blank';
    document.body.style.overflow = '';
    btnDesktop.classList.add('active'); btnDesktop.setAttribute('aria-pressed','true');
    btnMobile.classList.remove('active'); btnMobile.setAttribute('aria-pressed','false');
  }
  if(btnMobile){ btnMobile.addEventListener('click', openMobilePreview); }
  if(btnDesktop){ btnDesktop.addEventListener('click', closeMobilePreview); }
  if(closeBtn){ closeBtn.addEventListener('click', closeMobilePreview); }
  if(overlay){
    overlay.addEventListener('click', function(e){ if(e.target === overlay){ closeMobilePreview(); } });
  }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && overlay && overlay.classList.contains('open')){ closeMobilePreview(); }
  });
})();
