(function () {
    "use strict";

    /* ---------- Arabic dictionary (English text -> Arabic) ---------- */
    var AR = {
        // Topbar
        "Register": "تسجيل",
        "Login": "دخول",
        "My Dashboard": "لوحة التحكم",
        "My Profile": "الملف الشخصي",
        "Inbox": "الرسائل",
        "Notifications": "الإشعارات",
        "Account Settings": "إعدادات الحساب",
        "Log Out": "تسجيل خروج",

        // Navbar
        "Home": "الرئيسية",
        "About": "من نحن",
        "Services": "خدماتنا",
        "Packages": "الباقات",
        "Blog": "المدونة",
        "Pages": "صفحات",
        "Destination": "الوجهات",
        "Explore Tour": "استكشف الجولة",
        "Travel Booking": "حجز الرحلة",
        "Our Gallery": "معرض الصور",
        "Travel Guides": "مرشدين السياحة",
        "Testimonial": "آراء العملاء",
        "404 Page": "صفحة 404",
        "Contact": "تواصل معنا",
        "Book Now": "احجز الآن",

        // Hero / carousel
        "Explore The World": "استكشف العالم",
        "Let's The World Together!": "لنكتشف العالم معًا!",
        "Find Your Perfect Tour At Travel": "اكتشف رحلتك المثالية",
        "You Like To Go?": "عايز تسافر فين؟",
        "Discover Now": "اكتشف الآن",
        "Search": "بحث",
        "The World": "العالم",
        "Eg: Thailand": "مثال: تايلاند",

        // About
        "About Us": "من نحن",
        "Welcome to": "أهلاً بيك في",
        "First Class Flights": "رحلات درجة أولى",
        "Handpicked Hotels": "فنادق مختارة بعناية",
        "5 Star Accommodations": "إقامة 5 نجوم",
        "Latest Model Vehicles": "أحدث موديلات السيارات",
        "150 Premium City Tours": "150 جولة مميزة",
        "24/7 Service": "خدمة على مدار الساعة",

        // Services
        "Searvices": "خدماتنا",
        "Our Services": "خدماتنا",
        "Event Management": "إدارة الفعاليات",
        "Travel Guide": "دليل السفر",
        "Meet Our Guide": "تعرف على مرشدينا",
        "Our Travel Guides": "مرشدينا السياحيين",

        // Destination
        "Popular Destination": "أشهر الوجهات",
        "Travel Destination": "وجهات السفر",
        "Tour Category": "تصنيف الجولات",

        // Packages
        "Awesome Packages": "باقات رائعة",
        "Travel Packages": "باقات السفر",
        "WorldWide Tours": "جولات حول العالم",

        // Gallery
        "Tourism & Traveling Gallery.": "معرض السياحة والسفر.",
        "20 Photos": "20 صورة",

        // Testimonial
        "Our Testimonial": "آراء عملائنا",
        "Our Clients Say!!!": "ماذا يقول عملاؤنا!!!",

        // Blog
        "Our Blog": "مدونتنا",
        "Popular Travel Blogs": "أشهر مقالات السفر",
        "Read More": "اقرأ المزيد",

        // Newsletter
        "Subscribe": "اشترك",
        "Our Newsletter": "نشرتنا الإخبارية",

        // Contact
        "Contact Us": "تواصل معنا",
        "Contact For Any Query": "تواصل معنا لأي استفسار",
        "Send us a message": "ابعتلنا رسالة",
        "Send Message": "إرسال الرسالة",
        "WhatsApp": "واتساب",
        "Email": "البريد الإلكتروني",

        // Booking
        "Online Booking": "حجز أونلاين",
        "Book A Tour Deals": "احجز عرض رحلة",
        "Persons": "عدد الأفراد",
        "Categories": "التصنيفات",
        "Date & Time": "التاريخ والوقت",
        "Special Request": "طلب خاص",
        "Kids": "أطفال",

        // 404
        "Page Not Found": "الصفحة غير موجودة",
        "Go Back To Home": "ارجع للرئيسية",

        // Footer
        "Get In Touch": "تواصل معنا",
        "Company": "الشركة",
        "Support": "الدعم",
        "Careers": "وظائف",
        "Press": "الصحافة",
        "Gift Cards": "بطاقات هدايا",
        "Magazine": "مجلة",
        "Legal Notice": "إشعار قانوني",
        "Privacy Policy": "سياسة الخصوصية",
        "Terms and Conditions": "الشروط والأحكام",
        "Sitemap": "خريطة الموقع",
        "Cookie policy": "سياسة الكوكيز",
        "Payments": "طرق الدفع",

        // Forms
        "Your Name": "اسمك",
        "Your Email": "بريدك الإلكتروني",
        "Your email": "بريدك الإلكتروني",
        "Subject": "الموضوع",
        "Message": "الرسالة",
        "Leave a message here": "اكتب رسالتك هنا",

        // Aria labels / preview controls
        "Preview mode": "وضع المعاينة",
        "Desktop preview": "معاينة سطح المكتب",
        "Mobile preview": "معاينة الموبايل",
        "Close preview": "إغلاق المعاينة",
        "Chat on WhatsApp": "تواصل عبر واتساب",
    };

    var LANG_KEY = "mhLang";
    var translatedNodes = [];
    var translatedAttrs = [];

    function collect() {
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        var node;
        while ((node = walker.nextNode())) {
            var trimmed = node.nodeValue.trim();
            if (trimmed && AR.hasOwnProperty(trimmed)) {
                translatedNodes.push({ node: node, original: node.nodeValue, key: trimmed });
            }
        }
        var attrNames = ["placeholder", "aria-label", "title"];
        document.querySelectorAll("body *").forEach(function (el) {
            attrNames.forEach(function (attr) {
                var val = el.getAttribute(attr);
                if (val) {
                    var trimmed = val.trim();
                    if (AR.hasOwnProperty(trimmed)) {
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
        flag.forEach(function (el) { el.textContent = lang === "ar" ? "🇪🇬" : "🇬🇧"; });
        code.forEach(function (el) { el.textContent = lang === "ar" ? "AR" : "EN"; });
    }

    function applyLanguage(lang) {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

        translatedNodes.forEach(function (item) {
            item.node.nodeValue = lang === "ar" ? item.original.replace(item.key, AR[item.key]) : item.original;
        });
        translatedAttrs.forEach(function (item) {
            item.el.setAttribute(item.attr, lang === "ar" ? item.original.replace(item.key, AR[item.key]) : item.original);
        });

        toggleBootstrapRTL(lang === "ar");
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
            document.body.style.overflow = "hidden";
            if (btnMobile) { btnMobile.classList.add("active"); btnMobile.setAttribute("aria-pressed", "true"); }
            if (btnDesktop) { btnDesktop.classList.remove("active"); btnDesktop.setAttribute("aria-pressed", "false"); }
        }
        function close() {
            overlay.classList.remove("open");
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

    document.addEventListener("DOMContentLoaded", function () {
        initLanguage();
        initDevicePreview();
    });
})();
