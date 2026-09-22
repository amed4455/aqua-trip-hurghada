(function () {
    "use strict";

    // عنوان الباك اند: محليًا بيكلم البورت بتاع الباك اند على نفس الجهاز.
    // على السيرفر الحقيقي (Vercel) بيبقى مسار نسبي "" ويتحول لسيرفر الـ VPS عن طريق rewrite في vercel.json.
    var isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    var API = window.MH_API_BASE || (isLocal ? "http://localhost:4001" : "");
    var TOKEN_KEY = "mhToken";
    var USER_KEY = "mhUser";
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function t(key) { return window.MH_T ? window.MH_T(key) : key; }

    var state = { token: null, user: null };
    try {
        state.token = localStorage.getItem(TOKEN_KEY);
        state.user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch (e) { /* ignore */ }
    if (!state.token || !state.user) { state.token = null; state.user = null; }

    function saveSession(token, user) {
        state.token = token;
        state.user = user;
        try {
            if (token) {
                localStorage.setItem(TOKEN_KEY, token);
                localStorage.setItem(USER_KEY, JSON.stringify(user));
            } else {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            }
        } catch (e) { /* ignore */ }
    }

    async function api(path, method, body) {
        var headers = {};
        if (body) headers["Content-Type"] = "application/json";
        if (state.token) headers.Authorization = "Bearer " + state.token;
        var res;
        try {
            res = await fetch(API + "/api" + path, { method: method || "GET", headers: headers, body: body ? JSON.stringify(body) : undefined });
        } catch (e) {
            return { ok: false, status: 0, data: { error: "network" } };
        }
        var data = {};
        try { data = await res.json(); } catch (e) { /* ignore */ }
        if (res.status === 401 && state.token) { saveSession(null, null); updateAccountUI(); }
        return { ok: res.ok, status: res.status, data: data };
    }

    function errorText(code) {
        switch (code) {
            case "invalid_email": return t("Please enter a valid email address.");
            case "cooldown":
            case "rate_limited":
            case "too_many_requests": return t("Please wait a minute before requesting another one.");
            case "invalid_code": return t("The confirmation number is wrong or has expired.");
            case "too_many_attempts": return t("Too many attempts. Please request a new confirmation number.");
            case "network": return t("Cannot reach the server. Please try again later.");
            default: return t("Something went wrong. Please try again.");
        }
    }

    function el(tag, attrs, kids) {
        var node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (k) {
            var v = attrs[k];
            if (k === "text") node.textContent = v;
            else if (k === "class") node.className = v;
            else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), v);
            else node.setAttribute(k, v);
        });
        (kids || []).forEach(function (c) {
            if (c !== null && c !== undefined) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
        });
        return node;
    }

    /* ---------- Modal shell ---------- */
    var overlay, modal;

    function ensureModal() {
        if (overlay) return;
        modal = el("div", { class: "mh-modal" });
        overlay = el("div", { class: "mh-overlay", role: "dialog", "aria-modal": "true" }, [modal]);
        document.body.appendChild(overlay);
        overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) closeModal(); });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
        });
    }

    function openModal(wide) {
        ensureModal();
        modal.className = "mh-modal" + (wide ? " mh-wide" : "");
        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        if (!overlay) return;
        overlay.classList.remove("open");
        document.body.style.overflow = "";
    }

    function closeButton() {
        return el("button", { type: "button", class: "mh-close", "aria-label": t("Close"), text: "×", onclick: closeModal });
    }

    function setBusy(btn, busy) {
        btn.disabled = busy;
        btn.classList.toggle("mh-busy", busy);
    }

    function field(labelKey, input) {
        return el("div", { class: "mb-3" }, [el("label", { class: "form-label", text: t(labelKey) }), input]);
    }

    /* ---------- Login / Register (email confirmation number) ---------- */
    function showAuth(opts) {
        opts = opts || {};
        openModal(false);
        renderAuth({
            mode: opts.mode || "login",
            step: "email",
            email: opts.email || "",
            name: opts.name || "",
            phone: opts.phone || "",
            reason: !!opts.reason,
            dev: false,
            onSuccess: opts.onSuccess,
        });
    }

    async function sendCode(ctx) {
        var r = await api("/auth/request-code", "POST", { email: ctx.email });
        if (r.ok) ctx.dev = !!r.data.dev;
        return r;
    }

    function renderAuth(ctx) {
        modal.textContent = "";
        modal.appendChild(closeButton());
        modal.appendChild(el("h4", { class: "mh-title", text: ctx.mode === "register" ? t("Register") : t("Login") }));

        var error = el("div", { class: "mh-error", role: "alert" });
        var submit = el("button", { type: "submit", class: "btn btn-primary w-100 py-2" });
        var form = el("form", { novalidate: "" });
        var firstInput;

        if (ctx.step === "email") {
            if (ctx.reason) modal.appendChild(el("p", { class: "mh-sub fw-bold", text: t("Verify your email to complete your booking.") }));
            modal.appendChild(el("p", { class: "mh-sub", text: t("We will email you a confirmation number to verify your address.") }));

            var nameInput = el("input", { type: "text", class: "form-control", autocomplete: "name", maxlength: "100" });
            var emailInput = el("input", { type: "email", class: "form-control", autocomplete: "email", maxlength: "254" });
            var phoneInput = el("input", { type: "tel", class: "form-control", autocomplete: "tel", maxlength: "30" });
            nameInput.value = ctx.name;
            emailInput.value = ctx.email;
            phoneInput.value = ctx.phone;

            if (ctx.mode === "register") form.appendChild(field("Your Name", nameInput));
            form.appendChild(field("Your Email", emailInput));
            if (ctx.mode === "register") form.appendChild(field("Phone number", phoneInput));
            submit.textContent = t("Send confirmation number");
            firstInput = ctx.mode === "register" && !ctx.name ? nameInput : emailInput;

            form.addEventListener("submit", async function (e) {
                e.preventDefault();
                error.textContent = "";
                var email = emailInput.value.trim().toLowerCase();
                if (ctx.mode === "register" && !nameInput.value.trim()) { error.textContent = t("Please enter your name."); return; }
                if (!EMAIL_RE.test(email)) { error.textContent = t("Please enter a valid email address."); return; }
                ctx.email = email;
                ctx.name = nameInput.value.trim();
                ctx.phone = phoneInput.value.trim();
                setBusy(submit, true);
                var r = await sendCode(ctx);
                setBusy(submit, false);
                if (!r.ok) { error.textContent = errorText(r.data.error); return; }
                ctx.step = "code";
                renderAuth(ctx);
            });
        } else {
            modal.appendChild(el("p", { class: "mh-sub" }, [t("Enter the confirmation number we sent to") + " ", el("strong", { text: ctx.email })]));
            if (ctx.dev) modal.appendChild(el("p", { class: "mh-dev", text: "Dev mode: Gmail is not configured on the server yet, so the number is printed in the server console instead of being emailed." }));

            var codeInput = el("input", { type: "text", class: "form-control mh-code", inputmode: "numeric", pattern: "[0-9]*", maxlength: "6", autocomplete: "one-time-code", "aria-label": t("Confirmation number") });
            form.appendChild(field("Confirmation number", codeInput));
            submit.textContent = t("Verify");
            firstInput = codeInput;

            form.addEventListener("submit", async function (e) {
                e.preventDefault();
                error.textContent = "";
                var code = codeInput.value.trim();
                if (!/^\d{6}$/.test(code)) { error.textContent = t("The confirmation number is wrong or has expired."); return; }
                setBusy(submit, true);
                var r = await api("/auth/verify", "POST", { email: ctx.email, code: code, name: ctx.name, phone: ctx.phone });
                setBusy(submit, false);
                if (!r.ok) { error.textContent = errorText(r.data.error); return; }
                saveSession(r.data.token, r.data.user);
                updateAccountUI();
                closeModal();
                if (ctx.onSuccess) ctx.onSuccess();
            });
        }

        form.appendChild(error);
        form.appendChild(submit);

        if (ctx.step === "code") {
            form.appendChild(el("div", { class: "mh-links" }, [
                el("button", {
                    type: "button", text: t("Send a new confirmation number"), onclick: async function () {
                        error.textContent = "";
                        var r = await sendCode(ctx);
                        if (!r.ok) error.textContent = errorText(r.data.error);
                    },
                }),
                el("button", { type: "button", text: t("Use a different email"), onclick: function () { ctx.step = "email"; renderAuth(ctx); } }),
            ]));
        }
        modal.appendChild(form);

        if (ctx.step === "email") {
            var note = el("p", { class: "mh-social-note" });
            function goToProvider(provider) {
                var ret = location.pathname.replace(/^.*[\\/]/, "/") + location.search;
                location.href = API + "/api/auth/" + provider + "/start?return=" + encodeURIComponent(ret);
            }
            modal.appendChild(el("div", { class: "mh-social-divider", text: t("Or continue with") }));
            modal.appendChild(el("div", { class: "mh-social-buttons" }, [
                el("button", {
                    type: "button", class: "mh-social-btn mh-google",
                    onclick: function () { goToProvider("google"); },
                }, [el("i", { class: "fab fa-google" }), t("Continue with Gmail")]),
                el("div", { class: "d-flex gap-2" }, [
                    el("button", {
                        type: "button", class: "mh-social-btn mh-facebook",
                        onclick: function () { goToProvider("facebook"); },
                    }, [el("i", { class: "fab fa-facebook-f" }), t("Facebook")]),
                    el("button", {
                        type: "button", class: "mh-social-btn mh-instagram",
                        onclick: function () {
                            note.textContent = t("Instagram does not offer direct sign-in for personal accounts. Please use Google, Facebook, or your email.");
                        },
                    }, [el("i", { class: "fab fa-instagram" }), t("Instagram")]),
                ]),
            ]));
            modal.appendChild(note);
        }
        if (firstInput) firstInput.focus();
    }

    /* ---------- Dashboard ---------- */
    function showDashboard(tab) {
        if (!state.token) { showAuth({ mode: "login" }); return; }
        openModal(true);
        renderDashboard(tab || "bookings");
    }

    function renderDashboard(tab) {
        modal.textContent = "";
        modal.appendChild(closeButton());
        modal.appendChild(el("h4", { class: "mh-title", text: t("My Dashboard") }));
        modal.appendChild(el("p", { class: "mh-sub" }, [t("Signed in as") + " ", el("strong", { text: state.user.email })]));

        var body = el("div", { class: "mh-body" });
        var tabs = el("div", { class: "mh-tabs" }, [
            el("button", { type: "button", class: tab === "bookings" ? "active" : "", text: t("My Bookings"), onclick: function () { renderDashboard("bookings"); } }),
            el("button", { type: "button", class: tab === "profile" ? "active" : "", text: t("My Profile"), onclick: function () { renderDashboard("profile"); } }),
        ]);
        modal.appendChild(tabs);
        modal.appendChild(body);
        modal.appendChild(el("button", { type: "button", class: "btn btn-outline-primary mt-4", text: t("Log Out"), onclick: logout }));

        if (tab === "profile") renderProfile(body); else renderBookings(body);
    }

    async function renderBookings(body) {
        var r = await api("/bookings");
        if (!modal.contains(body)) return;
        if (r.status === 401) { showAuth({ mode: "login" }); return; }
        if (!r.ok) { body.appendChild(el("div", { class: "mh-error", text: errorText(r.data.error) })); return; }

        if (!r.data.bookings.length) {
            body.appendChild(el("p", { class: "mh-empty", text: t("You have no bookings yet.") }));
            body.appendChild(el("button", { type: "button", class: "btn btn-primary", text: t("Book a tour"), onclick: function () { closeModal(); goToBooking(); } }));
            return;
        }
        r.data.bookings.forEach(function (b) {
            var when = new Date(b.dateTime);
            var whenText = isNaN(when) ? b.dateTime : when.toLocaleString(window.MH_LANG ? window.MH_LANG() : undefined, { dateStyle: "medium", timeStyle: "short" });
            var card = el("div", { class: "mh-booking" }, [
                el("div", { class: "mh-ref", text: t("Booking number") + ": " + b.ref }),
                el("div", { class: "fw-bold", text: b.destination }),
                el("div", { class: "mh-meta", text: whenText + " · " + t("Persons") + ": " + b.persons }),
            ]);
            if (b.request) card.appendChild(el("div", { class: "mh-meta", text: b.request }));
            body.appendChild(card);
        });
    }

    function renderProfile(body) {
        var nameInput = el("input", { type: "text", class: "form-control", maxlength: "100" });
        var phoneInput = el("input", { type: "tel", class: "form-control", maxlength: "30" });
        var emailInput = el("input", { type: "email", class: "form-control", readonly: "" });
        nameInput.value = state.user.name || "";
        phoneInput.value = state.user.phone || "";
        emailInput.value = state.user.email;

        var status = el("div", { class: "mh-error", role: "status" });
        var save = el("button", { type: "submit", class: "btn btn-primary", text: t("Save changes") });
        var form = el("form", { novalidate: "" }, [field("Your Name", nameInput), field("Phone number", phoneInput), field("Your Email", emailInput), status, save]);
        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            status.classList.remove("ok");
            status.textContent = "";
            setBusy(save, true);
            var r = await api("/me", "PATCH", { name: nameInput.value.trim(), phone: phoneInput.value.trim() });
            setBusy(save, false);
            if (!r.ok) { status.textContent = errorText(r.data.error); return; }
            saveSession(state.token, r.data.user);
            updateAccountUI();
            status.classList.add("ok");
            status.textContent = t("Saved");
        });
        body.appendChild(form);
    }

    async function logout() {
        if (state.token) await api("/logout", "POST");
        saveSession(null, null);
        updateAccountUI();
        closeModal();
    }

    /* ---------- Booking confirmation ---------- */
    function showBookingDone(booking, emailSent) {
        openModal(false);
        modal.textContent = "";
        modal.appendChild(closeButton());
        modal.appendChild(el("h4", { class: "mh-title", text: t("Booking confirmed!") }));
        modal.appendChild(el("p", { class: "mh-sub", text: t("Your booking number is") }));
        modal.appendChild(el("div", { class: "mh-code-big", text: booking.ref }));
        if (emailSent) modal.appendChild(el("p", { class: "mh-sub text-center", text: t("We also emailed it to you.") }));
        modal.appendChild(el("div", { class: "d-flex gap-2 justify-content-center mt-3" }, [
            el("button", { type: "button", class: "btn btn-primary", text: t("My Bookings"), onclick: function () { showDashboard("bookings"); } }),
            el("button", { type: "button", class: "btn btn-outline-primary", text: t("Close"), onclick: closeModal }),
        ]));
    }

    /* ---------- Top bar (Register / Login / My Dashboard) ---------- */
    function updateAccountUI() {
        var loggedIn = !!state.token;
        var reg = document.getElementById("mhRegister");
        var log = document.getElementById("mhLogin");
        if (reg) reg.style.display = loggedIn ? "none" : "";
        if (log) log.style.display = loggedIn ? "none" : "";

        var toggle = document.getElementById("mhDashToggle");
        if (toggle) {
            var holder = toggle.closest(".dropdown");
            var label = document.getElementById("mhUserLabel");
            if (loggedIn && !label && holder) {
                label = el("small", { id: "mhUserLabel", class: "me-3 text-light" });
                holder.parentNode.insertBefore(label, holder);
            }
            if (label) {
                label.style.display = loggedIn ? "" : "none";
                if (loggedIn) label.textContent = state.user.name || state.user.email;
            }
        }
        syncBookingForm();
    }

    /* ---------- Booking form ---------- */
    var bookingForm = null;

    function syncBookingForm() {
        if (!bookingForm) return;
        var name = bookingForm.querySelector("#name");
        var email = bookingForm.querySelector("#email");
        if (!email || !name) return;
        if (state.token) {
            email.value = state.user.email;
            email.readOnly = true;
            if (!name.value && state.user.name) name.value = state.user.name;
        } else {
            email.readOnly = false;
        }
    }

    function localNowValue() {
        var d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    }

    function initBookingForm() {
        var persons = document.getElementById("SelectPerson");
        if (!persons) return;
        bookingForm = persons.closest("form");
        var when = bookingForm.querySelector("#datetime");
        if (when) { when.type = "datetime-local"; when.min = localNowValue(); }

        var error = el("div", { class: "text-warning fw-bold mt-2", role: "alert" });
        var submit = bookingForm.querySelector('button[type="submit"]');
        submit.parentNode.appendChild(error);

        bookingForm.addEventListener("submit", function (e) {
            e.preventDefault();
            error.textContent = "";
            var categorySelect = bookingForm.querySelector("#CategoriesSelect");
            var data = {
                name: bookingForm.querySelector("#name").value.trim(),
                email: bookingForm.querySelector("#email").value.trim(),
                dateTime: when ? when.value : "",
                destination: bookingForm.querySelector("#select1").value,
                persons: persons.value,
                category: categorySelect ? categorySelect.options[categorySelect.selectedIndex].text : "",
                request: (bookingForm.querySelector("textarea") || {}).value || "",
            };
            if (!data.destination) { error.textContent = t("Please choose a destination."); return; }
            if (!data.dateTime || new Date(data.dateTime) < new Date()) { error.textContent = t("Please choose a future date and time."); return; }

            if (!state.token) {
                if (!EMAIL_RE.test(data.email.toLowerCase())) { error.textContent = t("Please enter a valid email address."); return; }
                showAuth({ mode: "login", email: data.email.toLowerCase(), name: data.name, reason: true, onSuccess: function () { submitBooking(data, submit, error); } });
                return;
            }
            submitBooking(data, submit, error);
        });
        syncBookingForm();
    }

    async function submitBooking(data, submit, error) {
        setBusy(submit, true);
        var r = await api("/bookings", "POST", {
            name: data.name, destination: data.destination, dateTime: data.dateTime,
            persons: Number(data.persons), category: data.category, request: data.request,
        });
        setBusy(submit, false);
        if (r.status === 401) {
            showAuth({ mode: "login", email: data.email.toLowerCase(), name: data.name, reason: true, onSuccess: function () { submitBooking(data, submit, error); } });
            return;
        }
        if (!r.ok) { error.textContent = errorText(r.data.error); return; }
        bookingForm.reset();
        syncBookingForm();
        showBookingDone(r.data.booking, r.data.emailSent);
    }

    function goToBooking() {
        var persons = document.getElementById("SelectPerson");
        if (persons) persons.closest("form").scrollIntoView({ behavior: "smooth", block: "center" });
        else location.href = "booking.html#book";
    }

    var OAUTH_ERRORS = {
        google_not_configured: "Google sign-in is not set up yet on the server.",
        facebook_not_configured: "Facebook sign-in is not set up yet on the server.",
        google_denied: "Google sign-in was cancelled.",
        facebook_denied: "Facebook sign-in was cancelled.",
        google_no_email: "Your Google account has no verified email to sign in with.",
        facebook_no_email: "Your Facebook account has no email to sign in with. Please add one or use another method.",
        invalid_state: "That sign-in link expired. Please try again.",
    };

    function handleOAuthRedirect() {
        var params = new URLSearchParams(location.search);
        var token = params.get("authToken");
        var authError = params.get("authError");
        if (!token && !authError) return;
        params.delete("authToken");
        params.delete("authError");
        var clean = location.pathname + (params.toString() ? "?" + params.toString() : "") + location.hash;
        history.replaceState(null, "", clean);
        if (token) {
            state.token = token;
        } else if (authError) {
            showAuth({ mode: "login" });
            var errEl = modal && modal.querySelector(".mh-error");
            if (errEl) errEl.textContent = t(OAUTH_ERRORS[authError] || "Sign-in failed. Please try again.");
        }
    }

    /* ---------- Wiring ---------- */
    function init() {
        function on(node, handler) { if (node) node.addEventListener("click", handler); }

        on(document.getElementById("mhRegister"), function (e) { e.preventDefault(); showAuth({ mode: "register" }); });
        on(document.getElementById("mhLogin"), function (e) { e.preventDefault(); showAuth({ mode: "login" }); });
        on(document.getElementById("mhDashToggle"), function (e) {
            if (state.token) return;
            e.preventDefault();
            e.stopPropagation();
            showAuth({ mode: "login" });
        });
        document.querySelectorAll("[data-mh]").forEach(function (item) {
            item.addEventListener("click", function (e) {
                e.preventDefault();
                var action = item.getAttribute("data-mh");
                if (action === "logout") logout();
                else showDashboard(action);
            });
        });
        document.querySelectorAll("#navbarCollapse > a.btn, a.btn-hover").forEach(function (btn) {
            btn.addEventListener("click", function (e) { e.preventDefault(); goToBooking(); });
        });

        initBookingForm();
        updateAccountUI();
        if (location.hash === "#book") setTimeout(goToBooking, 300);

        handleOAuthRedirect();
        if (state.token) {
            api("/me").then(function (r) {
                if (r.ok) { saveSession(state.token, r.data.user); updateAccountUI(); }
                else { saveSession(null, null); updateAccountUI(); }
            });
        }
    }

    document.addEventListener("DOMContentLoaded", init);
})();
