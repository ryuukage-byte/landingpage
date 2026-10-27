# CONTENT.md — Copy dan konfigurasi tujuan v0.2

Data hidup ada di `playground/content.js` (nanti `src/content.ts`). File ini menjelaskan aturan dan skemanya.

## 1. Suara dan nada

- Santai-sopan, sapaan **"kamu"**. Hindari "Anda" dan "Kami" berhuruf besar.
- Kalimat pendek. Satu ide per kalimat.
- Tombol memakai kata kerja dan huruf kalimat: "Jelajahi SevnQuest", "Lihat layanan", "Hubungi kami".
- Istilah teknis tetap dalam bahasa aslinya: motion graphics, JLPT, kanji.

Dialog karakter (balon bicara, juga dibacakan lewat `aria-live`). Sumbernya `LINES` di `playground/landing.js`.

| Momen | Teks |
|---|---|
| Sapaan | Selamat datang. Apa yang kamu cari di sini? |
| Mencari (7 variasi, acak tanpa mengulang yang terakhir) | Sebentar, aku carikan… · Oke, aku cek dulu ya… · Hmm, coba kulihat dulu… · Tunggu sebentar, lagi kucari… · Siap, aku telusuri dulu… · Sebentar ya, aku intip dulu… · Aku cari di sekitar sini dulu… |
| Ketemu | Ketemu! |
| Daftar | Ini semua yang ada di sini. |
| Tidak ketemu | Hmm, belum ketemu "{kueri}". Mungkin salah satu ini? |

Teks UI lain:

| Tempat | Teks |
|---|---|
| Label input (tersembunyi) | Apa yang kamu cari di sini? |
| Placeholder | Ketik, lalu tekan Enter |
| Alternatif di banner | Atau mungkin: |
| Toggle gerak (label pembaca layar) | Kurangi gerak / Gerak penuh |

Balon bicara maksimal ±50 karakter supaya muat dua baris di layar 360 px.

## 2. Skema tujuan

```ts
type Destination = {
  id: string;            // stabil, dipakai analytics
  icon: IconName;        // lihat ICONS.md
  chip: string | null;   // label bubble saran (orbit); null = tidak tampil
  title: string;         // judul banner
  desc: string;          // satu kalimat, ≤ 70 karakter
  cta: string;           // label tombol
  url: string;
  external: boolean;     // true → target=_blank rel=noopener + ikon external
  tbd?: boolean;         // URL belum ada → badge "Segera", tombol nonaktif "Segera hadir", tidak ditautkan di Daftar
  category?: string;     // kategori di situs utama, mis. "Financial"
  status?: string;       // badge di banner, mis. "Active"
  keywords: string[];    // huruf kecil; frasa boleh
};
```

Sumber data produk: halaman kategori di situs utama ([ryuukage-byte/landingpage](https://github.com/ryuukage-byte/landingpage), array `products` di `learning.html`, `financial.html`, dst.). Per Oktober 2026 hanya dua kategori yang berisi produk; lima lainnya (Life, Business, Utilities, Media, AI) masih kosong.

| id | chip | title | kategori | url | status |
|---|---|---|---|---|---|
| `sevnquest` | Belajar Jepang | SevnQuest | EdTech / Learning | `https://sevnquest.sevnsoul.site/` | Active |
| `sevntrack` | Catat keuangan | The Sevn Track | Financial | `https://sevntracker.sevnsoul.site/` | Active |
| `video` | — (via pencarian/Daftar) | Layanan Video | — | belum ada | Segera |
| `collab` | Kolaborasi | Mari berkolaborasi | — | belum ada | Segera |
| `about` | Tentang | Tentang SevnSoul | — | belum ada | Segera |

Menambah produk baru dari situs utama: salin `name` → `title`, terjemahkan `description` → `desc`, `link` → `url` (`external: true`), `status` apa adanya, pilih ikon pixel, lalu tulis kata kunci.

## 3. Aturan pencarian

1. **Normalisasi**: huruf kecil, buang diakritik, karakter non-alfanumerik menjadi spasi.
2. **Skor per kata kunci** (diambil yang tertinggi per tujuan):

| Skor | Kondisi | Contoh |
|---|---|---|
| 100 | Kueri sama persis | `jlpt` → jlpt |
| 80 | Kueri memuat kata kunci utuh | `jasa video murah` → jasa video |
| 60 | Kata kunci memuat kueri (≥ 3 huruf) | `motion` → motion graphics |
| 40 | Typo: Levenshtein ≤ 1 (kata ≥ 4 huruf) atau ≤ 2 (≥ 7 huruf) | `kanjii` → kanji |

3. Hasil: tujuan dengan skor tertinggi menjadi `best`, sisanya (skor > 0) menjadi `alternatives`.
4. **Kata daftar** (`LIST_WORDS`: daftar, semua, semuanya, list, all, menu, katalog, lihat semua) dicek lebih dulu dan harus sama persis setelah normalisasi. Hasilnya `{ all: true, best: null, score: 100 }`, dan banner menampilkan semua tujuan. Bubble "Daftar" disisipkan di tengah `SUGGESTIONS`, jadi berada di puncak orbit.
5. Lama animasi mencari ditentukan `searchDuration(result)` (1–3 dtk), lihat CHARACTER.md §6.

Kasus uji (harus lolos):

| Kueri | Hasil |
|---|---|
| `JLPT`, `belajar jepang` | sevnquest (100) |
| `Kanjii` | sevnquest (40) |
| `motion grafis` | video (80) |
| `kerjasama`, `kerja sama` | collab (100) |
| `sevnsoul` | about (100) |
| `keuangan`, `catat pengeluaran`, `budgeting` | sevntrack (100) |
| `pizza` | tidak ada → empty state |
| `Daftar`, `semua`, `lihat semua` | daftar semua tujuan (`all: true`) |
| `daftr` | tidak ada (kata daftar tidak toleran typo) |
