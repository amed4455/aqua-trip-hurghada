(function () {
    "use strict";

    /* ---------- Multi-language dictionary (English text -> translation) ---------- */
    var KEYS = [
        ["Register", "Registro", "Регистрация", "Registrieren", "Registrácia", "Registrar", "تسجيل"],
        ["Login", "Iniciar sesión", "Вход", "Anmelden", "Prihlásenie", "Entrar", "دخول"],
        ["My Dashboard", "Mi Panel", "Личный кабинет", "Mein Dashboard", "Môj Panel", "Meu Painel", "لوحة التحكم"],
        ["My Profile", "Mi Perfil", "Мой профиль", "Mein Profil", "Môj Profil", "Meu Perfil", "الملف الشخصي"],
        ["Inbox", "Bandeja de entrada", "Сообщения", "Posteingang", "Správy", "Mensagens", "الرسائل"],
        ["Notifications", "Notificaciones", "Уведомления", "Benachrichtigungen", "Upozornenia", "Notificações", "الإشعارات"],
        ["Account Settings", "Configuración de la cuenta", "Настройки аккаунта", "Kontoeinstellungen", "Nastavenia Účtu", "Configurações Da Conta", "إعدادات الحساب"],
        ["Log Out", "Cerrar sesión", "Выйти", "Abmelden", "Odhlásiť Sa", "Sair", "تسجيل خروج"],

        ["Home", "Inicio", "Главная", "Startseite", "Domov", "Início", "الرئيسية"],
        ["About", "Nosotros", "О нас", "Über uns", "O Nás", "Sobre", "من نحن"],
        ["Services", "Servicios", "Услуги", "Leistungen", "Služby", "Serviços", "خدماتنا"],
        ["Packages", "Paquetes", "Пакеты", "Pakete", "Balíky", "Pacotes", "الباقات"],
        ["Blog", "Blog", "Блог", "Blog", "Blog", "Blog", "المدونة"],
        ["Pages", "Páginas", "Страницы", "Seiten", "Stránky", "Páginas", "صفحات"],
        ["Destination", "Destino", "Направление", "Reiseziel", "Destinácia", "Destino", "الوجهات"],
        ["Explore Tour", "Explorar Tour", "Исследовать Тур", "Tour Entdecken", "Preskúmať Zájazd", "Explorar Passeio", "استكشف الجولة"],
        ["Travel Booking", "Reserva de Viaje", "Бронирование Поездки", "Reisebuchung", "Rezervácia Cesty", "Reserva de Viagem", "حجز الرحلة"],
        ["Our Gallery", "Nuestra Galería", "Наша Галерея", "Unsere Galerie", "Naša Galéria", "Nossa Galeria", "معرض الصور"],
        ["Travel Guides", "Guías de Viaje", "Гиды По Путешествиям", "Reiseführer", "Sprievodcovia", "Guias de Viagem", "مرشدين السياحة"],
        ["Testimonial", "Testimonios", "Отзывы", "Erfahrungsberichte", "Referencie", "Depoimentos", "آراء العملاء"],
        ["404 Page", "Página 404", "Страница 404", "404-Seite", "Stránka 404", "Página 404", "صفحة 404"],
        ["Contact", "Contacto", "Контакты", "Kontakt", "Kontakt", "Contato", "تواصل معنا"],
        ["Book Now", "Reservar Ahora", "Забронировать", "Jetzt Buchen", "Rezervovať Teraz", "Reservar Agora", "احجز الآن"],

        ["Explore The World", "Explora El Mundo", "Исследуй Мир", "Entdecke Die Welt", "Objavuj Svet", "Explore O Mundo", "استكشف العالم"],
        ["Let's The World Together!", "¡Descubramos El Mundo Juntos!", "Откроем Мир Вместе!", "Lass Uns Die Welt Gemeinsam Entdecken!", "Poďme Spoznávať Svet Spolu!", "Vamos Descobrir O Mundo Juntos!", "لنكتشف العالم معًا!"],
        ["Find Your Perfect Tour At Travel", "Encuentra Tu Tour Perfecto", "Найдите Свой Идеальный Тур", "Finde Deine Perfekte Tour", "Nájdite Svoj Dokonalý Zájazd", "Encontre Seu Passeio Perfeito", "اكتشف رحلتك المثالية"],
        ["You Like To Go?", "¿A Dónde Quieres Ir?", "Куда Хотите Поехать?", "Wohin Möchtest Du Reisen?", "Kam Chcete Ísť?", "Para Onde Você Quer Ir?", "عايز تسافر فين؟"],
        ["Discover Now", "Descubrir Ahora", "Открыть Сейчас", "Jetzt Entdecken", "Objaviť Teraz", "Descobrir Agora", "اكتشف الآن"],
        ["Search", "Buscar", "Поиск", "Suchen", "Hľadať", "Buscar", "بحث"],
        ["The World", "El Mundo", "Мир", "Die Welt", "Svet", "O Mundo", "العالم"],
        ["Eg: Thailand", "Ej: Tailandia", "Напр: Таиланд", "Z. B.: Thailand", "Napr: Thajsko", "Ex: Tailândia", "مثال: تايلاند"],

        ["About Us", "Nosotros", "О Нас", "Über Uns", "O Nás", "Sobre Nós", "من نحن"],
        ["Welcome to", "Bienvenido a", "Добро пожаловать в", "Willkommen bei", "Vitajte v", "Bem-vindo a", "أهلاً بيك في"],
        ["First Class Flights", "Vuelos de Primera Clase", "Перелёты Первым Классом", "Flüge Erster Klasse", "Lety Prvou Triedou", "Voos De Primeira Classe", "رحلات درجة أولى"],
        ["Handpicked Hotels", "Hoteles Selectos", "Отобранные Отели", "Sorgfältig Ausgewählte Hotels", "Starostlivo Vybrané Hotely", "Hotéis Selecionados", "فنادق مختارة بعناية"],
        ["5 Star Accommodations", "Alojamiento 5 Estrellas", "Проживание 5 Звёзд", "5-Sterne-Unterkünfte", "5-Hviezdičkové Ubytovanie", "Hospedagem 5 Estrelas", "إقامة 5 نجوم"],
        ["Latest Model Vehicles", "Vehículos de Último Modelo", "Новейшие Модели Автомобилей", "Neueste Fahrzeugmodelle", "Najnovšie Modely Vozidiel", "Veículos De Último Modelo", "أحدث موديلات السيارات"],
        ["150 Premium City Tours", "150 Tours Urbanos Premium", "150 Премиальных Городских Туров", "150 Premium-Stadttouren", "150 Prémiových Mestských Zájazdov", "150 Passeios Urbanos Premium", "150 جولة مميزة"],
        ["24/7 Service", "Servicio 24/7", "Сервис Круглосуточно", "Rund-Um-Die-Uhr-Service", "Nepretržitý Servis", "Atendimento 24 Horas", "خدمة على مدار الساعة"],

        ["Searvices", "Servicios", "Услуги", "Leistungen", "Služby", "Serviços", "خدماتنا"],
        ["Our Services", "Nuestros Servicios", "Наши Услуги", "Unsere Leistungen", "Naše Služby", "Nossos Serviços", "خدماتنا"],
        ["Event Management", "Gestión de Eventos", "Организация Мероприятий", "Eventmanagement", "Manažment Podujatí", "Gestão De Eventos", "إدارة الفعاليات"],
        ["Travel Guide", "Guía de Viaje", "Гид По Путешествиям", "Reiseführer", "Sprievodca", "Guia De Viagem", "دليل السفر"],
        ["Meet Our Guide", "Conoce a Nuestro Guía", "Познакомьтесь С Нашим Гидом", "Lernen Sie Unseren Guide Kennen", "Spoznajte Nášho Sprievodcu", "Conheça Nosso Guia", "تعرف على مرشدينا"],
        ["Our Travel Guides", "Nuestros Guías de Viaje", "Наши Гиды", "Unsere Reiseführer", "Naši Sprievodcovia", "Nossos Guias De Viagem", "مرشدينا السياحيين"],

        ["Popular Destination", "Destino Popular", "Популярное Направление", "Beliebtes Reiseziel", "Obľúbená Destinácia", "Destino Popular", "أشهر الوجهات"],
        ["Travel Destination", "Destino de Viaje", "Направление Поездки", "Reiseziel", "Cieľová Destinácia", "Destino De Viagem", "وجهات السفر"],
        ["Tour Category", "Categoría de Tour", "Категория Тура", "Tour-Kategorie", "Kategória Zájazdu", "Categoria Do Passeio", "تصنيف الجولات"],

        ["Awesome Packages", "Paquetes Increíbles", "Отличные Пакеты", "Tolle Pakete", "Skvelé Balíky", "Pacotes Incríveis", "باقات رائعة"],
        ["Travel Packages", "Paquetes de Viaje", "Туристические Пакеты", "Reisepakete", "Cestovné Balíky", "Pacotes De Viagem", "باقات السفر"],
        ["WorldWide Tours", "Tours Mundiales", "Туры По Всему Миру", "Weltweite Touren", "Zájazdy Po Celom Svete", "Passeios Pelo Mundo", "جولات حول العالم"],

        ["Tourism & Traveling Gallery.", "Galería de Turismo y Viajes.", "Галерея Туризма И Путешествий.", "Tourismus- Und Reisegalerie.", "Galéria Cestovania A Turistiky.", "Galeria De Turismo E Viagens.", "معرض السياحة والسفر."],
        ["20 Photos", "20 Fotos", "20 Фото", "20 Fotos", "20 Fotografií", "20 Fotos", "20 صورة"],

        ["Our Testimonial", "Nuestros Testimonios", "Наши Отзывы", "Unsere Erfahrungsberichte", "Naše Referencie", "Nossos Depoimentos", "آراء عملائنا"],
        ["Our Clients Say!!!", "¡Lo Que Dicen Nuestros Clientes!!!", "Что Говорят Наши Клиенты!!!", "Das Sagen Unsere Kunden!!!", "Čo Hovoria Naši Klienti!!!", "O Que Nossos Clientes Dizem!!!", "ماذا يقول عملاؤنا!!!"],

        ["Our Blog", "Nuestro Blog", "Наш Блог", "Unser Blog", "Náš Blog", "Nosso Blog", "مدونتنا"],
        ["Popular Travel Blogs", "Blogs de Viaje Populares", "Популярные Блоги О Путешествиях", "Beliebte Reiseblogs", "Obľúbené Cestovateľské Blogy", "Blogs De Viagem Populares", "أشهر مقالات السفر"],
        ["Read More", "Leer Más", "Читать Далее", "Weiterlesen", "Čítať Viac", "Leia Mais", "اقرأ المزيد"],

        ["Subscribe", "Suscribirse", "Подписаться", "Abonnieren", "Odoberať", "Inscrever-se", "اشترك"],
        ["Our Newsletter", "Nuestro Boletín", "Наша Рассылка", "Unser Newsletter", "Náš Newsletter", "Nossa Newsletter", "نشرتنا الإخبارية"],

        ["Contact Us", "Contáctanos", "Свяжитесь С Нами", "Kontaktiere Uns", "Kontaktujte Nás", "Fale Conosco", "تواصل معنا"],
        ["Contact For Any Query", "Contáctanos Para Cualquier Consulta", "Свяжитесь С Нами По Любому Вопросу", "Kontaktiere Uns Bei Fragen", "Kontaktujte Nás S Akoukoľvek Otázkou", "Fale Conosco Para Qualquer Dúvida", "تواصل معنا لأي استفسار"],
        ["Send us a message", "Envíanos un mensaje", "Отправьте нам сообщение", "Sende uns eine Nachricht", "Pošlite nám správu", "Envie-nos uma mensagem", "ابعتلنا رسالة"],
        ["Send Message", "Enviar Mensaje", "Отправить Сообщение", "Nachricht Senden", "Odoslať Správu", "Enviar Mensagem", "إرسال الرسالة"],
        ["WhatsApp", "WhatsApp", "WhatsApp", "WhatsApp", "WhatsApp", "WhatsApp", "واتساب"],
        ["Email", "Correo Electrónico", "Эл. почта", "E-Mail", "E-mail", "E-mail", "البريد الإلكتروني"],

        ["Online Booking", "Reserva en Línea", "Онлайн Бронирование", "Online-Buchung", "Online Rezervácia", "Reserva Online", "حجز أونلاين"],
        ["Book A Tour Deals", "Reserva Una Oferta de Tour", "Забронировать Тур Со Скидкой", "Buche Ein Tour-Angebot", "Rezervovať Zľavnený Zájazd", "Reserve Uma Oferta De Passeio", "احجز عرض رحلة"],
        ["Persons", "Personas", "Человек", "Personen", "Osoby", "Pessoas", "عدد الأفراد"],
        ["Categories", "Categorías", "Категории", "Kategorien", "Kategórie", "Categorias", "التصنيفات"],
        ["Date & Time", "Fecha y Hora", "Дата И Время", "Datum Und Uhrzeit", "Dátum A Čas", "Data E Hora", "التاريخ والوقت"],
        ["Special Request", "Solicitud Especial", "Особый Запрос", "Sonderwunsch", "Špeciálna Požiadavka", "Pedido Especial", "طلب خاص"],
        ["Kids", "Niños", "Дети", "Kinder", "Deti", "Crianças", "أطفال"],

        ["Page Not Found", "Página No Encontrada", "Страница Не Найдена", "Seite Nicht Gefunden", "Stránka Nenájdená", "Página Não Encontrada", "الصفحة غير موجودة"],
        ["Go Back To Home", "Volver Al Inicio", "Вернуться На Главную", "Zurück Zur Startseite", "Späť Na Domovskú Stránku", "Voltar Ao Início", "ارجع للرئيسية"],

        ["Get In Touch", "Ponte en Contacto", "Связаться С Нами", "Kontakt Aufnehmen", "Spojte Sa S Nami", "Fale Conosco", "تواصل معنا"],
        ["Company", "Empresa", "Компания", "Unternehmen", "Spoločnosť", "Empresa", "الشركة"],
        ["Support", "Soporte", "Поддержка", "Support", "Podpora", "Suporte", "الدعم"],
        ["Careers", "Carreras", "Карьера", "Karriere", "Kariéra", "Carreiras", "وظائف"],
        ["Press", "Prensa", "Пресса", "Presse", "Tlač", "Imprensa", "الصحافة"],
        ["Gift Cards", "Tarjetas de Regalo", "Подарочные Карты", "Geschenkkarten", "Darčekové Poukazy", "Cartões-Presente", "بطاقات هدايا"],
        ["Magazine", "Revista", "Журнал", "Magazin", "Magazín", "Revista", "مجلة"],
        ["Legal Notice", "Aviso Legal", "Правовая Информация", "Impressum", "Právne Upozornenie", "Aviso Legal", "إشعار قانوني"],
        ["Privacy Policy", "Política de Privacidad", "Политика Конфиденциальности", "Datenschutzrichtlinie", "Zásady Ochrany Súkromia", "Política De Privacidade", "سياسة الخصوصية"],
        ["Terms and Conditions", "Términos y Condiciones", "Условия Использования", "Allgemeine Geschäftsbedingungen", "Obchodné Podmienky", "Termos E Condições", "الشروط والأحكام"],
        ["Sitemap", "Mapa del Sitio", "Карта Сайта", "Seitenübersicht", "Mapa Stránky", "Mapa Do Site", "خريطة الموقع"],
        ["Cookie policy", "Política de Cookies", "Политика Cookie", "Cookie-Richtlinie", "Zásady Cookies", "Política De Cookies", "سياسة الكوكيز"],
        ["Payments", "Pagos", "Платежи", "Zahlungen", "Platby", "Pagamentos", "طرق الدفع"],

        ["Your Name", "Tu Nombre", "Ваше Имя", "Ihr Name", "Vaše Meno", "Seu Nome", "اسمك"],
        ["Your Email", "Tu Correo Electrónico", "Ваш Email", "Ihre E-Mail", "Váš E-mail", "Seu E-mail", "بريدك الإلكتروني"],
        ["Your email", "Tu correo electrónico", "Ваш email", "Ihre E-Mail", "Váš e-mail", "seu e-mail", "بريدك الإلكتروني"],
        ["Subject", "Asunto", "Тема", "Betreff", "Predmet", "Assunto", "الموضوع"],
        ["Message", "Mensaje", "Сообщение", "Nachricht", "Správa", "Mensagem", "الرسالة"],
        ["Leave a message here", "Deja un mensaje aquí", "Оставьте сообщение здесь", "Hinterlassen Sie hier eine Nachricht", "Nechajte tu správu", "Deixe uma mensagem aqui", "اكتب رسالتك هنا"],

        ["Preview mode", "Modo de Vista Previa", "Режим Просмотра", "Vorschaumodus", "Režim Náhľadu", "Modo De Visualização", "وضع المعاينة"],
        ["Desktop preview", "Vista de Escritorio", "Просмотр На Компьютере", "Desktop-Vorschau", "Náhľad Na Počítači", "Visualização Desktop", "معاينة سطح المكتب"],
        ["Mobile preview", "Vista Móvil", "Просмотр На Телефоне", "Mobile-Vorschau", "Náhľad Na Mobile", "Visualização Mobile", "معاينة الموبايل"],
        ["Close preview", "Cerrar Vista Previa", "Закрыть Просмотр", "Vorschau Schließen", "Zavrieť Náhľad", "Fechar Visualização", "إغلاق المعاينة"],
        ["Chat on WhatsApp", "Chatear por WhatsApp", "Написать В WhatsApp", "Auf WhatsApp Chatten", "Napíšte Cez WhatsApp", "Conversar No WhatsApp", "تواصل عبر واتساب"],

        ["My Bookings", "Mis Reservas", "Мои бронирования", "Meine Buchungen", "Moje rezervácie", "Minhas Reservas", "حجوزاتي"],
        ["Phone number", "Número de teléfono", "Номер телефона", "Telefonnummer", "Telefónne číslo", "Número de telefone", "رقم الهاتف"],
        ["We will email you a confirmation number to verify your address.", "Te enviaremos un número de confirmación por correo para verificar tu dirección.", "Мы отправим вам на почту номер подтверждения, чтобы проверить ваш адрес.", "Wir senden Ihnen eine Bestätigungsnummer per E-Mail, um Ihre Adresse zu bestätigen.", "Pošleme vám e-mailom potvrdzovacie číslo na overenie vašej adresy.", "Enviaremos um número de confirmação por e-mail para verificar seu endereço.", "هنبعتلك رقم تأكيد على الإيميل عشان نتأكد إنه بتاعك."],
        ["Send confirmation number", "Enviar número de confirmación", "Отправить номер подтверждения", "Bestätigungsnummer senden", "Odoslať potvrdzovacie číslo", "Enviar número de confirmação", "ابعت رقم التأكيد"],
        ["Enter the confirmation number we sent to", "Introduce el número de confirmación que enviamos a", "Введите номер подтверждения, отправленный на", "Geben Sie die Bestätigungsnummer ein, die wir gesendet haben an", "Zadajte potvrdzovacie číslo, ktoré sme poslali na", "Digite o número de confirmação que enviamos para", "اكتب رقم التأكيد اللي بعتناه على"],
        ["Confirmation number", "Número de confirmación", "Номер подтверждения", "Bestätigungsnummer", "Potvrdzovacie číslo", "Número de confirmação", "رقم التأكيد"],
        ["Verify", "Verificar", "Подтвердить", "Bestätigen", "Overiť", "Verificar", "تأكيد"],
        ["Send a new confirmation number", "Enviar un nuevo número", "Отправить новый номер", "Neue Nummer senden", "Poslať nové číslo", "Enviar um novo número", "ابعت رقم جديد"],
        ["Use a different email", "Usar otro correo", "Использовать другой email", "Andere E-Mail verwenden", "Použiť iný e-mail", "Usar outro e-mail", "استخدم إيميل تاني"],
        ["Please enter a valid email address.", "Introduce un correo electrónico válido.", "Введите корректный адрес электронной почты.", "Bitte geben Sie eine gültige E-Mail-Adresse ein.", "Zadajte platnú e-mailovú adresu.", "Digite um e-mail válido.", "اكتب إيميل صحيح."],
        ["Please enter your name.", "Introduce tu nombre.", "Введите ваше имя.", "Bitte geben Sie Ihren Namen ein.", "Zadajte svoje meno.", "Digite seu nome.", "اكتب اسمك."],
        ["The confirmation number is wrong or has expired.", "El número de confirmación es incorrecto o ha caducado.", "Номер подтверждения неверен или истёк.", "Die Bestätigungsnummer ist falsch oder abgelaufen.", "Potvrdzovacie číslo je nesprávne alebo vypršalo.", "O número de confirmação está errado ou expirou.", "رقم التأكيد غلط أو انتهت صلاحيته."],
        ["Too many attempts. Please request a new confirmation number.", "Demasiados intentos. Solicita un nuevo número de confirmación.", "Слишком много попыток. Запросите новый номер подтверждения.", "Zu viele Versuche. Bitte fordern Sie eine neue Bestätigungsnummer an.", "Príliš veľa pokusov. Vyžiadajte si nové potvrdzovacie číslo.", "Muitas tentativas. Solicite um novo número de confirmação.", "محاولات كتير. اطلب رقم تأكيد جديد."],
        ["Please wait a minute before requesting another one.", "Espera un minuto antes de pedir otro.", "Подождите минуту, прежде чем запросить новый.", "Bitte warten Sie eine Minute, bevor Sie eine neue anfordern.", "Počkajte minútu, kým si vyžiadate ďalšie.", "Aguarde um minuto antes de pedir outro.", "استنى دقيقة قبل ما تطلب رقم تاني."],
        ["Something went wrong. Please try again.", "Algo salió mal. Inténtalo de nuevo.", "Что-то пошло не так. Попробуйте ещё раз.", "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.", "Niečo sa pokazilo. Skúste to znova.", "Algo deu errado. Tente novamente.", "حصل خطأ. جرب تاني."],
        ["Cannot reach the server. Please try again later.", "No se puede conectar con el servidor. Inténtalo más tarde.", "Не удаётся связаться с сервером. Попробуйте позже.", "Server nicht erreichbar. Bitte versuchen Sie es später erneut.", "Nedá sa pripojiť k serveru. Skúste to neskôr.", "Não foi possível conectar ao servidor. Tente mais tarde.", "مش قادر أوصل للسيرفر. جرب بعد شوية."],
        ["Booking confirmed!", "¡Reserva confirmada!", "Бронирование подтверждено!", "Buchung bestätigt!", "Rezervácia potvrdená!", "Reserva confirmada!", "تم تأكيد الحجز!"],
        ["Your booking number is", "Tu número de reserva es", "Номер вашего бронирования:", "Ihre Buchungsnummer lautet", "Číslo vašej rezervácie je", "Seu número de reserva é", "رقم حجزك هو"],
        ["We also emailed it to you.", "También te lo enviamos por correo.", "Мы также отправили его вам на почту.", "Wir haben sie Ihnen auch per E-Mail geschickt.", "Poslali sme vám ho aj e-mailom.", "Também enviamos por e-mail.", "وبعتناهولك على الإيميل كمان."],
        ["Close", "Cerrar", "Закрыть", "Schließen", "Zavrieť", "Fechar", "إغلاق"],
        ["Save changes", "Guardar cambios", "Сохранить изменения", "Änderungen speichern", "Uložiť zmeny", "Salvar alterações", "حفظ التغييرات"],
        ["Saved", "Guardado", "Сохранено", "Gespeichert", "Uložené", "Salvo", "تم الحفظ"],
        ["You have no bookings yet.", "Aún no tienes reservas.", "У вас пока нет бронирований.", "Sie haben noch keine Buchungen.", "Zatiaľ nemáte žiadne rezervácie.", "Você ainda não tem reservas.", "معندكش حجوزات لسه."],
        ["Signed in as", "Sesión iniciada como", "Вы вошли как", "Angemeldet als", "Prihlásený ako", "Conectado como", "مسجّل دخول باسم"],
        ["Verify your email to complete your booking.", "Verifica tu correo para completar la reserva.", "Подтвердите email, чтобы завершить бронирование.", "Bestätigen Sie Ihre E-Mail, um die Buchung abzuschließen.", "Overte svoj e-mail na dokončenie rezervácie.", "Verifique seu e-mail para concluir a reserva.", "أكّد إيميلك عشان تكمل الحجز."],
        ["Booking number", "Número de reserva", "Номер бронирования", "Buchungsnummer", "Číslo rezervácie", "Número da reserva", "رقم الحجز"],
        ["Book a tour", "Reservar un tour", "Забронировать тур", "Tour buchen", "Rezervovať zájazd", "Reservar um passeio", "احجز رحلة"],
        ["Please choose a future date and time.", "Elige una fecha y hora futuras.", "Выберите будущие дату и время.", "Bitte wählen Sie ein zukünftiges Datum und eine Uhrzeit.", "Vyberte budúci dátum a čas.", "Escolha uma data e hora futuras.", "اختار تاريخ ووقت في المستقبل."],
        ["Please choose a destination.", "Elige un destino.", "Выберите направление.", "Bitte wählen Sie ein Reiseziel.", "Vyberte destináciu.", "Escolha um destino.", "اختار الوجهة."]
    ];

    var LANG_ORDER = ["en", "es", "ru", "de", "sk", "pt", "ar"];
    var LANG_NAMES = { en: "English", es: "Español", ru: "Русский", de: "Deutsch", sk: "Slovenčina", pt: "Português", ar: "العربية" };
    var LANG_FLAGS = { en: "🇬🇧", es: "🇪🇸", ru: "🇷🇺", de: "🇩🇪", sk: "🇸🇰", pt: "🇵🇹", ar: "🇪🇬" };
    var RTL_LANGS = { ar: true };

    // Build DICT[lang][englishKey] = translation, for every non-English language.
    var DICT = {};
    LANG_ORDER.forEach(function (lang, i) {
        if (lang === "en") return;
        var col = i; // index into each KEYS row (en=0, es=1, ru=2, de=3, sk=4, pt=5, ar=6)
        DICT[lang] = {};
        KEYS.forEach(function (row) {
            DICT[lang][row[0]] = row[col];
        });
    });

    var LANG_KEY = "mhLang";
    var currentLang = "en";

    window.MH_T = function (key) {
        var dict = DICT[currentLang];
        return (dict && dict[key]) || key;
    };
    window.MH_LANG = function () { return currentLang; };
    var translatedNodes = [];
    var translatedAttrs = [];

    function collect() {
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        var node;
        var allEnglishKeys = {};
        KEYS.forEach(function (row) { allEnglishKeys[row[0]] = true; });

        while ((node = walker.nextNode())) {
            var trimmed = node.nodeValue.trim();
            if (trimmed && allEnglishKeys[trimmed]) {
                translatedNodes.push({ node: node, original: node.nodeValue, key: trimmed });
            }
        }
        var attrNames = ["placeholder", "aria-label", "title"];
        document.querySelectorAll("body *").forEach(function (el) {
            attrNames.forEach(function (attr) {
                var val = el.getAttribute(attr);
                if (val) {
                    var trimmed = val.trim();
                    if (allEnglishKeys[trimmed]) {
                        translatedAttrs.push({ el: el, attr: attr, original: val, key: trimmed });
                    }
                }
            });
        });
    }

    var LTR_HREF = "css/bootstrap.min.css";
    var RTL_HREF = "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.rtl.min.css";

    function toggleBootstrapRTL(isRTL) {
        var link = document.querySelector('link[href="' + LTR_HREF + '"], link[href="' + RTL_HREF + '"]');
        if (!link) return;
        link.href = isRTL ? RTL_HREF : LTR_HREF;
    }

    function updateBadge(lang) {
        var flag = document.querySelectorAll(".lang-flag");
        var code = document.querySelectorAll(".lang-code");
        flag.forEach(function (el) { el.textContent = LANG_FLAGS[lang] || LANG_FLAGS.en; });
        code.forEach(function (el) { el.textContent = lang.toUpperCase(); });
    }

    function applyLanguage(lang) {
        if (LANG_ORDER.indexOf(lang) === -1) lang = "en";
        currentLang = lang;
        var isRTL = !!RTL_LANGS[lang];
        document.documentElement.lang = lang;
        document.documentElement.dir = isRTL ? "rtl" : "ltr";

        var dict = DICT[lang]; // undefined for English -> falls back to original
        translatedNodes.forEach(function (item) {
            var translation = dict && dict[item.key];
            item.node.nodeValue = translation ? item.original.replace(item.key, translation) : item.original;
        });
        translatedAttrs.forEach(function (item) {
            var translation = dict && dict[item.key];
            item.el.setAttribute(item.attr, translation ? item.original.replace(item.key, translation) : item.original);
        });

        toggleBootstrapRTL(isRTL);
        updateBadge(lang);
        try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
    }

    function initLanguage() {
        collect();
        var saved = "en";
        try { saved = localStorage.getItem(LANG_KEY) || "en"; } catch (e) { /* ignore */ }
        applyLanguage(saved);

        var switcher = document.getElementById("langSwitcher");
        var current = document.getElementById("langCurrent");
        var menu = document.getElementById("langMenu");
        if (!switcher || !current || !menu) return;

        // Build the menu once, from LANG_ORDER, so every page offers the full language list.
        menu.innerHTML = "";
        LANG_ORDER.forEach(function (lang) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.setAttribute("data-lang", lang);
            btn.innerHTML = "<span>" + LANG_FLAGS[lang] + "</span> " + LANG_NAMES[lang];
            menu.appendChild(btn);
        });

        current.addEventListener("click", function (e) {
            e.stopPropagation();
            switcher.classList.toggle("open");
        });
        document.addEventListener("click", function (e) {
            if (!switcher.contains(e.target)) switcher.classList.remove("open");
        });
        menu.querySelectorAll("button[data-lang]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                applyLanguage(btn.getAttribute("data-lang"));
                switcher.classList.remove("open");
            });
        });
    }

    /* ---------- Desktop / Mobile device preview ---------- */
    function initDevicePreview() {
        var btnDesktop = document.getElementById("btnDesktop");
        var btnMobile = document.getElementById("btnMobile");
        var overlay = document.getElementById("deviceOverlay");
        var frame = document.getElementById("deviceFrame");
        var closeBtn = document.getElementById("deviceClose");
        if (!overlay || !frame) return;

        function open() {
            frame.src = location.href.split("#")[0];
            overlay.classList.add("open");
            document.body.classList.add("device-preview-open");
            document.body.style.overflow = "hidden";
            if (btnMobile) { btnMobile.classList.add("active"); btnMobile.setAttribute("aria-pressed", "true"); }
            if (btnDesktop) { btnDesktop.classList.remove("active"); btnDesktop.setAttribute("aria-pressed", "false"); }
        }
        function close() {
            overlay.classList.remove("open");
            document.body.classList.remove("device-preview-open");
            frame.src = "about:blank";
            document.body.style.overflow = "";
            if (btnDesktop) { btnDesktop.classList.add("active"); btnDesktop.setAttribute("aria-pressed", "true"); }
            if (btnMobile) { btnMobile.classList.remove("active"); btnMobile.setAttribute("aria-pressed", "false"); }
        }
        if (btnMobile) btnMobile.addEventListener("click", open);
        if (btnDesktop) btnDesktop.addEventListener("click", close);
        if (closeBtn) closeBtn.addEventListener("click", close);
        overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && overlay.classList.contains("open")) close();
        });
    }

    // ملحوظة: تشغيل أنيميشن اللوجو من الأول في كل تحميل صفحة (حل مشكلة كاش
    // الموبايل) بقى بيتم فورًا جوه الصفحة نفسها (سكريبت صغير بعد الـ<img>
    // مباشرة)، مش هنا، عشان ميعملش تحميل مزدوج (فلاش يختفي ويظهر تاني).

    document.addEventListener("DOMContentLoaded", function () {
        initLanguage();
        initDevicePreview();
    });
})();
