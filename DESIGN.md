# Design System & Architecture: Sevnsoul

Dokumentasi komprehensif sistem desain, arsitektur visual, palet warna, tipografi, dan komponen antarmuka (UI/UX) untuk **Sevnsoul — Ideas, Built**.

---

## 1. 🌌 Filosofi & Arah Desain (Design Philosophy)

Sevnsoul mengusung estetika **Dark Minimalist & Futuristic Tech** dengan perpaduan *precision engineering* dan sentuhan *tactile micro-interactions*. 

### Prinsip Utama:
- **Dark Mode-First**: Palet hitam pekat dan abu-abu arang untuk mengurangi kelelahan mata serta menonjolkan fokus konten secara elegan.
- **Subtle Depth & Layering**: Menggunakan sistem elevasi multi-layer (`surface-1`, `surface-2`, `surface-3`) dipadukan dengan *dual-shadows* (bayangan ganda terang dan gelap) untuk menghadirkan efek kedalaman 3D yang halus tanpa terkesan berat.
- **Glassmorphism & Ambient Glow**: Aksen pendaran cahaya asimetris (*ambient radial glow*) dan pantulan kaca (*glass sheen*) yang bereaksi secara organik saat pengguna berinteraksi.
- **Clean Typography Contrast**: Kontras tegas antara judul ekspresif beraliran modern (*Space Grotesk*), teks bacaan berpresisi tinggi (*Inter*), dan aksen teknis berbasis monospaced (*JetBrains Mono*).

---

## 2. 🌈 Palet Warna (Color Palette & Tokens)

Sistem warna diatur sepenuhnya melalui CSS Custom Properties (`:root`) untuk mempermudah pemeliharaan, skalabilitas, dan konsistensi lintas halaman.

### 2.1 Latar Belakang & Permukaan (Background & Surfaces)

| Token CSS | Kode Warna / Nilai | Penjelasan Visual & Peran |
| :--- | :--- | :--- |
| `--bg` | `#0a0a0a` | **Main Background**: Latar belakang utama kanvas (Ultra Dark Onyx). |
| `--bg-soft` | `#0d0d0d` | **Subtle Background**: Latar belakang form input atau elemen berkedalaman rendah. |
| `--surface` | `#161616` | **Surface 1 (Base Layer)**: Warna dasar kartu dan kontainer utama. |
| `--surface-2` | `#1e1e1e` | **Surface 2 (Elevated)**: Titik gradien kartu, dropdown, atau tombol sekunder. |
| `--surface-3` | `#262626` | **Surface 3 (High Elevation)**: Kartu *featured*, status aktif tinggi, atau hover state tombol. |

### 2.2 Garis Batas (Borders & Dividers)

| Token CSS | Kode Warna / Nilai | Penjelasan Visual & Peran |
| :--- | :--- | :--- |
| `--border` | `rgba(255, 255, 255, 0.07)` | Garis batas tipis transparan bawaan kartu dan pemisah layout. |
| `--border-strong` | `rgba(255, 255, 255, 0.14)` | Garis batas saat kartu di-hover atau bingkai tombol penting. |
| `--border-focus` | `rgba(255, 255, 255, 0.30)` | Garis batas indikator fokus input form (`:focus`). |

### 2.3 Tipografi & Hirarki Teks (Text Colors)

| Token CSS | Kode Warna / Nilai | Penjelasan Visual & Peran |
| :--- | :--- | :--- |
| `--text` | `#f4f4f2` | **Primary Text**: Putih pudar berbobot tinggi untuk judul dan label utama. |
| *(Text Highlight)* | `#ffffff` | **Accent Pure White**: Digunakan pada tag `<em>` untuk penekanan frasa kunci di Hero. |
| `--text-dim` | `rgba(244, 244, 242, 0.58)` | **Secondary Text**: Subtitle, deskripsi pendek, dan navigasi. |
| `--text-faint` | `rgba(244, 244, 242, 0.34)` | **Tertiary / Meta Text**: Footer copyright, teks penjelas mikro, teks bantuan. |

### 2.4 Status Semantik & Badges (Semantic Colors)

Warna aksen fungsional untuk menunjukkan status ketersediaan atau kategori produk:

| Status | Warna Aksen | Background Badge | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Active / Live** | `#4ade80` | `rgba(74, 222, 128, 0.15)` | Produk/tools yang sudah siap digunakan. |
| **Coming Soon** | `#facc15` | `rgba(250, 204, 21, 0.15)` | Proyek atau fitur dalam tahap pengembangan. |
| **Beta Access** | `#60a5fa` | `rgba(96, 165, 250, 0.15)` | Produk dalam fase pengujian awal / preview. |
| **Danger / Lock** | `#f87171` | `rgba(248, 113, 113, 0.15)` | Status terkunci, error, atau aksi destruktif. |

### 2.5 Cahaya & Bayangan (Lighting & Shadows)

```css
:root {
  --shadow-dark: rgba(0, 0, 0, 0.55);
  --shadow-light: rgba(255, 255, 255, 0.035);
}
```

- **Dual Drop-Shadow Formula**:
  `box-shadow: 8px 8px 20px var(--shadow-dark), -6px -6px 16px var(--shadow-light);`
  Menghadirkan kesan *soft extrusion* yang menyatu alami dengan tema gelap.
- **Glass Sheen Hover Formula**:
  `background: linear-gradient(120deg, rgba(255,255,255,0.10), rgba(255,255,255,0.015) 40%, transparent 70%);`
  Dipadukan dengan `backdrop-filter: blur(6px)`.

---

## 3. ✍️ Sistem Tipografi (Typography Scale)

Sevnsoul memadukan 3 jenis font Google Fonts yang di-load dengan optimasi `preconnect`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 3.1 Peran Font

1. **Space Grotesk** (`sans-serif`):
   - **Karakter**: Geometris, tajam, modern, bernuansa futuristik.
   - **Peran**: Headings (`H1`, `H2`), judul kartu (`.cat-name`, `.prod-name`), dan tombol CTA utama.
2. **Inter** (`sans-serif`):
   - **Karakter**: Netral, sangat nyaman dibaca (*high legibility*), proporsi seimbang.
   - **Peran**: Body text, paragraf deskripsi, label umum, input teks.
3. **JetBrains Mono** (`monospace`):
   - **Karakter**: Presisi, teknis, estetika pengembang (*developer-first*).
   - **Peran**: Wordmark logo (`letter-spacing: 0.42em`), badge status, label input form, meta footer.

### 3.2 Skala Hirarki Tipografi

| Elemen / Kelas | Font Family | Ukuran Font (Size) | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** (`.hero h1`) | Space Grotesk | `clamp(28px, 4.6vw, 50px)` | 400 / 600 (`em`) | 1.28 | `-0.01em` |
| **Section / Form Title** | Space Grotesk | `28px` | 500 | 1.3 | `-0.01em` |
| **Card Heading** (`.cat-name`) | Space Grotesk | `19px` | 500 | 1.35 | `-0.01em` |
| **Product Heading** (`.prod-name`) | Space Grotesk | `18px` | 500 | 1.35 | `-0.01em` |
| **Hero Subtitle** (`.hero p.sub`) | Inter | `15px` | 300 | 1.7 | Normal |
| **Body / Input Form** | Inter | `15px` | 400 | 1.6 | Normal |
| **Card Subtext / Focus** | Inter | `12.5px - 13px` | 400 | 1.55 | Normal |
| **Wordmark Logo** | JetBrains Mono | `13px` | 500 | 1.0 | `0.42em` |
| **Form Field Label** | JetBrains Mono | `12px` | 400 | 1.0 | `0.05em` |
| **Status Badge** | JetBrains Mono | `10px` | 600 | 1.0 | `0.05em` |
| **Footer Meta** | JetBrains Mono | `11px` | 400 | 1.0 | `0.08em` |

---

## 4. 📐 Tata Letak & Grid (Layout & Spacing System)

### 4.1 Kontainer Layout

- **Halaman Utama / Kategori**: `max-width: var(--max)` (`1180px`), padding horizontal `24px`.
- **Halaman Form / Modal Fokus**: `max-width: var(--max)` (`540px`), padding horizontal `24px`.

### 4.2 Breakpoints & Skema Responsif

| Perangkat | Resolusi Layar | Grid Kartu | Perilaku Layout |
| :--- | :--- | :--- | :--- |
| **Desktop** | `> 860px` | `3 Kolom` (`repeat(3, 1fr)`) | Grid 3 kolom, Featured Card merentang 3 kolom penuh (`1 / -1`). |
| **Tablet** | `561px – 860px` | `2 Kolom` (`repeat(2, 1fr)`) | Grid beralih menjadi 2 kolom, jarak antar kartu tetap 18px. |
| **Mobile** | `≤ 560px` | `1 Kolom` (`1fr`) | Kartu vertikal 1 kolom, padding hero berkurang, jarak kartu 14px. |

### 4.3 Nilai Border Radius

- **Kartu Utama / Kategori (`--radius`)**: `20px`
- **Container Form Modal Box**: `16px` – `24px`
- **Input Text / Textarea / Tombol**: `12px`
- **Status Badge**: `12px` (Pill shape)
- **Tombol Panah / Icon Circular**: `50%` (Lingkaran Penuh)

---

## 5. 🧩 Komponen & Pola Interaksi (Components Guide)

### 5.1 Kartu Kategori (`.cat-card`)
- **Latar Belakang**: `linear-gradient(155deg, var(--surface) 0%, var(--surface-2) 100%)`.
- **Interaksi Hover**:
  - `transform: translateY(-4px)`
  - Membuka lapisan kaca (`::before` opacity beralih dari `0` ke `1`)
  - Border bertransformasi menjadi `--border-strong`
  - Tombol panah (`.cat-arrow`) terisi warna putih (`var(--text)`) dan ikon bergeser sedikit ke kanan-atas (`translate(1px, -1px)`).
- **Varian Featured**: Merentang penuh (`grid-column: 1 / -1`), tata letak horizontal pada desktop dengan gradien yang diperluas ke `--surface-3`.

### 5.2 Kartu Produk (`.product-card`)
- Menampilkan ikon visual atau emoji kategori di kiri atas, dan **Status Badge** di kanan atas.
- Menggunakan transisi bayangan dan elevasi yang seragam dengan kartu kategori.

### 5.3 Badges Status (`.status-badge`)
- Dituliskan dalam huruf kapital (*uppercase*) dengan tipografi `JetBrains Mono`.
- Varian class:
  - `.status-badge.active`: Teks hijau segar (`#4ade80`), latar `rgba(74, 222, 128, 0.15)`.
  - `.status-badge.coming-soon`: Teks kuning hangat (`#facc15`), latar `rgba(250, 204, 21, 0.15)`.
  - `.status-badge.beta`: Teks biru elektrik (`#60a5fa`), latar `rgba(96, 165, 250, 0.15)`.

### 5.4 Form Input & Interaksi (`simple_form.html`)
- **Input & Textarea**:
  - Background: `var(--bg-soft)` dengan border transparan `var(--border)`.
  - Hover: Border berubah ke `var(--border-strong)`.
  - Focus: Border berubah menjadi `var(--border-focus)`, background naik ke `var(--surface)`, serta pendaran glow `box-shadow: 0 0 0 4px rgba(255,255,255,0.02)`.
- **Tombol CTA Form**:
  - Background: `var(--text)` (`#f4f4f2`), Teks: `var(--bg)` (`#0a0a0a`).
  - Hover: Terangkat `translateY(-2px)` disertai pendaran putih `box-shadow: 0 8px 16px rgba(255,255,255,0.15)`.

### 5.5 Modal Overlay (`#follow-overlay`)
- **Backdrop**: `background: rgba(10, 10, 10, 0.7)` dengan `backdrop-filter: blur(12px)`.
- **Kotak Modal**: Background `var(--surface)`, border `var(--border-strong)`, bayangan tebal `0 24px 48px rgba(0,0,0,0.6)`.
- Memiliki transisi lembut *fade-in* dan sedikit *slide-up* saat terbuka.

---

## 6. 🎬 Animasi & Easing (Motion & Transitions)

### 6.1 Easing Kurva
```css
:root {
  --ease: cubic-bezier(.22, 1, .36, 1);
}
```
Kurva *cubic-bezier* kustom ini dirancang untuk memberikan rasa sentuhan mekanik yang responsif di awal dan perlambatan yang halus di akhir (*friction stop*).

### 6.2 Keyframe Masuk (`rise`)
```css
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```
Diterapkan dengan jeda bertingkat (*staggered animation*):
- Logo Mark: `0ms`
- Wordmark: `80ms`
- Hero Title: `160ms`
- Subtitle: `240ms`

### 6.3 Aksesibilitas Gerak (Reduced Motion)
Seluruh animasi dinonaktifkan secara otomatis bagi pengguna yang mengaktifkan preferensi OS ramah gerak:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## 7. 📁 Struktur File & Halaman

```text
LandingPage/
├── DESIGN.md              # Dokumentasi lengkap Design System (file ini)
├── index.html             # Beranda utama (Direktori 7 Kategori Sevnsoul)
├── ai.html                # Halaman produk: Artificial Intelligence
├── business.html          # Halaman produk: Business & Startups
├── financial.html         # Halaman produk: Financial Systems & Tools
├── learning.html          # Halaman produk: Knowledge & Learning Systems
├── life.html              # Halaman produk: Life Operating Systems
├── media.html             # Halaman produk: Media, Content & Creator Assets
├── utilities.html         # Halaman produk: Tools & Developer Utilities
├── simple_form.html       # Implementasi contoh formulir & elemen interaktif
├── inject_overlay.js      # Generator & script modal unlock akses produk
├── inject_logic.js        # Script utilitas injeksi logika interaksi
├── vite.config.js         # Konfigurasi bundler Vite
└── package.json           # Dependensi & runner skrip
```

---

## 8. 🛠️ Panduan Pengembang (Quick Reference Snippet)

Saat menambahkan kartu atau halaman baru, gunakan template token di bawah ini:

```html
<style>
  :root {
    --bg: #0a0a0a;
    --bg-soft: #0d0d0d;
    --surface: #161616;
    --surface-2: #1e1e1e;
    --surface-3: #262626;
    --border: rgba(255,255,255,0.07);
    --border-strong: rgba(255,255,255,0.14);
    --border-focus: rgba(255,255,255,0.30);
    --text: #f4f4f2;
    --text-dim: rgba(244,244,242,0.58);
    --text-faint: rgba(244,244,242,0.34);
    --shadow-dark: rgba(0,0,0,0.55);
    --shadow-light: rgba(255,255,255,0.035);
    --radius: 20px;
    --ease: cubic-bezier(.22,1,.36,1);
    --max: 1180px;
  }
</style>
```
