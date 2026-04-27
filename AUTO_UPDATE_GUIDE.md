# Auto-Update System — Step-by-Step Guide (Free, 2026)

## How it works

On every login the app fetches `version.json` from your website.  
If the remote version is higher than the installed version it shows an "Update Available" modal.  
The user clicks **Download Update** → opens a Google Drive link → downloads the new installer.  
Running the new installer upgrades in place (NSIS detects the existing install, uninstalls silently, then installs fresh). Patient data in `%APPDATA%\patient-records-manager\` is never touched.

---

## Your side — one-time setup

### Step 1 — Deploy the website (free, Netlify)

The website folder already contains `netlify.toml` (security headers, caching) and `_redirects`.

1. Go to [netlify.com](https://netlify.com) and sign up / log in (free).
2. Click **Add new site → Import an existing project → GitHub**.
3. Select the `pmr-website` repository.
4. Build settings — leave blank (static site, no build command):
   - Build command: *(empty)*
   - Publish directory: `.`
5. Click **Deploy site**. Netlify gives you a URL like `https://pmr-website.netlify.app`.
6. Optionally set a custom domain under **Domain settings**.
7. Your `version.json` is then live at:  
   `https://<your-netlify-subdomain>.netlify.app/version.json`

> **Also works:** GitHub Pages — go to repo Settings → Pages → Deploy from branch → main.  
> Cloudflare Pages — drag the folder in at pages.cloudflare.com.

---

### Step 2 — Host the installer on Google Drive

1. Build the installer: `npm run package:win` → produces `dist/Patient Records Manager Setup X.Y.Z.exe`
2. Upload that `.exe` to **Google Drive**.
3. Right-click → **Share → Anyone with the link → Viewer**.
4. Copy the share URL, extract the file ID:  
   `https://drive.google.com/file/d/FILE_ID_HERE/view`
5. Construct the direct download link:  
   `https://drive.google.com/uc?export=download&id=FILE_ID_HERE`

---

### Step 3 — Update version.json on your website

Edit `version.json` in your GitHub repo (or re-upload):

```json
{
  "version": "1.1.0",
  "releaseDate": "2026-05-01",
  "downloadUrl": "https://drive.google.com/uc?export=download&id=FILE_ID_HERE",
  "releaseNotes": "Bug fixes and new features in this release."
}
```

Commit → GitHub Pages serves the new file within ~60 seconds.

---

### Step 4 — Update the check URL in the app

In `app/renderer/components/UpdateModal.tsx`, line 6:

```ts
export const UPDATE_CHECK_URL = 'https://pmr-web.netlify.app/version.json'
```

This is already set correctly. All subsequent updates only need Steps 2–3.

---

## Every future release (30-second workflow)

1. Bump version in `package.json` → e.g. `"version": "1.1.0"`
2. Run `npm run package:win` → new installer in `dist/`
3. Upload new `.exe` to Google Drive → copy new file ID
4. Edit `version.json` in GitHub repo → update `version`, `downloadUrl`, `releaseNotes`
5. Commit — done. All installed apps will see the update on next login.

---

## Why Google Drive for the installer?

- **Free** — no bandwidth limit for reasonable download volumes
- **No server needed** — just a shareable link
- **Large file support** — installers are 80–150 MB, GitHub Pages has a 100 MB file limit
- **Always available** — Google's uptime is essentially 100%

The website itself (HTML/CSS/JS/version.json) is tiny (<50 KB total) and hosted free on GitHub Pages.

---

## Files involved in the update system

| File | Role |
|------|------|
| `app/renderer/components/UpdateModal.tsx` | Fetch logic + modal UI |
| `app/renderer/App.tsx` | Triggers check after login |
| `PMR-Website/version.json` | Remote version source of truth |
| `PMR-Website/index.html` | Download page users land on |
| `package.json` → `"version"` | Installed version (compared against remote) |


Price — updated to ₹5,000 (fair price for lifetime access).

Netlify files added:

File	Purpose
netlify.toml	Security headers (CSP, HSTS, X-Frame-Options, etc.), long-lived cache for CSS/JS, no-cache + CORS * for version.json and issued_licenses.json
_redirects	Any unknown URL falls back to index.html (clean 404 handling)
To deploy on Netlify:

Go to netlify.com → Add new site → Import from GitHub → select MirFaizan06/pmr-website
Leave build command blank, publish directory .
Deploy — that's it. Every future git push auto-deploys.
Once deployed, update UPDATE_CHECK_URL in UpdateModal.tsx to your Netlify URL.