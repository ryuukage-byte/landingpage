# Design System & Architecture: Sevnsoul

Dokumen ini menjelaskan sistem desain, arsitektur, dan elemen antarmuka (UI) dari website **Sevnsoul — Ideas, Built**.

## 🎨 Tema dan Visi
Sevnsoul menggunakan pendekatan desain **Dark Mode-first** dengan nuansa minimalis, modern, dan futuristik. UI memanfaatkan efek *glassmorphism* yang halus, ambient tekstur (*radial glow*), dan tipografi yang solid untuk menonjolkan hierarki konten.

## 🌈 Palet Warna (Color Palette)
Warna menggunakan variabel CSS (`:root`) untuk menjaga konsistensi pada tema gelap.

| Penggunaan | Variabel CSS | Kode Warna | Deskripsi |
| --- | --- | --- | --- |
| **Background** | `--bg` | `#0a0a0a` | Warna latar belakang utama (hitam pekat) |
| **Background Soft** | `--bg-soft` | `#0d0d0d` | Latar belakang sedikit lebih terang |
| **Surface 1** | `--surface` | `#161616` | Permukaan elemen / kartu tingkat 1 |
| **Surface 2** | `--surface-2` | `#1e1e1e` | Permukaan elemen / kartu tingkat 2 |
| **Surface 3** | `--surface-3` | `#262626` | Permukaan elemen / kartu tingkat 3 (Featured) |
| **Border** | `--border` | `rgba(255,255,255,0.07)` | Garis batas tipis transparan |
| **Border Strong**| `--border-strong`| `rgba(255,255,255,0.14)` | Garis batas yang lebih tebal/hover |
| **Text Primary** | `--text` | `#f4f4f2` | Teks utama (putih pudar) |
| **Text Dim** | `--text-dim` | `rgba(244,244,242,0.58)`| Teks sekunder/sub-heading |
| **Text Faint** | `--text-faint` | `rgba(244,244,242,0.34)`| Teks penjelas / detail kecil |

## ✍️ Tipografi (Typography)
Kombinasi tiga jenis font digunakan untuk memberikan kontras yang baik antara heading, teks paragraf, dan elemen aksen/teknis.

1. **Space Grotesk** (`wght@300;400;500;600;700`)
   - Digunakan untuk: **Headings** (H1, Judul Kartu) dan teks yang membutuhkan penekanan karakter modern.
2. **Inter** (`wght@300;400;500;600`)
   - Digunakan untuk: **Body Copy** (Paragraf, deskripsi). Dipilih karena tingkat keterbacaan (*readability*) yang sangat baik.
3. **JetBrains Mono** (`wght@400;500`)
   - Digunakan untuk: **Elemen Aksen** (Wordmark logo, meta-teks, teks footer kecil).

## 🧩 Elemen UI & UX (UI/UX Elements)

- **Ambient Texture (Latar Belakang):** Menggunakan gabungan 3 `radial-gradient` yang diatur posisinya di `:root` pseudo-element `::before` untuk memberikan efek pendaran cahaya (glow) yang halus asimetris.
- **Card Design (`.cat-card`):**
  - Menggunakan `linear-gradient` untuk background permukaan kartu.
  - Memiliki sudut melengkung yang besar (`--radius: 20px`).
  - Efek bayangan ganda (*dual drop-shadow*) menggunakan `--shadow-dark` dan `--shadow-light` agar kartu tampak menonjol (kedalaman / depth 3D yang halus).
- **Interaksi Hover (Glass Sheen):** Saat kursor (hover) atau fokus keyboard berada di atas kartu, akan muncul lapisan gradien putih transparan dengan efek `backdrop-filter: blur(6px)` yang memantul layaknya kaca (glass sheen). Kartu juga sedikit terangkat (translasi Y ke atas).
- **Animasi:** Terdapat animasi `rise` kustom. Elemen akan memudar (fade-in) sambil bergeser ke atas secara perlahan saat halaman dimuat menggunakan kurva transisi yang halus (`--ease: cubic-bezier(.22,1,.36,1)`).
- **Featured Card:** Kategori khusus (seperti AI) dibuat menonjol (*featured*) dengan lebar penuh pada grid dan gradien latar belakang yang sedikit lebih terang (`--surface-3`).

## 📱 Responsivitas (Responsive Layout)
Struktur diatur menggunakan **CSS Grid** (untuk deretan kartu) dan **Flexbox** (untuk header/footer). Responsivitas disesuaikan secara dinamis:
- **Desktop (`> 860px`):** Menampilkan grid 3 kolom. Maksimal lebar kontainer halaman dibatasi `1180px`.
- **Tablet (`< 860px`):** Susunan grid beralih menjadi 2 kolom.
- **Mobile (`< 560px`):** Susunan grid beralih menjadi 1 kolom vertikal. Padding atas dan spasi antar elemen dikurangi untuk efisiensi ruang layar gawai.

## 🏗️ Struktur Proyek & Tech Stack
- **Tech Stack:** Proyek ini *Native* HTML5 dan CSS3 (Vanila) tanpa menggunakan framework utility (seperti Tailwind/Bootstrap). Pengembangan dilayani (*served* dan *built*) menggunakan **Vite** (terlihat pada skrip `package.json`).
- **Pages (Halaman-halaman):**
  - `index.html` — Halaman Pintu Masuk / Landing.
  - Serta halaman spesifik kategori: `financial.html`, `life.html`, `business.html`, `learning.html`, `utilities.html`, `ai.html`, `media.html`.
  - Terdapat form pendukung di `simple_form.html`.
