# Handover: Push Cybaxis Corp site to GitHub + enable GitHub Pages

**Repo:** https://github.com/ibalajisivarajan/cybaxiscorp
**Goal:** Push all site files to `main`, enable GitHub Pages, confirm it's live.

---

## 1. Files in this folder

```
index.html
services.html
about.html
experience.html
contact.html
styles.css
script.js
.nojekyll        ← must stay in repo root, tells GitHub Pages to skip Jekyll processing
assets/          ← real Cybaxis Corp logo + favicon files, extracted from the uploaded brand PDFs/PNGs
  logo-white-web.png     (nav + footer, used on dark backgrounds)
  logo-color-web.png     (available for light-background placements if needed later)
  favicon.ico / favicon-32.png / favicon-16.png / favicon-512.png / apple-touch-icon.png
```

All internal links (nav, footer, CSS, JS, image paths) are **relative paths** (`services.html`, `styles.css`, `assets/logo-white-web.png`), so the site works correctly whether it's served at a domain root (Netlify) or a subpath (GitHub Pages project sites serve at `username.github.io/repo-name/`). No path rewriting needed.

**Note on brand assets:** the uploaded logo files include a version with the tagline "Cyberspace Solutions" underneath the wordmark. The site copy currently positions the company as general "IT Consulting" rather than cybersecurity-specific. If Cyberspace Solutions is the intended positioning, the homepage/about copy should be revisited — the logo integration itself doesn't depend on that decision, so it's safe to push as-is and settle the positioning question separately.

---

## 2. Push to GitHub

Run from inside this folder (where index.html etc. live):

```bash
git init
git add .
git commit -m "Initial site: home, services, about, experience, contact"
git branch -M main
git remote add origin https://github.com/ibalajisivarajan/cybaxiscorp.git
git push -u origin main
```

If the repo already has a commit (e.g. an auto-generated README from GitHub's "create repo" flow), pull first to avoid a rejected push:

```bash
git pull origin main --allow-unrelated-histories
# resolve any conflict on README.md if prompted, then:
git push -u origin main
```

---

## 3. Enable GitHub Pages

Via the GitHub web UI (fastest, no extra auth needed):
1. Go to the repo → **Settings** → **Pages** (left sidebar)
2. Under **Build and deployment** → **Source**, select **Deploy from a branch**
3. Branch: **main**, folder: **/ (root)**
4. Click **Save**

Or via GitHub CLI (`gh`), if authenticated:

```bash
gh api repos/ibalajisivarajan/cybaxiscorp/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

---

## 4. Confirm it's live

GitHub Pages takes 1–2 minutes to build after enabling. The site will be live at:

```
https://ibalajisivarajan.github.io/cybaxiscorp/
```

Check the **Settings → Pages** panel — it shows a green checkmark and the live URL once the build succeeds. Verify all five pages load and nav links work correctly at that subpath.

---

## 5. After you're happy with it → Netlify

This GitHub Pages URL is just for review. When ready to go live on `cybaxiscorp.net`:

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Connect GitHub → select the `cybaxiscorp` repo
3. Build settings: leave **build command blank** and **publish directory** as `/` (root) — this is a static site, no build step needed
4. Deploy
5. In Netlify → **Domain settings** → **Add a domain** → enter `cybaxiscorp.net`, then add the DNS records Netlify gives you at your domain registrar

Once Netlify is verified and serving the domain, GitHub Pages can stay on or be disabled — it won't conflict since they're different URLs.

---

## Known placeholders still in the content (do before going fully live)

- `contact.html` — form posts to `https://formspree.io/f/YOUR_FORM_ID`; replace with a real Formspree form ID (free tier, formspree.io)
- `experience.html` — testimonial quotes and two engagement descriptions (Levio, PayByPhone) are marked `[placeholder]`; the JetBlue/CSAA lines have a flag about client-vs-employer framing that needs a decision
- Footer `mailto:hello@cybaxiscorp.net` and LinkedIn link — update to real addresses across all 5 files (same footer block repeated on each page)
