# SevnSoul Landing Page — PRD v0.3

> Status: draf revisi dari v0.1. Konten dan URL masih bisa berubah sampai poin di §13 dikonfirmasi.
> Dokumen terkait: [DESIGN.md](DESIGN.md) · [CHARACTER.md](CHARACTER.md) · [ICONS.md](ICONS.md) · [CONTENT.md](CONTENT.md)

## 0. Perubahan

### v0.3: konsep satu adegan (arahan pemilik)
- Pembukaan bersih: hanya ruangan + karakter. Sapaan lewat balon bicara; input muncul setelahnya di bawah karakter.
- Saran berupa bubble yang **mengorbit** karakter (kiri, kiri atas, atas, kanan atas, kanan), bukan baris chip.
- Saat mengetik karakter **menunggu** (animasi mengetik dihapus dari alur).
- Setelah Enter: animasi **mencari** 1–3 dtk → **melompat → menarik banner turun dari atas** (banner tidak terlihat sebelum ditarik).
- Lab animasi tidak ditampilkan di situs live; animasi dicek di SevnSoul Character Studio (proyek Remotion terpisah).

### v0.2: perbaikan dari v0.1

| # | Masalah di v0.1 | Perbaikan di v0.2 |
|---|---|---|
| 1 | Gerakan wajib di PRD (membungkuk, mengetik, hasil ditemukan, tarik banner) **tidak ada** di sprite sheet; sebaliknya sheet punya run/crouch/sad yang tak disebut PRD. | Daftar gerakan disatukan di [CHARACTER.md §5](CHARACTER.md#5-daftar-animasi), dibagi **Wajib MVP** dan **Cadangan**. |
| 2 | "Logo dada kanan" ambigu. Di sheet, logo ada di kanan **penonton** (= dada kiri karakter). | Didefinisikan dari sudut pandang penonton: logo di sisi kanan layar saat menghadap kanan. Lihat CHARACTER.md §3. |
| 3 | Ukuran sprite "32×32 atau 48×48" belum diputuskan. Frame di sheet tidak konsisten skalanya (frame lompat lebih kecil). | Diputuskan **48×48**, anchor kaki (24,45), skala tampilan bilangan bulat (×3/×4). |
| 4 | Palet tanpa warna kulit/blush dan tanpa token border yang lolos kontras. `#303030` di atas `#090909` ≈ 1,5:1 (gagal WCAG 1.4.11 untuk batas input). | Tambah `--border-strong #6A6A6A` (3,7:1 di bg, 3,4:1 di surface) untuk input/fokus; palet karakter dipisah dari palet UI. Lihat DESIGN.md §2. |
| 5 | Alur tidak punya keadaan **tidak ditemukan**. | Ditambah §4.2: pesan kosong + chip saran + reaksi maskot "sedih/bingung". |
| 6 | "Tiga saran utama" tapi tujuan ada empat; tidak jelas mana yang jadi chip. | Chip: Belajar Jepang, Jasa video, Kolaborasi. "Tentang" lewat pencarian + footer. |
| 7 | Nada bahasa campur: sapaan "kamu" vs tombol "Hubungi Kami". | Satu register santai-sopan ("kamu"). CTA pakai huruf kalimat. Lihat CONTENT.md §1. |
| 8 | Banner menunggu animasi; kalau animasi macet, hasil tidak muncul. | Banner muncul saat frame "tarik" **atau** paling lambat 2,2 detik. Dengan *reduced motion*, langsung muncul. |
| 9 | "CSS keyframes **atau** Framer Motion" belum diputuskan. | CSS untuk transisi UI; canvas + state machine sendiri untuk sprite (tanpa dependensi). |
| 10 | Kriteria penerimaan sulit diukur ("tanpa instruksi panjang"). | Ditulis ulang agar bisa diuji; lihat §11. |
| 11 | Tidak ada SEO/meta, analytics minimal, budget performa. | Ditambah §9.1 dan §9.2. |

## 1. Ringkasan produk

SevnSoul adalah landing page direktori minimalis. Pengunjung menemukan proyek, layanan, dan kanal kontak lewat pencarian kata kunci. Maskot pixel berperan sebagai resepsionis visual: menyambut, bereaksi, lalu "menarik" banner tujuan. Versi awal tidak memakai AI agent atau percakapan generatif.

## 2. Tujuan

1. Pengunjung sampai ke tujuan yang tepat dalam ≤ 2 interaksi (ketik/pilih chip → klik tombol).
2. Identitas SevnSoul terasa lewat satu karakter yang konsisten.
3. Rapi dan nyaman dari 360 px sampai desktop.
4. Ringan dan mudah dirawat, tanpa layanan AI berbayar maupun backend.

## 3. Pengguna dan kebutuhan

| Pengguna | Yang dicari | Tujuan |
|---|---|---|
| Pelajar bahasa Jepang | SevnQuest, JLPT, kanji | `sevnquest` |
| Calon klien | Jasa video, motion graphics | `video` |
| Calon kolaborator | Kontak, kerja sama | `collab` |
| Pengunjung umum | Profil, proyek lain | `about` |

## 4. Alur pengguna

Seluruh halaman adalah **satu adegan**: sebuah ruangan, satu karakter, tanpa header atau section lain.

### 4.1 Pembukaan (≈ 4 dtk, tanpa interaksi)
| t | Yang terjadi |
|---|---|
| 0 | Layar bersih. Ruangan (garis satu warna, transparan) memudar masuk; karakter berdiri di tengah lantai. |
| 0,5 dtk | Karakter **membungkuk** (ojigi). |
| 0,8 dtk | Balon bicara mengetik: "Selamat datang. Apa yang kamu cari di sini?" |
| +0,45 dtk | Kolom pencarian muncul di **bawah** karakter (fade + naik 8 px). Wordmark dan tombol gerak muncul di sudut. |
| +1,1 dtk | Balon bicara menghilang; **bubble saran** muncul satu per satu (jeda 90 ms) **mengelilingi** karakter. |

### 4.2 Mengetik
- Karakter **diam menunggu** (hanya idle napas + kedip). Tidak ada animasi mengetik.
- Bubble saran tetap di tempatnya.

### 4.2b Diam (idle)
- Kalau pengunjung tidak menyentuh apa pun selama **7 detik** (hanya melihat layar), karakter melakukan satu gerakan kecil acak: melihat sekeliling, menguap sambil peregangan, melambai, atau jongkok. Gerakan berikutnya menyusul 7 detik setelah yang sebelumnya selesai, dan tidak pernah sama dua kali berturut-turut.
- Gerakan apa pun dari pengunjung (mouse, sentuh, keyboard, scroll) mengulang hitungan. Idle tidak terjadi saat karakter sedang mencari, melompat, atau berjalan.

### 4.3 Mencari (setelah Enter atau klik bubble)
1. Bubble saran **meluncur ke bawah** dan berbaris di bawah kolom pencarian ("dock"), jadi tujuan lain tetap bisa dipilih sekali ketuk selama hasil tampil. Bubble untuk hasil yang sedang tampil ditandai (`aria-current`). Kalau ada banner sebelumnya, banner ditarik kembali ke atas; karakter berjalan ke tengah.
2. Balon bicara: "Sebentar, aku carikan…". Karakter memutar **mencari**: tangan di dagu, mata melirik kiri-kanan, tiga titik di atas kepala. Durasinya **1–3 dtk** (`searchDuration`).

### 4.4 Ketemu
1. Balon: "Ketemu!". Banner **belum terlihat**: ia menunggu di atas langit-langit, di **posisi yang berbeda setiap kali** (kiri atau kanan tengah, bergantian). Satu-satunya petunjuk: **tali tarik** kecil yang turun dari langit-langit di titik itu.
1b. Karakter menoleh ke tali, lalu **berjalan** (jarak dekat) atau **berlari** (jarak ≥ 45 px dunia) ke bawahnya.
2. Karakter **melompat setinggi langit-langit** (garis tepat di bawah header). Tingginya menyesuaikan layar, jadi di HP maupun desktop puncaknya selalu menyentuh langit-langit.
3. Di puncak (frame `grab`) karakter meraih banner, lalu jatuh sambil **menyeretnya keluar dari langit-langit**: banner dan talinya terpotong di garis langit-langit, jadi terlihat muncul dari sana. Saat mendarat ada satu tarikan lagi.
4. Karakter melepas; banner bergeser ke tengah dan **mengembang** (deskripsi, tombol, "Atau mungkin:").
5. Tombol membawa ke URL tujuan; link eksternal di tab baru dengan `rel="noopener"`.

### 4.4b Daftar (lihat semua)
1. Bubble **Daftar** (ikon grid) selalu ada di orbit, di posisi paling atas. Mengetik `daftar`, `semua`, `list`, `menu`, `katalog`, atau `lihat semua` memicu hal yang sama.
2. Urutannya sama dengan §4.4: mencari → lompat → banner ditarik turun. Balon: "Ini semua yang ada di sini."
3. Banner berisi **semua tujuan** (ikon, judul, deskripsi satu baris, panah). Tiap baris adalah link langsung ke URL tujuannya. Di HP deskripsi disembunyikan supaya daftar muat di atas kepala karakter.

### 4.5 Tidak ketemu
- Karakter **sedih**. Balon: "Hmm, belum ketemu "{kueri}". Mungkin salah satu ini?"
- Bubble saran meluncur kembali dari dock ke orbit di sekeliling karakter dan menghindari balon bicara.

### 4.6 Kueri kosong / pencarian baru
- Enter dengan kueri kosong tidak memicu apa pun; fokus tetap di input.
- Pencarian baru saat adegan masih berjalan membatalkan urutan lama dengan aman (token pembatalan).

## 5. Konten awal

Sumber kebenaran ada di [CONTENT.md](CONTENT.md) (skema + data). Ringkasnya:

| ID | Kata kunci (contoh) | Judul | Aksi | Chip |
|---|---|---|---|---|
| `sevnquest` | sevnquest, belajar jepang, jlpt, kanji | SevnQuest | Jelajahi SevnQuest | Belajar Jepang |
| `video` | jasa video, editing, motion graphics | Layanan Video | Lihat layanan | Jasa video |
| `collab` | kolaborasi, kerja sama, partnership | Mari berkolaborasi | Hubungi kami | Kolaborasi |
| `about` | tentang, profil, sevnsoul | Tentang SevnSoul | Kenali SevnSoul | Tentang |

## 6. Struktur halaman

Satu layar penuh (`100vh`), tanpa scroll. Lapisan dari belakang ke depan:

1. **Ruangan**: canvas pixel datar 2D (tanpa perspektif), satu warna `#f4f4f2` transparan: dinding, plint, garis lantai tepat di bawah sepatu, bidang lantai, bayangan kontak. Detail di DESIGN.md §5.
2. **Karakter**: digambar di canvas yang sama, berdiri di 60% tinggi layar.
3. **Balon bicara**: di atas kepala, border 2 px, ekor pixel. Teks juga dikirim ke region `aria-live` tersembunyi.
4. **Bubble saran**: mengorbit karakter dari kiri (180°) melewati atas sampai kanan (0°), jumlah sesuai konten (saat ini 4).
5. **Banner**: tergantung dua tali dari atas layar.
6. **Kolom pencarian**: di bawah kaki karakter.
7. **Sudut**: wordmark (kiri bawah); tautan lab dan tombol "Kurangi gerak" (kanan bawah). Muncul bersama kolom pencarian.

Tidak ada tautan ke lab/studio di situs live. Animasi dan ikon dicek di SevnSoul Character Studio (`C:/project/sevnsoul-character-studio`: AnimationGallery, CharacterSheet).

## 7. Spesifikasi visual

Detail lengkap ada di [DESIGN.md](DESIGN.md) dan [CHARACTER.md](CHARACTER.md).

- Nuansa: malam tenang, monokrom, elegan, minimalis. Satu-satunya warna hangat adalah kulit/blush maskot.
- Karakter: pixel art 48×48, chibi (kepala ≈ 50% tinggi), tanpa topi, hoodie hitam dengan logo petir putih.
- Gerakan: [CHARACTER.md §5](CHARACTER.md#5-daftar-animasi). Prinsipnya: aksi pendek (≤ 1,2 dtk), tanpa glow, tanpa gerak yang mengganggu bacaan teks.

## 8. Responsif dan aksesibilitas

- Mobile-first. **Bubble tetap mengelilingi karakter di HP** (mengganti aturan v0.1). Pada < 560 px skala pixel ×3, bubble maks. 124 px dan boleh dua baris; algoritma orbit mendorong bubble yang bertabrakan (antarbubble, dengan karakter, atau dengan balon bicara) dan menjepitnya di dalam layar.
- Target sentuh ≥ 44×44 px (bubble, tombol).
- Input `type="search"`, `enterkeyhint="search"`, label tersembunyi "Apa yang kamu cari di sini?", form `role="search"`. Urutan Tab: bubble → input → banner → sudut.
- Hasil tidak pernah bergantung pada animasi: urutan bisa dibatalkan, dan mode reduced menampilkan banner langsung di posisi akhir.
- Fokus terlihat: outline 2 px `--focus`, offset 2 px.
- `prefers-reduced-motion: reduce` **dan** toggle manual → maskot hanya menampilkan pose kunci, tanpa perpindahan; transisi CSS 0 ms; banner langsung tampil.
- Kontras: teks ≥ 4,5:1; batas komponen interaktif ≥ 3:1 (lihat DESIGN.md §2.3).
- Canvas maskot `role="img"` dengan `aria-label`. Animasi tidak membawa informasi yang tidak ada di teks.

## 9. Implementasi

- **Frontend**: React + TypeScript (Vite). Prototipe vanilla ada di `playground/`.
- **UI motion**: CSS transition/keyframes dengan token durasi dari DESIGN.md.
- **Karakter**: `<canvas>` + `image-rendering: pixelated`; sprite sheet PNG + JSON (ekspor dari playground) **atau** renderer prosedural `sprite.js`.
- **Pencarian**: data lokal (`content.ts`), normalisasi huruf/diakritik, skor bertingkat + Levenshtein ≤ 1–2.
- **Routing**: tautan biasa. Tanpa backend di MVP.

### 9.1 Budget performa
- JS halaman ≤ 60 KB gzip (tanpa framework animasi). Sprite PNG ≤ 40 KB.
- LCP ≤ 2,0 dtk di 4G lambat. Font: 2 keluarga, `display=swap`.
- Loop animasi berhenti saat tab tersembunyi (`visibilitychange`).

### 9.2 Meta dan analytics (opsional, tanpa cookie)
- `<title>`, `meta description`, Open Graph image (maskot + wordmark), favicon petir 12×12.
- Event anonim: `search_submit {matched: bool, id}`, `chip_click {id}`, `cta_click {id}`.

## 10. Batasan MVP

- Tanpa chatbot, LLM, login, dashboard, CMS.
- Tanpa physics. Lompatan memakai lintasan parabola yang sudah dihitung.
- Satu pencarian menghasilkan satu hasil terbaik dan 0–2 alternatif.
- Seluruh tujuan dan URL ada di satu file konfigurasi.

## 11. Kriteria penerimaan

1. Di 360×640, karakter, input, dan semua bubble saran terlihat tanpa scroll dan tanpa saling menumpuk; tidak ada overflow horizontal.
2. Klik bubble menampilkan banner tujuan yang benar setelah urutan cari → lompat-tarik (≤ 6 dtk); banner tidak terlihat sebelum frame `grab`; dengan reduced motion ≤ 1,5 dtk tanpa perpindahan posisi.
3. "JLPT", "jlpt", "Belajar Jepang", dan "kanjii" (typo) → `sevnquest`. "kerjasama" dan "kerja sama" → `collab`.
4. Kueri tanpa hasil: karakter sedih, balon menjelaskan, dan bubble saran kembali mengorbit.
5. Banner berisi judul, deskripsi, dan tombol dengan URL dari konfigurasi.
6. Dengan reduced motion aktif, tidak ada elemen yang berpindah posisi, dan semua fungsi tetap jalan.
7. Seluruh alur bisa dilakukan hanya dengan keyboard (Tab, Enter, Space).
8. Lighthouse Accessibility ≥ 95.

## 12. Di luar cakupan (nanti)

Multi-bahasa, mode terang, pencarian sinonim berbasis data, beberapa karakter pembawa banner.

## 13. Perlu dikonfirmasi sebelum produksi

| Pertanyaan | Rekomendasi |
|---|---|
| URL final SevnQuest, layanan, kontak | — (masih placeholder di CONTENT.md, ditandai `tbd`) |
| Bahasa UI | Indonesia; istilah teknis tetap Inggris (motion graphics, JLPT) |
| Satu maskot atau beberapa pembawa banner | Satu maskot, banyak pose (lebih murah dirawat, identitas lebih kuat) |
| Banner inline atau lembar ditarik | **Diputuskan (v0.4):** tersembunyi di atas layar, baru muncul saat karakter melompat dan menariknya turun, lalu tergantung di tengah |
| Nama karakter | Belum ada (sheet: "Name: –") |
| Logo harus selalu di kanan layar saat sprite di-flip? | Tidak; ikuti flip (lihat CHARACTER.md §3) |
