# CHARACTER.md — Maskot SevnSoul v0.2

Implementasi acuan: `sprite.js` (renderer prosedural + state machine). Pratinjau semua animasi: SevnSoul Character Studio (`C:/project/sevnsoul-character-studio`, komposisi AnimationGallery dan CharacterSheet). Situs live tidak menampilkan lab.

## 1. Profil

| | |
|---|---|
| Nama | Belum ditentukan (sheet: "–") |
| Peran | Resepsionis visual: menyambut, mendengarkan (mengetik), bereaksi, menyerahkan banner |
| Sifat gerak | Tenang, sopan, sedikit malu; bereaksi kecil, tidak heboh |
| Gaya | Pixel art sederhana, monokrom, chibi (kepala ≈ 50% tinggi) |
| Busana | Hoodie hitam, logo petir putih di dada, celana abu gelap, sepatu putih. Tanpa topi |
| Rambut | Hitam acak dengan poni bergerigi, satu *ahoge* melengkung, ujung samping mencuat |

## 2. Spesifikasi sprite

| Properti | Nilai |
|---|---|
| Ukuran frame | **48×48 px** |
| Anchor | **(24, 45)**: baris tanah tepat di bawah sepatu, tengah badan di antara kolom 23 dan 24 |
| Tinggi karakter | ±33 px (rambut 3 + kepala 17 + badan 10 + kaki 6) |
| Arah dasar | Menghadap kanan, 3/4. Kiri = `scale(-1,1)` di sekitar anchor |
| Skala tampil | Bilangan bulat: ×3 (hero, 144 px) atau ×4 (panggung) |
| Outline | 1 px `#0A0A0A` di sekeliling siluet; lengan punya outline sendiri agar terbaca di atas hoodie |
| Lompatan | **Tidak** dibakar di frame. Ketinggian (`offsetY`) diterapkan engine supaya frame tetap 48×48 |

Bagian tubuh (koordinat relatif anchor, y negatif = ke atas):

| Bagian | Ukuran | Posisi dasar |
|---|---|---|
| Kaki (×2) | 4 lebar, sepatu 5×2 | x −5 dan +1, pinggul y −6 |
| Badan | 14×12 | x −7…6, atas y −16 |
| Kepala | 20×17 + jumput rambut | x −10…9, bawah menempel 2 px di atas badan |
| Lengan (×2) | 3 lebar, tangan 3×2 | bahu x −10 / +7, y = atas badan + 3 |

## 3. Logo dan flip

- Di sheet, logo terletak di **kanan penonton** walau labelnya "Right Chest". Artinya logo ada di dada **kiri** karakter.
- Keputusan v0.2: logo digambar di sisi kanan layar saat menghadap kanan, lalu **ikut ter-flip** saat menghadap kiri. Ini konsisten secara fisik dan cukup memakai satu set frame.
- Kalau brand mewajibkan logo selalu di kanan layar, gambar logo sebagai lapisan terpisah setelah flip. Biayanya satu draw call tambahan per frame.

## 4. Prinsip gerak (yang membuat animasi terasa halus)

1. **In-between, bukan sub-pixel.** Semua posisi bilangan bulat. Kehalusan datang dari jumlah frame dan perubahan 1 px per frame.
2. **Durasi per frame, bukan FPS tetap.** Pose kunci ditahan lama (400–700 ms), transisi dibuat cepat (60–120 ms). Contoh: idle 420/120/420/120.
3. **Follow-through kepala.** Kepala tertinggal satu frame dari badan, dibatasi ±1 px (`hy = clamp(prev − cur)`). Ini otomatis untuk animasi berflag `lag`.
4. **Antisipasi dan squash.** Sebelum lompat ada jongkok 90 ms (`hip +2`). Saat mendarat ada `hip +2 → +1 → 0`.
5. **Kaki tidak meluncur.** Perpindahan per frame (`vx`) disinkronkan dengan langkah: jalan 1 px/frame (8 px per siklus), lari 2 px/frame.
6. **Rem, bukan berhenti mendadak.** Dari walk/run ke state lain selalu melewati `walkStop`/`runStop`.
7. **Kedip acak.** Lapisan kedip (half 50, closed 70, half 50 ms) tiap 2,2–5,2 dtk, dengan 20% kemungkinan kedip ganda. Hanya aktif saat mata `open`.
8. **Lompatan parabola.** `air = −(2 + 16·4t(1−t))` dengan frame berdurasi sama, sehingga puncak lompatan otomatis terasa melayang.

## 5. Daftar animasi

**W** = wajib MVP (PRD §4), **C** = cadangan (sudah ada di sheet, dipakai lab/demo).

| ID | Label | Frame | Total | Loop | Pakai | Catatan |
|---|---|---|---|---|---|---|
| `idle` | Idle | 4 | 1080 ms | ✓ | W | Napas: dada turun 1 px, kepala menyusul. Juga dipakai saat pengunjung mengetik |
| `bow` | Salam | 7 | 1190 ms | | W | Ojigi: kepala turun 3 px, poni menutup mata, tahan 520 ms, *overshoot* −1 |
| `search` | Mencari | 6 | 1600 ms | ✓ | W | Tangan di dagu, mata melirik kiri → kanan, tiga titik bergantian; diputar 1–3 dtk |
| `walk` | Jalan | 8 | 800 ms | ✓ | W | Contact → down → pass → up. Di landing diputar 1,8× (langkah lebih cepat, kaki tetap menapak) |
| `ceilingJump` | Lompat ke langit-langit | 9 | 1890 ms | | W | Antisipasi 150 → **naik** 440 → **f2 `grab`** di langit-langit (150) → **turun** 400 sambil memegang → **f4 `land`** → tarik → **f7 `release`**. Tinggi lompatan **tidak** ada di frame: dihitung landing dari jarak lantai–langit-langit lewat `airOverride` |
| `grabJump` | Lompat ambil banner | 15 | 1390 ms | | C | Antisipasi → naik 18 px → **f5 `grab`** → turun sambil memegang (tali di tangan) → **f10 `land`** → tarik → **f13 `release`** |
| `sad` | Sedih | 6 | 1930 ms | | W | Untuk "tidak ketemu". Garis murung berkedip |
| `stretch` | Menguap / peregangan | 6 | 1660 ms | | W | Idle: jinjit, tangan naik lalu terbuka (`upOut`), mata tertutup + mulut "o" ditahan 900 ms, lalu turun |
| `typing` | Mengetik | 2 | 260 ms | ✓ | C | Tidak dipakai lagi di landing (v0.3: karakter menunggu) |
| `found` | Ketemu | 8 | 1020 ms | | C | Antisipasi → hop 5 px → sparkle → lambai kecil |
| `pull` | Tarik banner | 6 | 870 ms | | C | Versi diam di tempat dari `grabJump` |
| `run` | Lari | 6 | 480 ms | ✓ | W | Condong +1, fase melayang. Lengan siku tertekuk dekat badan: kepalan naik ke dada di depan, tangan turun ke pinggul di belakang (`runF`/`runB`). Dipakai landing untuk jarak ≥ 45 px |
| `jump` | Lompat | 16 | 1000 ms | | C | Antisipasi, parabola 16 px, mendarat |
| `fallLand` | Jatuh/Mendarat | 9 | 650 ms | | C | Jatuh dari 22 px, pendaratan berat (hip +3) |
| `wave` | Lambai | 8 | 1180 ms | | C | Tiga ayunan, mata senang di tengah |
| `lookL` / `lookR` | Lihat kiri/kanan | 3 | 860 ms | | C | Mata dulu, lalu kepala 1 px |
| `crouch` | Jongkok | 4 | 1440 ms | | C | Tangan di lutut |
| `interact` | Interaksi | 6 | 780 ms | | C | Menunjuk + percikan di ujung jari |
| `happy` | Senang | 6 | 870 ms | | C | Tangan terangkat, garis gembira |
| `surprised` | Kaget | 5 | 1000 ms | | C | Hop 3 px, "!", mulut "o" |
| `walkStop` / `runStop` | (transisi) | 2 / 4 | 220 / 360 ms | | otomatis | Disisipkan oleh `play()` |

### Ekspresi & gestur (untuk video motion graphic)

Tidak dipakai landing; disiapkan untuk SevnSoul Character Studio (Remotion). Efek baru di `fx`: `zzz`, `note`, `heart`, `question`, `anger`, `sweat`. Pose lengan baru: `point`, `thumb`, `clapA`/`clapB`, `shrug`, `hip`, `belly`, `facepalm`.

| ID | Label | Frame | Total | Loop |
|---|---|---|---|---|
| `talk` | Bicara | 6 | 660 ms | ✓ |
| `present` | Presentasi | 5 | 1340 ms |  |
| `point` | Menunjuk | 5 | 1290 ms |  |
| `nod` | Mengangguk | 5 | 650 ms |  |
| `shake` | Menggeleng | 5 | 650 ms |  |
| `thumbsUp` | Jempol | 5 | 1210 ms |  |
| `clap` | Tepuk tangan | 4 | 400 ms | ✓ |
| `shrug` | Angkat bahu | 5 | 1360 ms |  |
| `facepalm` | Tepuk jidat | 5 | 1550 ms |  |
| `sleep` | Tidur | 4 | 2300 ms | ✓ |
| `dance` | Menari | 4 | 480 ms | ✓ |
| `love` | Suka / hati | 6 | 1320 ms |  |
| `confused` | Bingung | 5 | 1560 ms |  |
| `laugh` | Tertawa | 4 | 400 ms | ✓ |
| `angry` | Marah | 6 | 1210 ms |  |
| `nervous` | Gugup | 4 | 800 ms | ✓ |
| `cheer` | Bersorak | 9 | 1030 ms |  |

Total: 38 animasi + 2 transisi, 236 frame sebelum dedup.

## 6. State machine (landing v0.4)

```
load ─▶ [idle] ─0,5s─▶ [bow] ─▶ [idle]  (balon menyapa → input → bubble orbit)
                                   │
                    mengetik: tetap [idle], tidak bereaksi
                                   │ Enter / klik bubble
                                   ▼
             (banner lama naik, jalan kembali ke tengah bila perlu)
                                   ▼
                    [search] loop selama searchDuration (1–3 dtk)
                     │                                   │
                hasil ada                           hasil kosong
                     ▼                                   ▼
       banner menunggu di atas langit-langit  [sad] + balon + bubble orbit
       di titik acak; tali tarik turun di sana
                     ▼
       [walk] (< 45 px) / [run] (≥ 45 px) ke bawah tali ─▶ [walkStop]/[runStop]
                     ▼
       [ceilingJump] ── naik sampai rambut tepat di bawah langit-langit
                     ── f2 grab ─▶ banner menempel, keluar dari langit-langit
                     ── turun (banner ikut, terpotong di garis langit-langit)
                     ── f4 land ─▶ tarik ── f7 release ─▶ banner ke tengah + mengembang
                     ▼
       [idle] (karakter tetap di tengah, di bawah banner)
```

Ketinggian banner saat dipegang = `headTop(pose) − 2` (dari `sprite.js`), dihitung per frame, sehingga banner ikut naik-turun bersama lompatan dan squash pendaratan. **Lompat ke langit-langit.** Tinggi `H = ground + holdY(pose grab, air 0) − (ceil + 1)`, jadi di puncak tepi bawah banner tepat di garis langit-langit (rambut chibi lebih tinggi dari tangan yang terangkat, jadi rambut yang dipakai sebagai acuan). Kurva per frame (`phase`): naik `−H·(1−(1−u)²)` (melambat), puncak `−H`, turun `−H·(1−u²)` (makin cepat, seperti gravitasi). Banner berada di dalam `.hang` yang di-clip `inset(var(--ceil) 0 0 0)`, sehingga banner dan talinya terlihat keluar dari langit-langit saat ditarik turun. Di desktop ×5 lompatannya ±575 px layar, di HP ×3 ±315 px.

**Titik banner.** `chooseSpot()` memilih x di kiri atau kanan tengah, bergantian sisi, berjarak 30–90 px dunia (dibatasi lebar layar; di HP 375 px ±30–38). Jarak < 45 px dijalani (`walk` ×1,8), ≥ 45 px dilari (`run` ×1,5, 2 px/frame sehingga kaki tetap menapak). Semua tonggak `ceilingJump` (`grab`, `release`, `end`) didaftarkan sebelum lompatan dimulai, karena pada frame yang lambat beberapa event bisa terjadi dalam satu update.

**Idle (diam 7 dtk).** Bila tidak ada input (`pointermove`, `pointerdown`, `keydown`, `wheel`, `touchstart`, `focusin`) selama 7 dtk **dan** adegan sedang diam (intro selesai, karakter di `idle`, tidak berjalan atau memegang banner, tab terlihat), karakter memainkan satu aksi acak yang tidak sama dengan sebelumnya: `lookL → lookR` (melihat sekeliling), `stretch`, `wave`, atau `crouch`. Jam dihitung ulang setiap kali karakter sibuk, jadi aksi berikutnya datang 7 dtk setelah aksi sebelumnya selesai. Mengetik juga dihitung sebagai input, jadi karakter tetap diam saat pengunjung mengetik (PRD §4.2).

API (`Mascot`):
- `play(name, then?)`: mainkan; `then` = antrean setelah selesai. Walk/run otomatis lewat rem.
- `update(dt) → px`: memajukan waktu dan mengembalikan perpindahan horizontal (sudah dikali arah).
- `on(fn)`: event `start | frame | end` dengan `(type, name, index)`.
- `reduced = true`: setiap animasi diganti **satu pose kunci** (frame dengan durasi terpanjang), tanpa `air`/`vx`, durasi ≤ 900 ms.

## 7. Ekspor untuk produksi

Tombol **Ekspor PNG + JSON** di lab menghasilkan:

```json
{
  "frameSize": [48, 48],
  "anchor": [24, 45],
  "animations": {
    "jump": { "loop": false, "frames": [
      { "x": 0, "y": 192, "w": 48, "h": 48, "duration": 90, "offsetY": 0, "vx": 0 }
    ] }
  }
}
```

Formatnya mirip Aseprite (durasi per frame). Engine React tinggal membaca `duration` dan menerapkan `offsetY`/`vx`.

Alur dengan artis pixel: PNG ekspor dipakai sebagai **blocking/timing guide**. Artis menggambar ulang di atasnya dengan grid dan anchor yang sama, lalu engine tetap memakai JSON timing yang sama.

## 8. Checklist QA animasi

- [ ] Tidak ada frame dengan pixel setengah atau blur (zoom 400%).
- [ ] Kaki tidak meluncur saat jalan/lari di panggung lab.
- [ ] Transisi walk→idle melewati rem.
- [ ] Kedip tidak muncul saat mata `happy`/`closed`.
- [ ] Di puncak `ceilingJump` rambut tepat di bawah garis langit-langit (tidak menembus), dan banner tidak terlihat sebelum frame `grab`.
- [ ] Pencarian baru di tengah urutan membatalkan urutan lama tanpa banner tertinggal.
- [ ] Mode reduced: tidak ada perpindahan posisi, pose tetap berubah sesuai reaksi.
