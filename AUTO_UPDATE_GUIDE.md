# Auto-Update System — Step-by-Step Guide (Free, 2026)

## How it works

On every login the app fetches `version.json` from your website.  
If the remote version is higher than the installed version it shows an "Update Available" modal.  
The user clicks **Download Update** → opens a Google Drive link → downloads the new installer.  
Running the new installer upgrades in place (NSIS detects the existing install, uninstalls silently, then installs fresh). Patient data in `%APPDATA%\patient-records-manager\` is never touched.

---

## Your side — one-time setup

### Step 1 — Deploy the website (free, GitHub Pages)

1. Create a free GitHub account at github.com if you don't have one.
2. Create a new **public** repository named exactly: `pmr-website`
3. Upload the contents of `C:\Users\Faizan\Desktop\PMR-Website\` to that repo.
4. Go to repo **Settings → Pages → Source → Deploy from branch → main / (root)**.
5. GitHub gives you a URL like: `https://mirfaizan06.github.io/pmr-website/`
6. Your `version.json` is now live at:  
   `https://mirfaizan06.github.io/pmr-website/version.json`

> **Alternatives:** Netlify and Cloudflare Pages both work — just drag the folder in.

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
export const UPDATE_CHECK_URL = 'https://mirfaizan06.github.io/pmr-website/version.json'
```

Replace `mirfaizan06` with your actual GitHub username.  
Then rebuild and distribute the app once. All subsequent updates only need Steps 2–3.

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
