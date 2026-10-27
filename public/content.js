/* Destinations + keyword search. Mirrors docs/CONTENT.md — keep both in sync.
 * Live products come from the main site (ryuukage-byte/landingpage, category pages).
 * Entries with `tbd: true` have no confirmed URL yet: they show a "Segera" badge and no link. */
(function (root) {
  'use strict';

  const DESTINATIONS = [
    {
      id: 'sevnquest', icon: 'book', chip: 'Belajar Jepang', category: 'EdTech / Learning',
      title: 'SevnQuest', desc: 'Petualangan RPG belajar bahasa Jepang, JLPT N5 sampai N1.',
      cta: 'Jelajahi SevnQuest', url: 'https://sevnquest.sevnsoul.site/', external: true, status: 'Active',
      keywords: ['sevnquest', 'sevn quest', 'belajar jepang', 'bahasa jepang', 'nihongo', 'jlpt', 'kanji',
        'hiragana', 'katakana', 'n5', 'n4', 'n3', 'n2', 'n1', 'japanese', 'rpg', 'game belajar', 'edtech', 'learning'],
    },
    {
      id: 'sevntrack', icon: 'chart', chip: 'Catat keuangan', category: 'Financial',
      title: 'The Sevn Track', desc: 'Catat dan analisis pengeluaran harian hingga bulanan secara offline.',
      cta: 'Buka The Sevn Track', url: 'https://sevntracker.sevnsoul.site/', external: true, status: 'Active',
      keywords: ['sevn track', 'sevntrack', 'sevn tracker', 'sevntracker', 'keuangan', 'catat keuangan', 'pengeluaran',
        'catat pengeluaran', 'budget', 'budgeting', 'anggaran', 'uang', 'finansial', 'financial', 'expense', 'tracker'],
    },
    {
      id: 'video', icon: 'video', chip: null,
      title: 'Layanan Video', desc: 'Pembuatan video edukasi, motion graphics, dan konten digital.',
      cta: 'Lihat layanan', url: '/layanan', external: false, tbd: true,
      keywords: ['jasa video', 'video', 'editing', 'edit video', 'motion graphics', 'motion', 'animasi',
        'konten', 'explainer', 'video edukasi'],
    },
    {
      id: 'collab', icon: 'users', chip: 'Kolaborasi',
      title: 'Mari berkolaborasi', desc: 'Punya ide atau proyek untuk dikerjakan bersama?',
      cta: 'Hubungi kami', url: 'mailto:halo@sevnsoul.example', external: false, tbd: true,
      keywords: ['kolaborasi', 'kerja sama', 'kerjasama', 'partnership', 'partner', 'kontak', 'hubungi',
        'email', 'collab'],
    },
    {
      id: 'about', icon: 'user', chip: 'Tentang',
      title: 'Tentang SevnSoul', desc: 'Temukan proyek dan hal-hal yang sedang dibangun di SevnSoul.',
      cta: 'Kenali SevnSoul', url: '/tentang', external: false, tbd: true,
      keywords: ['tentang', 'profil', 'sevnsoul', 'sevn soul', 'about', 'siapa', 'proyek'],
    },
  ];

  const normalize = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();

  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  }

  // Score bands: 100 exact · 80 query contains keyword · 60 keyword contains query · 40 typo-tolerant.
  function scoreKeyword(q, kw) {
    if (q === kw) return 100;
    if (kw.length >= 2 && (' ' + q + ' ').includes(' ' + kw + ' ')) return 80;
    if (q.length >= 3 && kw.includes(q)) return 60;
    let best = 0;
    for (const qt of q.split(' ')) {
      if (qt.length < 4) continue;
      for (const kt of kw.split(' ')) {
        if (kt.length < 4) continue;
        const d = lev(qt, kt);
        if (d <= (kt.length >= 7 ? 2 : 1)) best = Math.max(best, 40);
      }
    }
    return best;
  }

  // Words that ask for everything at once ("Daftar" bubble, or typed).
  const LIST_WORDS = ['daftar', 'semua', 'semuanya', 'list', 'all', 'menu', 'katalog', 'lihat semua'];

  // Returns null for an empty query, otherwise { query, best, score, alternatives, all }.
  // `all: true` means "show the full list" instead of one destination.
  function search(raw) {
    const q = normalize(raw || '');
    if (!q) return null;
    if (LIST_WORDS.includes(q)) return { query: raw.trim(), best: null, score: 100, alternatives: [], all: true };
    const ranked = DESTINATIONS.map(d => ({
      d, score: Math.max(0, ...d.keywords.map(k => scoreKeyword(q, normalize(k)))),
    })).filter(r => r.score > 0).sort((a, b) => b.score - a.score);
    return {
      query: raw.trim(),
      best: ranked[0] ? ranked[0].d : null,
      score: ranked[0] ? ranked[0].score : 0,
      alternatives: ranked.slice(1).map(r => r.d),
    };
  }

  // Orbit bubbles: every destination with a chip, plus "Daftar" in the middle (lands at the top of the arc).
  const LIST_CHIP = { id: 'all', icon: 'grid', chip: 'Daftar', keywords: ['daftar'] };
  const SUGGESTIONS = DESTINATIONS.filter(d => d.chip);
  SUGGESTIONS.splice(Math.floor(SUGGESTIONS.length / 2), 0, LIST_CHIP);
  root.SevnContent = { DESTINATIONS, SUGGESTIONS, LIST_WORDS, search, normalize };
})(typeof window !== 'undefined' ? window : globalThis);
