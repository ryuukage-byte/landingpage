# Sevnsoul — landing page

Satu adegan: karakter pixel menyambut pengunjung, mencari tujuan, lalu melompat ke langit-langit dan menarik banner tujuannya.

| Path | Isi |
|---|---|
| `index.html` | Landing (HTML + CSS) |
| `public/landing.js` | Sutradara adegan (intro, pencarian, lompat, banner, idle) |
| `public/sprite.js` | Renderer + animasi karakter (prosedural, tanpa gambar). Animasi dicek di Character Studio (`C:\project\sevnsoul-character-studio`), bukan di situs |
| `public/content.js` | **Data tujuan** + pencarian kata kunci — edit di sini untuk menambah produk |
| `public/icons.js` | Ikon pixel 12×12 |
| `docs/` | PRD, DESIGN, CHARACTER, CONTENT, ICONS |
| `icons/` | Ikon SVG hasil `node tools/export-icons.js` |

Skrip di `public/` adalah file biasa (bukan modul), jadi Vite menyalinnya apa adanya ke `dist/`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # hasil di dist/ (dipakai Vercel)
```
