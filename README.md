# Recroc Studio

## ဖိုင်တွေ
- `index.html` · `styles.css` · `script.js` — Main site
- `projects.json` — All content (auto-managed by admin)
- `studio-XXXXX.html` — Admin (secret URL!)
- `netlify.toml` — Pretty URLs (Netlify only)
- `images/` — Sample images
- `ADMIN-CREDENTIALS.txt` — **DO NOT UPLOAD!** Save somewhere private.

## Run locally
```
python3 -m http.server 8000
```
Site: http://localhost:8000
Admin: http://localhost:8000/studio-XXXXX.html (see credentials file)

## Deploy to Netlify
1. ZIP folder (delete `ADMIN-CREDENTIALS.txt` first!)
2. https://app.netlify.com/drop → drag ZIP
3. Live URL ထွက်လာမယ်

## Update content
1. Open admin URL → enter password
2. Edit anything → Save projects.json (downloads file)
3. Replace `projects.json` on host (Netlify dashboard → file)

## Security
- Admin URL က random ဖြစ်လို့ no one can guess
- Password ၂ layer
- `ADMIN-CREDENTIALS.txt` ကို NEVER upload to host
