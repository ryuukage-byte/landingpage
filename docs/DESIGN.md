# DESIGN.md — SevnSoul design system v0.4

Gaya visual mengikuti situs utama **Sevnsoul — Ideas, Built** ([ryuukage-byte/landingpage](https://github.com/ryuukage-byte/landingpage), `sevnsoul-theme.css`). Token ada di `:root` pada `playground/index.html`. Bila ada perbedaan, file ini yang menjadi acuan dan kode yang disesuaikan.

## 1. Prinsip

1. **Dark minimalist, bersih.** Hitam pekat, abu arang, border putih transparan. Tanpa warna aksen. Kedalaman hanya dari gradien permukaan yang sangat halus, ambient glow di atas layar, dan scanline tipis.
2. **Dua bahasa visual, satu panggung.** UI halus dan modern (radius besar, font geometris). Karakter dan ikon tetap pixel art jujur (skala bilangan bulat, `image-rendering: pixelated`). Ruangan datar 2D (dinding + lantai), tanpa perspektif, supaya tidak bersaing.
3. **Teks lebih penting dari gerak.** Animasi menemani, bukan menahan.
4. **Satu tindakan per layar.** Ketik, atau pilih satu bubble.

## 2. Warna

### 2.1 UI (dari `sevnsoul-theme.css`)

| Token | Nilai | Pakai untuk |
|---|---|---|
| `--bg` | `#080808` | Latar halaman, ditambah dua radial glow (atas tengah 4,5%, kanan bawah 1,8%) |
| `--bg-soft` | `#0b0b0b` | Isi kolom pencarian saat fokus |
| `--surface` / `-2` / `-3` | `#111` / `#171717` / `#1e1e1e` | Permukaan bertingkat |
| `--text` | `#f4f4f2` | Teks utama, tombol primer (isi) |
| `--text-dim` | `rgba(244,244,242,.58)` | Deskripsi, label bubble, ikon alat |
| `--text-faint` | `rgba(244,244,242,.34)` | Meta header/footer, placeholder, label "Atau mungkin" |
| `--border` | `rgba(255,255,255,.075)` | Garis bawaan kartu, field, pemisah |
| `--border-strong` | `rgba(255,255,255,.145)` | Bubble, balon bicara, banner, hover |
| `--border-focus` | `rgba(255,255,255,.28)` | Field saat fokus, cincin `:focus-visible` |
| `--glass` | `rgba(14,14,14,.72)` + `blur(6px)` | Latar bubble saran |

Kartu (banner, balon bicara) memakai `linear-gradient(145deg, #141414, #0e0e0e)` plus bayangan `0 18px 40px rgba(0,0,0,.35)` dan highlight `inset 0 1px 0 rgba(255,255,255,.025)`.

### 2.2 Karakter (khusus sprite, jangan dipakai di UI)

| Nama | Hex | Bagian |
|---|---|---|
| Outline | `#0A0A0A` | Garis luar |
| Hair / Hoodie | `#1C1C1C` / `#1F1F1F` | Rambut, badan |
| Highlight | `#2C2C2C`–`#303030` | Tepi kena cahaya |
| Pants | `#2B2B2B` | Celana |
| Skin | `#F3DDD2` | Wajah, tangan |
| Blush | `#E8A99F` | Pipi |
| White | `#F5F5F5` | Logo, sepatu, kilau mata |
| Light / Mid | `#B4B4B4` / `#808080` | Sol, efek |

### 2.3 Kontras

| Pasangan | Rasio (≈) | Status |
|---|---|---|
| `--text` / `--bg` | 18,2:1 | AAA |
| `--text-dim` / `--bg` | 6,3:1 | AA (teks deskripsi, label bubble) |
| `--text-faint` / `--bg` | 2,8:1 | **Hanya meta dekoratif** (kode header, footer). Jangan untuk informasi penting |
| `--border-strong` / `--bg` | 1,4:1 | Batas komponen interaktif dibantu teks/ikon `--text-dim` di dalamnya |

Catatan: palet referensi sengaja redup. Placeholder memakai `--text-faint`, jadi label input tersembunyi tetap wajib untuk pembaca layar.

## 3. Tipografi

Tiga font Google: **Space Grotesk**, **Inter**, **JetBrains Mono**.

| Peran | Font | Ukuran / line-height | Berat | Tracking |
|---|---|---|---|---|
| Judul banner | Space Grotesk | 21 / 1.1 | 500 | −.03em |
| Balon bicara | Space Grotesk | 15 / 1.5 | 400 | −.01em |
| Isi, deskripsi | Inter | 13,5–15 / 1.6 | 300–400 | normal |
| Input | Inter | 16 (wajib ≥ 16 untuk iOS) | 400 | normal |
| Tombol CTA | Inter | 14 | 600 | normal |
| Wordmark | JetBrains Mono | 10 | 500 | .35em |
| Label bubble | JetBrains Mono | 10,5, UPPERCASE | 500 | .12em (mobile .06em) |
| Meta header/footer, badge | JetBrains Mono | 8–9, UPPERCASE | 400 | .12em |

## 4. Radius, spasi, layout

- Radius: **20** (banner), **16** (balon bicara), **14** (ikon banner), **12** (tombol CTA), **999** (bubble, kolom pencarian, badge, tombol bulat).
- Header: grid `1fr auto 1fr`, padding 24 (mobile 18). Kiri `SVN / RECEPTION`, tengah logo + `SEVNSOUL`, kanan tombol lab dan toggle gerak (lingkaran 34 px). Di ≤ 760 px kode kiri dan wordmark disembunyikan.
- Footer: `SEVNSOUL · {tahun}` kiri, `IDEAS, BUILT.` kanan.
- UI melayang dijaga ≥ 68 px dari atas (`TOP_SAFE` di `landing.js`) supaya tidak menimpa header.

## 5. Komponen

### Ruangan (latar)
- Canvas pixel pada skala karakter (×3 < 560 px, ×4, ×5 ≥ 1500 px), digambar sekali per resize.
- **Datar 2D, dilihat lurus dari depan** (v0.5, tanpa perspektif): langit-langit di bawah header (isi 3% + garis 14%, baris dunia `ceil = ⌈68 / skala⌉`), dinding penuh lebar (1,2%), plint 4 px di atas lantai (3%), garis lantai 1 px tepat di bawah sepatu (14%), bidang lantai (2,2%), dan bayangan kontak di bawah kaki (3,5%). Satu warna `#f4f4f2`.
- Di atas semuanya: lapisan scanline `body::before` (opacity .11, `soft-light`).

### Balon bicara
- Radius 16, border `--border-strong`, gradien kartu. Ekor: persegi 10 px diputar 45° dengan border kanan-bawah.
- Efek mengetik 34 ms/karakter dengan kursor garis 1 px. Lebar dikunci dulu supaya balon tidak melebar.

### Bubble saran (orbit)
- Pil 999, tinggi ≥ 44, latar `--glass` + blur. Ikon pixel 24 di dalam lingkaran 32 px (`#0c0c0c`, border `--border`). Di mobile lingkaran dihilangkan supaya bubble lebih ramping.
- Penempatan dan relaksasi: lihat CHARACTER.md §6 (elips sekitar kepala, maks. 40 putaran).
- Muncul: `opacity` + `translate 0 8px → 0` dengan `--ease`, jeda 90 ms per bubble. Hover: teks ke `--text`, border ke 30%.
- **Dock** (saat hasil tampil): bubble yang sama meluncur (`transform` 500 ms `--ease`, kelas `.glide`) ke baris-baris rata tengah 16 px di bawah kolom pencarian, jarak 8 px, lebar maks. 100vw − 32. Desktop 1 baris; HP 375 px 3 baris (2-2-1). Kembali ke orbit saat "tidak ketemu".
- Bubble hasil aktif (`.is-current`, `aria-current`): teks `--text`, border `--border-focus`, latar `rgba(30,30,30,.8)`.

### Banner mode daftar
- Kartu yang sama, lebar min(400 px, 100vw − 36). Judul "Semua di Sevnsoul" + badge `{n} ITEM` (tanpa titik).
- Badan: daftar baris (ikon 36 px radius 11, judul Space Grotesk 15, deskripsi Inter 12,5 satu baris dengan elipsis, panah `arrowRight`/`external` `--text-faint`). Pemisah `--border`; hover latar 3% putih dan panah bergeser 2 px.
- ≤ 560 px: padding 18, judul 18, ikon 32, deskripsi disembunyikan, supaya banner muat di antara header dan kepala karakter.

### Kolom pencarian
- Pil 999, tinggi 52, latar `rgba(10,10,10,.8)`, border `--border`. Hover `--border-strong`; fokus `--border-focus` + ring `0 0 0 4px rgba(255,255,255,.025)`.
- Tombol kirim: lingkaran 38 px isi `--text`, ikon gelap; hover bergeser 2 px ke kanan.

### Tali tarik
- Garis 1 px (gradien putih 20% → 55%) yang turun 44 px dari garis langit-langit dalam 420 ms `--ease`, dengan cincin 7 px (border putih 60%, isi `#111`) di ujungnya yang muncul 220 ms kemudian.
- Muncul di titik banner yang tersembunyi, naik lagi saat karakter meraihnya di puncak lompatan. Disembunyikan di reduced motion.

### Banner (kartu produk)
- Pola `.product-card` dari situs utama: radius 20, gradien kartu + radial glow atas, border `--border-strong`.
- Kepala: kotak ikon 46 px radius 14, judul Space Grotesk, badge status (`ACTIVE` dengan titik putih) bila `status` diisi di `content.js`.
- **Ringkas** saat turun/dipegang (ikon + judul, padding 14). **Penuh** setelah dilepas (padding 22, deskripsi, tombol CTA putih radius 12, "Atau mungkin" dipisah garis `--border`).
- Dua tali 1 px dengan gradien transparan → 24% putih.

## 6. Motion UI

| Token | Nilai | Pakai |
|---|---|---|
| `--dur-1` | 250 ms | Hover, warna |
| `--dur-2` | 300 ms | Muncul/hilang kecil |
| `--dur-3` | 500 ms | Banner ke posisi akhir, input muncul |
| `--ease` | `cubic-bezier(.22,1,.36,1)` | Semua transisi (kurva situs utama) |
| `rise` | `translateY(8px) → 0` + fade | Isi banner saat mengembang |

Saat reduced motion, semua token durasi menjadi `0ms` (`[data-motion="reduced"]`). Motion karakter diatur terpisah di CHARACTER.md.

## 6b. Performa & mobile

| Aturan | Kenapa |
|---|---|
| Ruangan digambar sekali per layout; tiap frame hanya **kotak maskot** (lama + baru) yang dipulihkan dari gambar ruangan lalu digambar ulang, dan **dilewati** bila pose, posisi, dan kedip tidak berubah | Di HP 375 px: dari ±305 ribu piksel per frame menjadi ±5 ribu saat idle; maskot idle hanya digambar ulang ±4×/dtk |
| `will-change` hanya di `#banner` (satu-satunya yang bergerak tiap frame) | Dari 9 layer GPU permanen menjadi 1 |
| Tanpa `backdrop-filter`; `--glass` dibuat lebih pekat (88%) | Blur di atas canvas yang berubah mahal di GPU HP |
| Scanline tanpa `mix-blend-mode`, dan **mati** di ≤ 760 px | Blend mode memaksa komposit ulang layar penuh setiap frame |
| Font Google dimuat tanpa memblokir render (`preload` → `stylesheet`), hanya bobot yang dipakai (Space Grotesk 400/500, Inter 400/600, JetBrains Mono 400/500). Intro menunggu font maks. 1,2 dtk | Jaringan lambat tidak menunda adegan |
| Logo 96 px (3,7 KB, dari 34 KB) + favicon 32 px | Logo tampil 26 px; 96 px cukup untuk layar 3× |
| Canvas ruangan 160 px lebih tinggi dari viewport; resize hanya membangun ulang adegan bila lebar berubah atau tinggi berubah ≥ 120 px saat tidak mengetik | Bilah URL HP yang naik-turun tidak membuat karakter melompat posisi |
| `interactive-widget=resizes-visual` + `visualViewport`: saat keyboard terbuka, seluruh adegan digeser naik secukupnya agar kolom pencarian tetap terlihat | Perilaku sama di iOS dan Android |
| Sentuh: tombol header 44 px di `pointer: coarse`, `touch-action: manipulation`, tanpa tap highlight, `overscroll-behavior: none`; input tanpa autocorrect/kapital | Target sentuh WCAG, tanpa jeda double-tap, tanpa tarik-untuk-refresh, kata kunci tidak diubah otomatis |

## 7. Ikonografi

Ikon pixel 12×12, tampil **hanya** 24/36/48 px (kelipatan bulat). Jangan mengecilkan ke 18 px walau UI lain halus, karena pixel menjadi tidak rata. Logo brand memakai `brand-mark.png` dari situs utama. Detail di [ICONS.md](ICONS.md).

## 8. Do / Don't

| Do | Don't |
|---|---|
| Border putih transparan | Border abu solid atau putih 2 px |
| Satu tombol primer putih per banner | Dua CTA bersaing |
| Uppercase mono untuk label kecil | Uppercase untuk kalimat panjang |
| Ikon pixel di kelipatan 12 | Ikon pixel diskalakan pecahan |
| Glow ambient sangat halus | Glow terang, warna neon |
