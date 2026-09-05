/* Jo-Vegi — application logic: i18n, catalog rendering, cart, order form */
(function () {
  "use strict";

  const EMAIL = "ZarqaFreeZone@gmail.com";
  const FORMSUBMIT_ID = "75a6eec97b85fca71b093c425977c754"; // encoded inbox id (keeps the email hidden from scrapers)
  const WA_NUMBER = "962775501100";
  const PHONE_DISPLAY = "+962 77 550 1100";

  let lang = localStorage.getItem("jovegi-lang") || "ar";
  let currentCat = "all";
  let query = "";
  const cart = new Map(); // id -> qty

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const t = (k) => (I18N[lang] && I18N[lang][k]) || (I18N.ar[k] ?? k);

  /* ---------- language ---------- */
  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("jovegi-lang", lang);
    $$("[data-i18n]").forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
    $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.title = lang === "ar"
      ? "Jo-Vegi | جو-فيجي — خضار وفواكه أردنية فاخرة"
      : "Jo-Vegi — Premium Jordanian Fruits & Vegetables";
    renderChips();
    renderProducts();
    renderCart();
  }

  /* ---------- catalog ---------- */
  function renderChips() {
    const bar = $("#filterBar");
    bar.innerHTML = "";
    Object.keys(CATEGORIES).forEach((key) => {
      const b = document.createElement("button");
      b.className = "chip" + (key === currentCat ? " active" : "");
      b.textContent = CATEGORIES[key][lang];
      b.onclick = () => { currentCat = key; renderChips(); renderProducts(); };
      bar.appendChild(b);
    });
  }

  function filtered() {
    return PRODUCTS.filter((p) => {
      const okCat = currentCat === "all" || p.cat === currentCat;
      const q = query.trim().toLowerCase();
      const okQ = !q || p.en.toLowerCase().includes(q) || p.ar.includes(query.trim());
      return okCat && okQ;
    });
  }

  function renderProducts() {
    const grid = $("#prodGrid");
    const list = filtered();
    grid.innerHTML = "";
    if (!list.length) {
      grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted);font-weight:700;padding:40px 0">
        ${lang === "ar" ? "لا نتائج مطابقة 🌱" : "No matching results 🌱"}</p>`;
      return;
    }
    list.forEach((p, i) => {
      const card = document.createElement("article");
      card.className = "prod-card reveal in";
      card.style.animationDelay = (i % 8) * 40 + "ms";
      const inCart = cart.has(p.id);
      card.innerHTML = `
        <div class="prod-media">
          <img src="${p.img}" alt="${p.en} ${p.ar}" loading="lazy">
          <span class="prod-season">🗓 ${p["season" + cap(lang)]}</span>
        </div>
        <div class="prod-body">
          <h3>${lang === "ar" ? p.ar : p.en}</h3>
          <div class="sub">${lang === "ar" ? p.en : p.ar}</div>
          <div class="prod-meta">
            <span class="green">📦 ${p["pack" + cap(lang)]}</span>
          </div>
          <button class="add-btn ${inCart ? "added" : ""}" data-id="${p.id}">
            ${inCart ? t("added") : t("add")}
          </button>
        </div>`;
      card.querySelector(".add-btn").onclick = () => addToCart(p.id);
      grid.appendChild(card);
    });
  }
  const cap = (l) => (l === "ar" ? "Ar" : "En");

  /* ---------- cart ---------- */
  function addToCart(id) {
    cart.set(id, (cart.get(id) || 0) + 1);
    syncCartUI();
    toast(t("toast.add"));
  }
  function decItem(id) {
    const q = (cart.get(id) || 0) - 1;
    if (q <= 0) { cart.delete(id); toast(t("toast.rem")); } else cart.set(id, q);
    syncCartUI();
  }
  function syncCartUI() {
    const count = Array.from(cart.values()).reduce((a, b) => a + b, 0);
    $("#cartCount").textContent = count;
    renderCart();
    renderProducts();
  }
  function renderCart() {
    const box = $("#cartItems");
    const totalEl = $("#cartTotalLine");
    if (!cart.size) {
      box.innerHTML = `<div class="cart-empty">${t("cart.empty")}</div>`;
      totalEl.style.display = "none";
      return;
    }
    totalEl.style.display = "flex";
    box.innerHTML = "";
    cart.forEach((qty, id) => {
      const p = PRODUCTS.find((x) => x.id === id);
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img src="${p.img}" alt="">
        <div class="info"><b>${lang === "ar" ? p.ar : p.en}</b><small>${p["pack" + cap(lang)]}</small></div>
        <div class="qty">
          <button data-a="dec" aria-label="-">−</button>
          <span>${qty}</span>
          <button data-a="inc" aria-label="+">+</button>
        </div>`;
      row.querySelector('[data-a="inc"]').onclick = () => { cart.set(id, qty + 1); syncCartUI(); };
      row.querySelector('[data-a="dec"]').onclick = () => decItem(id);
      box.appendChild(row);
    });
    $("#cartTotal").textContent = `${cart.size} ${t("cart.items")}`;
  }

  /* ---------- order message ---------- */
  function orderText() {
    const v = (id) => $(id).value.trim();
    const L = lang === "ar";
    const lines = [];
    lines.push(L ? "🌿 طلب شراء جديد — Jo-Vegi" : "🌿 New purchase order — Jo-Vegi");
    lines.push("――――――――――――――");
    lines.push(L ? "👤 بيانات العميل:" : "👤 Customer details:");
    lines.push(`${t("f.name").replace(" *","")}: ${v("#fName")}`);
    if (v("#fCompany")) lines.push(`${t("f.company").replace(" (اختياري)","").replace(" (optional)","")}: ${v("#fCompany")}`);
    lines.push(`${t("f.phone").replace(" *","")}: ${v("#fPhone")}`);
    lines.push(`${t("f.email").replace(" *","")}: ${v("#fEmail")}`);
    lines.push(`${t("f.city").replace(" *","")}: ${v("#fCity")}`);
    lines.push(`${t("f.delivery")}: ${$("#fDelivery").selectedOptions[0].textContent}`);
    if (v("#fNotes")) lines.push(`${t("f.notes")}: ${v("#fNotes")}`);
    lines.push("――――――――――――――");
    lines.push(`🧺 ${t("mail.items")}:`);
    if (cart.size) {
      cart.forEach((qty, id) => {
        const p = PRODUCTS.find((x) => x.id === id);
        lines.push(`• ${p.ar} / ${p.en} — ${qty} × (${p.packEn})`);
      });
    } else lines.push(t("mail.none"));
    lines.push("――――――――――――――");
    lines.push(L ? "أُرسل من موقع Jo-Vegi" : "Sent from Jo-Vegi website");
    return lines.join("\n");
  }

  function validate() {
    const req = ["#fName", "#fPhone", "#fEmail", "#fCity"];
    for (const id of req) if (!$(id).value.trim()) { toast(t("toast.err")); $(id).focus(); return false; }
    return true;
  }

  function sendEmail() {
    if (!validate()) return;
    const body = orderText();
    // Try FormSubmit (delivers straight to the owner's inbox after one-time activation),
    // gracefully falling back to the visitor's mail client.
    const mailtoFallback = () => {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(t("order.subject"))}&body=${encodeURIComponent(body)}`;
      toast(t("toast.mail"));
    };
    fetch("https://formsubmit.co/ajax/" + FORMSUBMIT_ID, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: t("order.subject"), _template: "table", message: body, name: $("#fName").value, email: $("#fEmail").value, phone: $("#fPhone").value }),
    })
      .then((r) => { if (!r.ok) throw 0; return r.json(); })
      .then((data) => {
        // FormSubmit replies success:"false" until the owner activates the inbox once.
        if (data && (data.success === "true" || data.success === true)) toast(t("toast.sent"));
        else mailtoFallback();
      })
      .catch(mailtoFallback);
  }

  function sendWhatsApp() {
    if (!validate()) return;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(orderText())}`;
    window.open(url, "_blank");
  }

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  /* ---------- marquee ---------- */
  function buildMarquee() {
    const names = PRODUCTS.map((p) => `${p.ar} <i>✦</i> ${p.en}`).slice(0, 22);
    const half = names.map((n) => `<span>${n}</span>`).join("");
    $("#marqueeTrack").innerHTML = half + half;
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
  }

  /* ---------- wiring ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    applyLang();
    buildMarquee();
    initReveal();

    $("#langBtn").onclick = () => { lang = lang === "ar" ? "en" : "ar"; applyLang(); };
    $("#searchInput").oninput = (e) => { query = e.target.value; renderProducts(); };
    $("#cartClear").onclick = () => { cart.clear(); syncCartUI(); };
    $("#sendEmailBtn").onclick = sendEmail;
    $("#sendWaBtn").onclick = sendWhatsApp;

    $("#burger").onclick = () => $("#nav").classList.toggle("open");
    $$("#nav a").forEach((a) => a.onclick = () => $("#nav").classList.remove("open"));

    window.addEventListener("scroll", () => {
      $("#header").classList.toggle("scrolled", window.scrollY > 30);
    });

    // PWA: service worker + install prompt
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      window.__pwaPrompt = e;
      const b = $("#installBtn");
      if (b) b.style.display = "inline-flex";
    });
    $("#installBtn").onclick = async () => {
      if (window.__pwaPrompt) { window.__pwaPrompt.prompt(); window.__pwaPrompt = null; $("#installBtn").style.display = "none"; }
    };

    // visitor counter — starts at 1,974 (abacus value + offset)
    const vc = $("#visitCount");
    if (vc) {
      fetch("https://abacus.jasoncameron.dev/hit/jo-vegi/visits")
        .then((r) => r.json())
        .then((d) => { vc.textContent = (1972 + (d.value || 2)).toLocaleString("en-US"); })
        .catch(() => {});
    }

    // fill contact values
    $$(".js-wa").forEach((a) => (a.href = `https://wa.me/${WA_NUMBER}`));
    $$(".js-tel").forEach((a) => (a.href = `tel:+${WA_NUMBER}`));
    $$(".js-mail").forEach((a) => (a.href = `mailto:${EMAIL}`));
    $("#waFab").href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lang === "ar" ? "مرحباً Jo-Vegi 🌿 أود الاستفسار عن منتجاتكم" : "Hello Jo-Vegi 🌿 I'd like to inquire about your products")}`;
  });
})();
