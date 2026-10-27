# ICONS.md — Ikon pixel SevnSoul v0.2

Sumber: `playground/icons.js` (grid string). File SVG ada di `icons/*.svg`; buat ulang dengan:

```bash
node tools/export-icons.js
```

## 1. Aturan

| Aturan | Nilai |
|---|---|
| Grid | 12×12 sel |
| Stroke | 1 sel, tanpa diagonal anti-alias |
| Warna | `currentColor` (mengikuti teks) |
| Ukuran tampil | 24 px (UI), 36 px (kotak banner), 48 px (ilustrasi). Selalu kelipatan 12 |
| Render | `shape-rendering="crispEdges"`, path per baris (run-length) |
| Aksesibilitas | Dekoratif → `aria-hidden="true"`. Berdiri sendiri (mis. tombol ikon) → `aria-label` di tombolnya |
| Padding optik | Sisakan ≥ 1 sel kosong di tepi, kecuali bentuk lebar (book, video) |

Ikon sengaja memakai grid lebih kasar dari sprite (12 vs 48) supaya pada 24 px setiap sel menjadi 2×2 px layar, setebal outline maskot pada skala ×2.

## 2. Daftar

| Nama | Pakai |
|---|---|
| `bolt` | Logo / wordmark / favicon |
| `search` | Kolom pencarian |
| `arrowRight` / `arrowLeft` | Submit, CTA internal, hadap kiri/kanan |
| `external` | CTA ke situs lain |
| `close` | Tutup banner / hapus kueri |
| `chevronDown` | Perluas |
| `book` | SevnQuest |
| `video` | Layanan Video |
| `users` | Kolaborasi |
| `user` | Tentang |
| `mail` | Kontak |
| `sparkle` | Hasil / sorotan |
| `help` | Empty state |
| `check` | Sukses / tersalin |
| `pause` / `play` | Toggle gerak |
| `step` | Maju satu frame (lab) |
| `chart` | The Sevn Track (keuangan) |
| `grid` | Overlay grid (lab) |
| `download` | Ekspor |

## 3. Menambah ikon

1. Tambah 12 string baris di `ICONS` (`#` = isi, `.` = kosong). `validate()` akan menolak grid yang bukan 12×12.
2. Cek di bagian **Ikon** playground pada 24/36/48 px.
3. Jalankan `node tools/export-icons.js`.
4. Tambah baris di tabel §2.

Contoh (`search`):

```
............
...####.....
..#....#....
.#......#...
.#......#...
.#......#...
.#......#...
..#....#....
...####.#...
.........#..
..........#.
............
```

## 4. Pemakaian di React

```tsx
import { iconPath } from './icons';
export function Icon({ name, size = 24, label }: { name: IconName; size?: 24 | 36 | 48; label?: string }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} fill="currentColor" shapeRendering="crispEdges"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}>
      <path d={iconPath(name)} />
    </svg>
  );
}
```
