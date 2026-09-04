# Jo-Vegi | جو-فيجي 🌿

**Premium Jordanian Fruits & Vegetables — From Jordan to the World**
**خضار وفواكه أردنية فاخرة — من أرض الأردن إلى موائد العالم**

A vibrant bilingual (Arabic RTL / English LTR) export website for **Jo-Vegi**, the venture of
**Rayan Nashwan — ريان نشوان**, based in Amman, Jordan.

---

## ✨ Features | المزايا

- 🌐 **Bilingual** — full Arabic (RTL, default) ⇄ English (LTR) toggle, remembered per visitor.
-  **41 real products** with real photos extracted from the official export catalog
  (vegetables, herbs & leaves, legumes, fruits, dates & nuts) with season + packing specs.
- 🧺 **Order cart + purchase form** — orders are delivered to **ZarqaFreeZone@gmail.com**
  (via FormSubmit when activated, with automatic `mailto:` fallback) and/or **WhatsApp**.
- 📱 One-tap **WhatsApp** (`+962 77 550 1100`) and **call** buttons everywhere.
- 🎨 Vivid, animated design: floating hero collage, marquee, scroll reveals, hover lifts.

## 📞 Contact | التواصل

| | |
|---|---|
| Owner | **Rayan Nashwan — ريان نشوان** |
| WhatsApp / Phone | **+962 77 550 1100** |
| Email | **ZarqaFreeZone@gmail.com** |
| Location | **Amman — Jordan | عمّان — الأردن** |

## 🚀 Run locally | التشغيل محلياً

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## ☁️ Publish on GitHub Pages | النشر على GitHub Pages

1. Create a **new GitHub account** at https://github.com/signup (or sign in).
2. Create a new repository named `jo-vegi` (public, no README).
3. From this folder run:

```bash
bash push-to-github.sh YOUR_GITHUB_USERNAME
```

…or manually:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/jo-vegi.git
git branch -M main
git push -u origin main
```

4. In the repo: **Settings → Pages → Build and deployment → Source: "Deploy from a branch" →
   Branch: `main` / folder `/ (root)` → Save**.
5. Your site goes live at `https://YOUR_GITHUB_USERNAME.github.io/jo-vegi/` 🎉

> 📬 **First order email activation:** the form uses FormSubmit.co to deliver orders straight to
> ZarqaFreeZone@gmail.com. After the *first* submitted order, FormSubmit sends a one-time
> activation email to that inbox — click "Activate" once, and every future order lands in the
> inbox automatically. Until then (or offline), the form opens the visitor's mail app pre-filled.

## 🗂 Structure | البنية

```
index.html        bilingual single-page site
css/style.css     vibrant design system (RTL/LTR aware)
js/products.js    catalog data (AR/EN) — 41 products
js/i18n.js        UI strings (AR/EN)
js/app.js         language toggle, cart, order form, animations
img/              product photos + logo.svg
```

© 2026 Jo-Vegi — Rayan Nashwan. Made with 💚 in Jordan.
