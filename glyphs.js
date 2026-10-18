/*
 * Rune square script: build fictional Chinese-looking characters out of runes.
 *
 * Each rune is used as a component (偏旁部首). The runes of a word are packed
 * into one square block the way hanzi components are: side by side (⿰),
 * stacked (⿱), in rows of three (⿲ ⿳), or wrapped inside an enclosing rune
 * (⿵ ⿸ ⿴). The same word always builds the same character.
 *
 * Runes are drawn from stroke data (straight lines in a 1×1 box) rather than a
 * font, so they can be squeezed, stretched and given brush strokes.
 */
(function (root) {
  'use strict';

  // ---------------------------------------------------------------- runes ---

  // latin, name, natural width/height, then polylines as flat [x, y, x, y, …]
  // in a 1×1 box (y points down).
  const RUNES = {};
  function rune(ch, latin, name, aspect, ...lines) {
    RUNES[ch] = { rune: ch, latin, name, aspect, lines };
  }

  // Elder Futhark
  rune('ᚠ', 'f', 'Fehu', 0.55, [0.2, 0, 0.2, 1], [0.2, 0.32, 0.8, 0.06], [0.2, 0.58, 0.8, 0.32]);
  rune('ᚢ', 'u', 'Uruz', 0.6, [0.15, 1, 0.15, 0, 0.85, 0.3, 0.85, 1]);
  rune('ᚦ', 'þ', 'Thurisaz', 0.5, [0.2, 0, 0.2, 1], [0.2, 0.25, 0.75, 0.5, 0.2, 0.75]);
  rune('ᚨ', 'a', 'Ansuz', 0.55, [0.2, 0, 0.2, 1], [0.2, 0.04, 0.8, 0.3], [0.2, 0.3, 0.8, 0.56]);
  rune('ᚱ', 'r', 'Raidō', 0.55, [0.2, 0, 0.2, 1], [0.2, 0, 0.75, 0.25, 0.2, 0.5, 0.8, 1]);
  rune('ᚲ', 'k', 'Kaunan', 0.45, [0.8, 0, 0.2, 0.5, 0.8, 1]);
  rune('ᚷ', 'g', 'Gebō', 0.75, [0, 0, 1, 1], [1, 0, 0, 1]);
  rune('ᚹ', 'w', 'Wunjō', 0.5, [0.2, 0, 0.2, 1], [0.2, 0, 0.75, 0.25, 0.2, 0.5]);
  rune('ᚺ', 'h', 'Hagalaz', 0.6, [0.15, 0, 0.15, 1], [0.85, 0, 0.85, 1], [0.15, 0.35, 0.85, 0.65]);
  rune('ᚾ', 'n', 'Naudiz', 0.45, [0.5, 0, 0.5, 1], [0.15, 0.35, 0.85, 0.6]);
  rune('ᛁ', 'i', 'Isaz', 0.15, [0.5, 0, 0.5, 1]);
  rune('ᛃ', 'j', 'Jēra', 0.6, [0.5, 0.05, 0.15, 0.35, 0.5, 0.65], [0.5, 0.35, 0.85, 0.65, 0.5, 0.95]);
  rune('ᛇ', 'ï', 'Eihwaz', 0.5, [0.5, 0, 0.5, 1], [0.5, 0, 0.82, 0.22], [0.5, 1, 0.18, 0.78]);
  rune('ᛈ', 'p', 'Perþō', 0.55, [0.2, 0, 0.2, 1], [0.2, 0, 0.7, 0.3, 0.85, 0.08], [0.2, 1, 0.7, 0.7, 0.85, 0.92]);
  rune('ᛉ', 'z', 'Algiz', 0.7, [0.5, 0, 0.5, 1], [0.12, 0, 0.5, 0.4, 0.88, 0]);
  rune('ᛊ', 's', 'Sōwilō', 0.45, [0.75, 0, 0.25, 0.35, 0.75, 0.65, 0.25, 1]);
  rune('ᛏ', 't', 'Tīwaz', 0.7, [0.5, 0, 0.5, 1], [0.12, 0.35, 0.5, 0, 0.88, 0.35]);
  rune('ᛒ', 'b', 'Berkanan', 0.5, [0.2, 0, 0.2, 1], [0.2, 0, 0.75, 0.25, 0.2, 0.5, 0.75, 0.75, 0.2, 1]);
  rune('ᛖ', 'e', 'Ehwaz', 0.7, [0.12, 1, 0.12, 0, 0.5, 0.32, 0.88, 0, 0.88, 1]);
  rune('ᛗ', 'm', 'Mannaz', 0.75, [0.12, 0, 0.12, 1], [0.88, 0, 0.88, 1], [0.12, 0, 0.88, 0.42], [0.88, 0, 0.12, 0.42]);
  rune('ᛚ', 'l', 'Laguz', 0.45, [0.25, 0, 0.25, 1], [0.25, 0, 0.8, 0.35]);
  rune('ᛜ', 'ŋ', 'Ingwaz', 0.8, [0.5, 0.1, 0.9, 0.5, 0.5, 0.9, 0.1, 0.5, 0.5, 0.1]);
  rune('ᛞ', 'd', 'Dagaz', 0.8, [0.1, 0, 0.1, 1], [0.9, 0, 0.9, 1], [0.1, 0, 0.9, 1], [0.9, 0, 0.1, 1]);
  rune('ᛟ', 'o', 'Ōþalan', 0.7, [0.15, 1, 0.85, 0.4, 0.5, 0.05, 0.15, 0.4, 0.85, 1]);

  // Younger Futhark, long-branch
  rune('ᚬ', 'o', 'Óss', 0.5, [0.5, 0, 0.5, 1], [0.2, 0.12, 0.8, 0.32], [0.2, 0.36, 0.8, 0.56]);
  rune('ᚴ', 'k', 'Kaun', 0.5, [0.3, 0, 0.3, 1], [0.3, 0.45, 0.8, 0.08]);
  rune('ᚼ', 'h', 'Hagall', 0.7, [0.5, 0, 0.5, 1], [0.12, 0.25, 0.88, 0.75], [0.88, 0.25, 0.12, 0.75]);
  rune('ᛅ', 'a', 'Ár', 0.45, [0.5, 0, 0.5, 1], [0.15, 0.6, 0.85, 0.35]);
  rune('ᛋ', 's', 'Sól', 0.5, [0.25, 0, 0.25, 0.6, 0.75, 0.35, 0.75, 1]);
  rune('ᛘ', 'm', 'Maðr', 0.7, [0.5, 0, 0.5, 1], [0.12, 0, 0.5, 0.4, 0.88, 0]);
  rune('ᛦ', 'ʀ', 'Yr', 0.7, [0.5, 0, 0.5, 1], [0.12, 1, 0.5, 0.6, 0.88, 1]);
  rune('ᛝ', 'ŋ', 'Ing', 0.6, [0.2, 0, 0.8, 0.5, 0.2, 1], [0.8, 0, 0.2, 0.5, 0.8, 1]);

  // Younger Futhark, short-twig
  rune('ᚭ', 'o', 'Óss (short-twig)', 0.35, [0.5, 0, 0.5, 1], [0.5, 0.15, 0.85, 0.4]);
  rune('ᚽ', 'h', 'Hagall (short-twig)', 0.35, [0.5, 0, 0.5, 1], [0.3, 0.5, 0.7, 0.5]);
  rune('ᚿ', 'n', 'Nauðr (short-twig)', 0.35, [0.5, 0, 0.5, 1], [0.3, 0.3, 0.75, 0.5]);
  rune('ᛆ', 'a', 'Ár (short-twig)', 0.35, [0.5, 0, 0.5, 1], [0.5, 0.35, 0.15, 0.6]);
  rune('ᛌ', 's', 'Sól (short-twig)', 0.15, [0.5, 0, 0.5, 0.4]);
  rune('ᛐ', 't', 'Týr (short-twig)', 0.4, [0.5, 0, 0.5, 1], [0.5, 0, 0.15, 0.3]);
  rune('ᛓ', 'b', 'Bjarkan (short-twig)', 0.4, [0.5, 0, 0.5, 1], [0.5, 0, 0.85, 0.2, 0.5, 0.4]);
  rune('ᛙ', 'm', 'Maðr (short-twig)', 0.4, [0.5, 0, 0.5, 1], [0.25, 0, 0.5, 0.22, 0.75, 0]);
  rune('ᛧ', 'ʀ', 'Yr (short-twig)', 0.15, [0.5, 0.6, 0.5, 1]);

  // A few runes have a shape that can wrap around other components, like
  // 冂 (⿵), 厂 (⿸) or 囗 (⿴) do. inner = [x, y, w, h] of the space inside.
  const ENCLOSURES = {
    'ᚢ': { idc: '⿵', inner: [0.24, 0.4, 0.52, 0.58], lines: [[0.08, 1, 0.08, 0.02, 0.92, 0.22, 0.92, 1]] },
    'ᛖ': { idc: '⿵', inner: [0.22, 0.44, 0.56, 0.54], lines: [[0.06, 1, 0.06, 0, 0.5, 0.28, 0.94, 0, 0.94, 1]] },
    'ᛗ': {
      idc: '⿵', inner: [0.22, 0.48, 0.56, 0.5],
      lines: [[0.06, 0, 0.06, 1], [0.94, 0, 0.94, 1], [0.06, 0, 0.94, 0.36], [0.94, 0, 0.06, 0.36]],
    },
    'ᛚ': { idc: '⿸', inner: [0.28, 0.32, 0.7, 0.66], lines: [[0.1, 0, 0.1, 1], [0.1, 0, 0.95, 0.2]] },
    'ᛜ': { idc: '⿴', inner: [0.28, 0.28, 0.44, 0.44], max: 1, lines: [[0.5, 0, 1, 0.5, 0.5, 1, 0, 0.5, 0.5, 0]] },
  };

  const ALPHABETS = [
    { id: 'elder', label: 'Elder Futhark', runes: [...'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'] },
    { id: 'younger', label: 'Younger Futhark', runes: [...'ᚠᚢᚦᚬᚱᚴᚼᚾᛁᛅᛋᛏᛒᛘᛚᛦ'] },
    { id: 'short', label: 'Short-twig', runes: [...'ᚠᚢᚦᚭᚱᚴᚽᚿᛁᛆᛌᛐᛓᛙᛚᛧ'] },
  ];

  // Word dividers carved between words: ᛫ ᛬ ᛭
  const DIVIDERS = '᛫᛬᛭';

  // Punctuation is written the Chinese way among the characters.
  const PUNCTUATION = { '.': '。', ',': '，', '!': '！', '?': '？', ';': '；', ':': '：' };

  // --------------------------------------------------------------- random ---

  // Seeded so that the same word always builds the same character.
  function seedFrom(text) {
    let h = 2166136261;
    for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
    return h >>> 0;
  }
  function random(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // --------------------------------------------------------------- layout ---

  // How much room a group of runes wants along the split direction.
  function weight(runes, horizontal) {
    if (runes.length > 1) return 0.7 * Math.sqrt(runes.length);
    return horizontal ? clamp(RUNES[runes[0]].aspect, 0.3, 0.75) : 0.55;
  }

  function splitBox(box, horizontal, shares) {
    const total = shares.reduce((a, b) => a + b, 0);
    let offset = 0;
    return shares.map((s) => {
      const part = s / total;
      const b = horizontal
        ? { x: box.x + offset * box.w, y: box.y, w: part * box.w, h: box.h }
        : { x: box.x, y: box.y + offset * box.h, w: box.w, h: part * box.h };
      offset += part;
      return b;
    });
  }

  // Arrange runes inside a box, like hanzi components. Returns a tree:
  //   { type: 'leaf', rune, box }
  //   { type: 'split', idc: '⿰' | '⿱' | '⿲' | '⿳', children }
  //   { type: 'enclose', idc, rune, box, inner }
  function arrange(runes, box, rng) {
    const n = runes.length;
    if (n === 1) return { type: 'leaf', rune: runes[0], box };

    const enc = ENCLOSURES[runes[0]];
    if (enc && n - 1 <= (enc.max || 2) && box.w > 0.3 && box.h > 0.3 && rng() < 0.75) {
      const [ix, iy, iw, ih] = enc.inner;
      const inner = { x: box.x + ix * box.w, y: box.y + iy * box.h, w: iw * box.w, h: ih * box.h };
      return { type: 'enclose', idc: enc.idc, rune: runes[0], box, inner: arrange(runes.slice(1), inner, rng) };
    }

    // Side by side or stacked? Wide boxes split sideways, tall boxes stack, and
    // a narrow first rune likes to sit on the left like 亻 or 氵.
    const aspect = box.w / box.h;
    let pSide = 0.5;
    if (RUNES[runes[0]].aspect < 0.42) pSide += 0.3;
    if (aspect > 1.7) pSide = 1;
    else if (aspect > 1.3) pSide = 0.9;
    else if (aspect < 0.6) pSide = 0;
    else if (aspect < 0.77) pSide = 0.1;
    const horizontal = rng() < pSide;

    // Three in a row (⿲), or three stacked (⿳) when the runes are wide enough to stack.
    const stackable = horizontal || runes.every((r) => RUNES[r].aspect >= 0.6);
    if (n === 3 && stackable && rng() < 0.25 && (horizontal ? aspect > 0.8 : aspect < 1.25)) {
      const boxes = splitBox(box, horizontal, runes.map((r) => weight([r], horizontal)));
      return {
        type: 'split',
        idc: horizontal ? '⿲' : '⿳',
        children: runes.map((r, i) => arrange([r], boxes[i], rng)),
      };
    }

    // Usually one rune acts as the radical (first or last), the rest share the other side.
    let k = 1;
    if (n > 2) {
      const r = rng();
      k = r < 0.55 ? 1 : r < 0.75 ? n - 1 : Math.floor(n / 2);
    }
    const a = runes.slice(0, k);
    const b = runes.slice(k);
    const wa = weight(a, horizontal);
    const wb = weight(b, horizontal);
    const share = clamp(wa / (wa + wb), 0.28, 0.72);
    const [boxA, boxB] = splitBox(box, horizontal, [share, 1 - share]);
    return {
      type: 'split',
      idc: horizontal ? '⿰' : '⿱',
      children: [arrange(a, boxA, rng), arrange(b, boxB, rng)],
    };
  }

  // Ideographic Description Sequence, e.g. ⿰ᚦ⿱ᛟᚱ
  function describe(node) {
    if (node.type === 'leaf') return node.rune;
    if (node.type === 'enclose') return node.idc + node.rune + describe(node.inner);
    return node.idc + node.children.map(describe).join('');
  }

  function countParts(node) {
    if (node.type === 'leaf') return 1;
    if (node.type === 'enclose') return 1 + countParts(node.inner);
    return node.children.reduce((sum, c) => sum + countParts(c), 0);
  }

  // Split a long word into characters of at most `max` runes, as evenly as possible.
  function chunk(runes, max) {
    const count = Math.ceil(runes.length / max);
    const base = Math.floor(runes.length / count);
    const extra = runes.length % count;
    const out = [];
    let i = 0;
    for (let c = 0; c < count; c++) {
      const size = base + (c < extra ? 1 : 0);
      out.push(runes.slice(i, i + size));
      i += size;
    }
    return out;
  }

  function buildGlyph(runes, variant) {
    const rng = random(seedFrom(runes.join('') + '|' + variant));
    const tree = arrange(runes, { x: 0, y: 0, w: 1, h: 1 }, rng);
    return { type: 'glyph', runes: runes.join(''), tree, ids: describe(tree), parts: countParts(tree) };
  }

  /**
   * Turn text into fictional characters.
   * Returns a list of items: { type: 'glyph', runes, tree, ids } for each
   * character, plus 'space', 'newline' and 'text' (anything that isn't a rune).
   */
  function compose(text, { maxPerGlyph = 4, variant = 0 } = {}) {
    const items = [];
    let word = [];
    const flush = () => {
      for (const part of word.length ? chunk(word, maxPerGlyph) : []) items.push(buildGlyph(part, variant));
      word = [];
    };
    for (const ch of text) {
      if (RUNES[ch]) { word.push(ch); continue; }
      flush();
      if (ch === '\n') items.push({ type: 'newline' });
      else if (/\s/.test(ch) || DIVIDERS.includes(ch)) items.push({ type: 'space' });
      else items.push({ type: 'text', text: PUNCTUATION[ch] || ch });
    }
    flush();
    return items;
  }

  // -------------------------------------------------------------- drawing ---

  // Runes were carved across the wood grain, so they avoid horizontal lines;
  // hanzi are full of them. "Hanzi-ness" swings loose diagonal branches
  // toward the horizontal (ᚠ starts to look like 卞, ᛚ like 厂).
  function hanzify(lines, amount) {
    if (!amount) return lines;
    const pull = amount * 0.75;
    const onLine = (x, y, skip) =>
      lines.some((l, li) => {
        if (li === skip) return false;
        for (let i = 0; i + 3 < l.length; i += 2) {
          if (distToSegment(x, y, l[i], l[i + 1], l[i + 2], l[i + 3]) < 0.03) return true;
        }
        return false;
      });

    return lines.map((line, li) => {
      const pts = line.slice();
      const last = pts.length - 2;
      const closed = pts[0] === pts[last] && pts[1] === pts[last + 1];
      if (closed) return pts;
      const free = [!onLine(pts[0], pts[1], li), !onLine(pts[last], pts[last + 1], li)];
      // A lone stroke with both ends loose (the arms of ᚷ) is left as it is.
      if (pts.length === 4 && free[0] && free[1]) return pts;
      [[0, 2], [last, last - 2]].forEach(([end, next], k) => {
        if (!free[k]) return;
        const dx = Math.abs(pts[end] - pts[next]);
        const dy = pts[next + 1] - pts[end + 1];
        if (dx > 0.25 * Math.abs(dy)) pts[end + 1] += dy * pull;
      });
      return pts;
    });
  }

  function distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy || 1;
    const t = clamp(((px - x1) * dx + (py - y1) * dy) / len2, 0, 1);
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  // Fit a rune into its box. Hanzi components are squeezed and stretched to
  // fill their part of the square; `stretch` limits how far a rune may go.
  function fit(box, aspect, inset, stretch) {
    const b = {
      x: box.x + inset, y: box.y + inset,
      w: Math.max(box.w - 2 * inset, 0.01), h: Math.max(box.h - 2 * inset, 0.01),
    };
    const boxAspect = b.w / b.h;
    const target = clamp(boxAspect, aspect / stretch, aspect * stretch);
    let w = b.w;
    let h = b.h;
    if (target < boxAspect) w = h * target;
    else h = w / target;
    return { x: b.x + (b.w - w) / 2, y: b.y + (b.h - h) / 2, w, h };
  }

  const place = (lines, r) => lines.map((l) => l.map((v, i) => (i % 2 ? r.y + v * r.h : r.x + v * r.w)));

  // A glyph's polylines in a 0–100 box with a margin, grouped per rune (in
  // writing order) so cursive styles can join a rune's strokes together.
  function strokes(tree, { hanzi, weight }) {
    const out = [];
    const toCanvas = (b) => ({ x: 6 + b.x * 88, y: 6 + b.y * 88, w: b.w * 88, h: b.h * 88 });
    const stretch = 2 + 4 * hanzi;
    (function walk(node) {
      if (node.type === 'leaf') {
        const info = RUNES[node.rune];
        const rect = fit(toCanvas(node.box), info.aspect, weight * 0.6, stretch);
        out.push(place(hanzify(info.lines, hanzi), rect));
      } else if (node.type === 'enclose') {
        const b = toCanvas(node.box);
        const inset = weight * 0.6;
        const rect = { x: b.x + inset, y: b.y + inset, w: b.w - 2 * inset, h: b.h - 2 * inset };
        out.push(place(ENCLOSURES[node.rune].lines, rect));
        walk(node.inner);
      } else {
        node.children.forEach(walk);
      }
    })(tree);
    return out;
  }

  const f = (n) => Math.round(n * 100) / 100;

  // ---- geometry helpers for the brush styles (points are [x, y])

  const toPoints = (flat) => {
    const pts = [];
    for (let i = 0; i + 1 < flat.length; i += 2) pts.push([flat[i], flat[i + 1]]);
    return pts;
  };

  // Reshape every point of the glyph, e.g. to slant or flatten it.
  const reshape = (lines, fn) => lines.map((l) => toPoints(l).flatMap(([x, y]) => fn(x, y)));

  // Round off corners (Chaikin's corner cutting); the two ends stay put.
  function smooth(pts, times) {
    for (let k = 0; k < times && pts.length > 2; k++) {
      const out = [pts[0]];
      for (let i = 0; i + 1 < pts.length; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[i + 1];
        if (i > 0) out.push([x1 * 0.75 + x2 * 0.25, y1 * 0.75 + y2 * 0.25]);
        if (i + 2 < pts.length) out.push([x1 * 0.25 + x2 * 0.75, y1 * 0.25 + y2 * 0.75]);
      }
      out.push(pts[pts.length - 1]);
      pts = out;
    }
    return pts;
  }

  // Add points along long straight runs so the stroke width can change smoothly.
  function densify(pts, step) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1];
      const [x2, y2] = pts[i];
      const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step));
      for (let k = 1; k <= n; k++) out.push([x1 + ((x2 - x1) * k) / n, y1 + ((y2 - y1) * k) / n]);
    }
    return out;
  }

  // Position (0–1) of each point along the stroke.
  function progress(pts) {
    const d = [0];
    for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = d[d.length - 1] || 1;
    return d.map((v) => v / total);
  }

  // A filled stroke whose width changes along its length (a brush ribbon).
  // caps: round off the [start, end] (a flared end is left cut).
  function ribbon(pts, widths, caps = [true, true]) {
    const n = pts.length;
    if (n < 2) return '';
    const left = [];
    const right = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(n - 1, i + 1)];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const nx = -(b[1] - a[1]) / len;
      const ny = (b[0] - a[0]) / len;
      const h = widths[i] / 2;
      left.push(`${f(pts[i][0] + nx * h)} ${f(pts[i][1] + ny * h)}`);
      right.push(`${f(pts[i][0] - nx * h)} ${f(pts[i][1] - ny * h)}`);
    }
    const [sx, sy] = pts[0];
    const [ex, ey] = pts[n - 1];
    return `<path d="M${left.join('L')}L${right.reverse().join('L')}Z"/>` +
      (caps[0] ? `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(widths[0] / 2)}"/>` : '') +
      (caps[1] ? `<circle cx="${f(ex)}" cy="${f(ey)}" r="${f(widths[n - 1] / 2)}"/>` : '');
  }

  // Bow straight segments a little, as a hand-drawn line never is ruler-straight.
  function bow(pts, amount, rng) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1];
      const [x2, y2] = pts[i];
      const bend = (rng() - 0.5) * 2 * amount;
      out.push([(x1 + x2) / 2 - (y2 - y1) * bend, (y1 + y2) / 2 + (x2 - x1) * bend], pts[i]);
    }
    return out;
  }

  // Put a rune's strokes in the order a hand would write them: start top-left,
  // then always continue with the stroke whose end is nearest the pen.
  function writingOrder(lines) {
    const left = lines.map(toPoints);
    const out = [];
    let pen = null;
    while (left.length) {
      let best = 0;
      let flip = false;
      let bestScore = Infinity;
      left.forEach((s, i) => {
        [[s[0], false], [s[s.length - 1], true]].forEach(([p, rev]) => {
          const score = pen ? Math.hypot(p[0] - pen[0], p[1] - pen[1]) : p[0] + p[1] * 1.5;
          if (score < bestScore) { bestScore = score; best = i; flip = rev; }
        });
      });
      const s = left.splice(best, 1)[0];
      if (flip) s.reverse();
      out.push(s);
      pen = s[s.length - 1];
    }
    return out;
  }

  // 篆 seal (small-seal script): tall, even lines with rounded corners.
  function drawSeal(lines, w) {
    const tall = reshape(lines, (x, y) => [50 + (x - 50) * 0.86, y]);
    const d = tall.map((l) => 'M' + smooth(toPoints(l), 2).map(([x, y]) => `${f(x)} ${f(y)}`).join('L')).join('');
    return `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  // 黑 Hei: the bold, even sans-serif of modern signs, square-ended.
  function drawHei(lines, w) {
    const d = lines.map((l) => 'M' + toPoints(l).map(([x, y]) => `${f(x)} ${f(y)}`).join('L')).join('');
    return `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${f(w * 1.2)}" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="2"/>`;
  }

  // 隶 clerical: wide, flat characters. Horizontal strokes have a heavy
  // "silkworm head" and a flared "swallow tail" flicking up (蚕头燕尾); strokes
  // falling to the right flare out at the end.
  function drawClerical(lines, w) {
    const flat = reshape(lines, (x, y) => [50 + (x - 50) * 1.05, 50 + (y - 50) * 0.8]);
    let svg = '';
    for (const l of flat) {
      for (let i = 0; i + 3 < l.length; i += 2) {
        let [x1, y1, x2, y2] = l.slice(i, i + 4);
        const dx = x2 - x1;
        const dy = y2 - y1;
        const horizontal = Math.abs(dy) < 0.45 * Math.abs(dx);
        const falling = !horizontal && dx * dy > 0 && Math.abs(dx) > 0.35 * Math.abs(dy);
        if (horizontal ? x1 > x2 : y1 > y2) [x1, y1, x2, y2] = [x2, y2, x1, y1];
        let pts = densify([[x1, y1], [x2, y2]], 2);
        const t = progress(pts);
        let widths;
        if (horizontal) {
          widths = t.map((p) => w * (p < 0.15 ? 1.3 - 3 * p : p > 0.72 ? 0.85 + 2.4 * (p - 0.72) : 0.85));
          pts = pts.map(([x, y], k) => [x, y - (t[k] > 0.8 ? ((t[k] - 0.8) / 0.2) ** 2 * w : 0)]);
          svg += ribbon(pts, widths, [true, false]);
        } else if (falling) {
          widths = t.map((p) => w * (0.75 + 1.1 * p * p));
          svg += ribbon(pts, widths, [true, false]);
        } else {
          svg += ribbon(pts, t.map(() => w * 0.95));
        }
      }
    }
    return `<g fill="currentColor">${svg}</g>`;
  }

  // 行 running and 草 cursive: the brush rarely leaves the paper. Corners
  // become curves, strokes start heavy and lift off, and consecutive strokes
  // are joined by hairline links (游丝). The whole character leans.
  // hair: how thin a link gets mid-air, relative to the strokes it joins.
  const RUNNING = { smooth: 1, bow: 0.04, slant: 0.06, jitter: 0.8, linkInside: 0.45, linkAcross: 0.15, hair: 0.22, press: [1.15, 0.6] };
  const CURSIVE = { smooth: 3, bow: 0.16, slant: 0.14, jitter: 1.6, linkInside: 1, linkAcross: 0.6, hair: 0.3, press: [1.55, 0.35] };

  function drawFlowing(groups, w, rng, style) {
    const lean = (x, y) => [
      50 + (x - 50) * 0.94 + (50 - y) * style.slant + (rng() - 0.5) * style.jitter,
      y + (rng() - 0.5) * style.jitter,
    ];
    // Linked strokes are drawn as one continuous ribbon, like one brush movement.
    let svg = '';
    let chain = null;
    let heading = null;
    const flush = () => {
      if (chain) svg += ribbon(chain.pts, chain.widths);
      chain = null;
    };

    groups.forEach((group) => {
      writingOrder(group).forEach((stroke, i) => {
        const pts = densify(smooth(bow(stroke.map(([x, y]) => lean(x, y)), style.bow, rng), style.smooth), 2.5);
        const weight = w * (0.85 + rng() * 0.3);
        const [p0, p1] = style.press;
        const widths = progress(pts).map((t) => weight * (p0 + (p1 - p0) * t) * (t < 0.06 ? 0.75 + 4 * t : 1));

        const pen = chain && chain.pts[chain.pts.length - 1];
        const near = pen && Math.hypot(pts[0][0] - pen[0], pts[0][1] - pen[1]) < 45;
        if (near && rng() < (i > 0 ? style.linkInside : style.linkAcross)) {
          const from = chain.widths[chain.widths.length - 1];
          const bridge = linkPoints(pen, heading, pts[0]);
          bridge.forEach((p, k) => {
            const t = (k + 1) / (bridge.length + 1);
            chain.pts.push(p);
            chain.widths.push((from + (widths[0] - from) * t) * (1 - (1 - style.hair) * Math.sin(Math.PI * t)));
          });
          chain.pts.push(...pts);
          chain.widths.push(...widths);
        } else {
          flush();
          chain = { pts: [...pts], widths };
        }

        const end = pts[pts.length - 1];
        const before = pts[Math.max(0, pts.length - 3)];
        const len = Math.hypot(end[0] - before[0], end[1] - before[1]) || 1;
        heading = [(end[0] - before[0]) / len, (end[1] - before[1]) / len];
      });
    });
    flush();
    return `<g fill="currentColor">${svg}</g>`;
  }

  // The path of the pen in the air between two strokes, carried on by its
  // momentum (a curve), without the two end points themselves.
  function linkPoints(from, heading, to) {
    const dist = Math.hypot(to[0] - from[0], to[1] - from[1]);
    // Kept inside the square so links don't swing out of the character.
    const c = [
      clamp(from[0] + heading[0] * dist * 0.3, 6, 94),
      clamp(from[1] + heading[1] * dist * 0.3, 6, 94),
    ];
    const steps = Math.max(2, Math.ceil(dist / 2.5));
    const pts = [];
    for (let k = 1; k < steps; k++) {
      const t = k / steps;
      const u = 1 - t;
      pts.push([u * u * from[0] + 2 * u * t * c[0] + t * t * to[0], u * u * from[1] + 2 * u * t * c[1] + t * t * to[1]]);
    }
    return pts;
  }

  // 宋 print: thin horizontals, thick verticals, a little triangle at the end of horizontals.
  function drawPrint(lines, w) {
    let svg = '';
    for (const l of lines) {
      for (let i = 0; i + 3 < l.length; i += 2) {
        const [x1, y1, x2, y2] = l.slice(i, i + 4);
        const len = Math.hypot(x2 - x1, y2 - y1) || 1;
        const vertical = Math.abs(y2 - y1) / len;
        const sw = w * (0.45 + 0.8 * vertical);
        svg += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke-width="${f(sw)}"/>`;
        if (vertical < 0.3) {
          const [rx, ry] = x2 > x1 ? [x2, y2] : [x1, y1];
          svg += `<path d="M${f(rx + sw * 0.4)} ${f(ry + sw * 0.5)}L${f(rx - w * 0.9)} ${f(ry - sw * 0.4)}L${f(rx + sw * 0.1)} ${f(ry - w * 0.9)}Z"/>`;
        }
      }
    }
    return `<g fill="currentColor" stroke="currentColor" stroke-linecap="square">${svg}</g>`;
  }

  // 楷 brush: each stroke starts with pressure and lifts off at the end.
  function drawBrush(lines, w, rng) {
    let svg = '';
    for (const l of lines) {
      for (let i = 0; i + 3 < l.length; i += 2) {
        let [x1, y1, x2, y2] = l.slice(i, i + 4);
        // Strokes are written left to right and top to bottom.
        const sideways = Math.abs(x2 - x1) > Math.abs(y2 - y1);
        if (sideways ? x1 > x2 : y1 > y2) [x1, y1, x2, y2] = [x2, y2, x1, y1];
        const len = Math.hypot(x2 - x1, y2 - y1) || 1;
        const nx = -(y2 - y1) / len;
        const ny = (x2 - x1) / len;
        const w1 = w * (0.95 + rng() * 0.2);
        const w2 = w * (0.45 + rng() * 0.2);
        const m = (x, y, s) => `${f(x + nx * s)} ${f(y + ny * s)}`;
        svg += `<path d="M${m(x1, y1, w1 / 2)}L${m(x2, y2, w2 / 2)}L${m(x2, y2, -w2 / 2)}L${m(x1, y1, -w1 / 2)}Z"/>`;
        svg += `<circle cx="${f(x1)}" cy="${f(y1)}" r="${f(w1 * 0.5)}"/>`;
        svg += `<circle cx="${f(x2)}" cy="${f(y2)}" r="${f(w2 / 2)}"/>`;
      }
    }
    return `<g fill="currentColor">${svg}</g>`;
  }

  const STYLES = [
    { id: 'brush', han: '楷', label: 'Regular' },
    { id: 'running', han: '行', label: 'Running' },
    { id: 'cursive', han: '草', label: 'Cursive' },
    { id: 'clerical', han: '隶', label: 'Clerical' },
    { id: 'seal', han: '篆', label: 'Seal' },
    { id: 'print', han: '宋', label: 'Song' },
    { id: 'hei', han: '黑', label: 'Hei' },
  ];

  /**
   * SVG markup (viewBox 0 0 100 100) for one glyph.
   * style: one of STYLES' ids; hanzi: 0–1.
   */
  function drawGlyph(glyph, { style = 'brush', hanzi = 0.5 } = {}) {
    // Like hanzi, strokes get thinner as more components share the square.
    const weight = clamp(8.2 - glyph.parts * 0.9, 4.2, 8);
    const groups = strokes(glyph.tree, { hanzi, weight });
    const lines = groups.flat();
    const rng = random(seedFrom(glyph.runes + style));
    switch (style) {
      case 'running': return drawFlowing(groups, weight, rng, RUNNING);
      case 'cursive': return drawFlowing(groups, weight * 0.9, rng, CURSIVE);
      case 'clerical': return drawClerical(lines, weight);
      case 'seal': return drawSeal(lines, weight);
      case 'print': return drawPrint(lines, weight);
      case 'hei': return drawHei(lines, weight);
      default: return drawBrush(lines, weight, rng);
    }
  }

  // ------------------------------------------------------- latin to runes ---

  // For people who can't type runes: spell with Latin letters, get Elder Futhark.
  const LATIN_TO_RUNE = {
    a: 'ᚨ', b: 'ᛒ', c: 'ᚲ', d: 'ᛞ', e: 'ᛖ', f: 'ᚠ', g: 'ᚷ', h: 'ᚺ', i: 'ᛁ',
    j: 'ᛃ', k: 'ᚲ', l: 'ᛚ', m: 'ᛗ', n: 'ᚾ', o: 'ᛟ', p: 'ᛈ', q: 'ᚲ', r: 'ᚱ',
    s: 'ᛊ', t: 'ᛏ', u: 'ᚢ', v: 'ᚹ', w: 'ᚹ', x: 'ᚲᛊ', y: 'ᛃ', z: 'ᛉ',
    þ: 'ᚦ', ð: 'ᚦ', æ: 'ᛇ', ø: 'ᛟ', th: 'ᚦ', ng: 'ᛜ',
  };

  function latinToRunes(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // á → a, ö → o
      .replace(/th|ng|[a-zþðæø]/g, (m) => LATIN_TO_RUNE[m]);
  }

  // ------------------------------------------------------ english to runes ---

  // Runes were written the way words sound, so English is spelled by sound:
  // silent letters drop out and pairs like "th", "ph" or "igh" become the one
  // sound they stand for. English spelling is irregular, so the commonest
  // irregular words are listed outright; the rest go through the rules below.
  const ENGLISH_WORDS = {
    the: 'ᚦᛖ', a: 'ᚨ', i: 'ᚨᛁ', you: 'ᛃᚢ', your: 'ᛃᛟᚱ', of: 'ᛟᚠ', to: 'ᛏᚢ', two: 'ᛏᚢ', do: 'ᛞᚢ',
    is: 'ᛁᛉ', his: 'ᚺᛁᛉ', as: 'ᚨᛉ', was: 'ᚹᛟᛉ', are: 'ᚨᚱ', were: 'ᚹᛖᚱ', one: 'ᚹᚨᚾ', once: 'ᚹᚨᚾᛊ',
    said: 'ᛊᛖᛞ', says: 'ᛊᛖᛉ', have: 'ᚺᚨᚹ', give: 'ᚷᛁᚹ', live: 'ᛚᛁᚹ', love: 'ᛚᚨᚹ', come: 'ᚲᚨᛗ',
    some: 'ᛊᚨᛗ', done: 'ᛞᚨᚾ', none: 'ᚾᚨᚾ', gone: 'ᚷᛟᚾ', does: 'ᛞᚨᛉ', goes: 'ᚷᛟᛉ',
    be: 'ᛒᛁ', he: 'ᚺᛁ', she: 'ᛊᛁ', we: 'ᚹᛁ', me: 'ᛗᛁ', they: 'ᚦᛖᛁ', there: 'ᚦᛖᚱ', their: 'ᚦᛖᚱ',
    where: 'ᚹᛖᚱ', what: 'ᚹᛟᛏ', who: 'ᚺᚢ', whom: 'ᚺᚢᛗ', whose: 'ᚺᚢᛉ', eye: 'ᚨᛁ', eyes: 'ᚨᛁᛉ',
    through: 'ᚦᚱᚢ', though: 'ᚦᛟ', thought: 'ᚦᛟᛏ', enough: 'ᛁᚾᚨᚠ', laugh: 'ᛚᚨᚠ', rough: 'ᚱᚨᚠ',
    tough: 'ᛏᚨᚠ', friend: 'ᚠᚱᛖᚾᛞ', people: 'ᛈᛁᛈᛚ', woman: 'ᚹᚢᛗᚨᚾ', women: 'ᚹᛁᛗᛁᚾ',
    heart: 'ᚺᚨᚱᛏ', great: 'ᚷᚱᛖᛁᛏ', any: 'ᛖᚾᛁ', many: 'ᛗᛖᚾᛁ', again: 'ᚨᚷᛖᚾ', been: 'ᛒᛁᚾ',
    know: 'ᚾᛟ', known: 'ᚾᛟᚾ', snow: 'ᛊᚾᛟ', slow: 'ᛊᛚᛟ', grow: 'ᚷᚱᛟ', show: 'ᛊᛟ', own: 'ᛟᚾ',
    sword: 'ᛊᛟᚱᛞ', island: 'ᚨᛁᛚᚨᚾᛞ', water: 'ᚹᛟᛏᛖᚱ', world: 'ᚹᛟᚱᛚᛞ', word: 'ᚹᛟᚱᛞ',
    could: 'ᚲᚢᛞ', would: 'ᚹᚢᛞ', should: 'ᛊᚢᛞ', put: 'ᛈᚢᛏ', full: 'ᚠᚢᛚ', wolf: 'ᚹᚢᛚᚠ',
    "there's": 'ᚦᛖᚱᛉ', "it's": 'ᛁᛏᛊ', "i'm": 'ᚨᛁᛗ', "don't": 'ᛞᛟᚾᛏ', "can't": 'ᚲᚨᚾᛏ',
  };

  // Tried in order at each position of the word. start: only at the beginning.
  const SOUND_RULES = [
    { re: /^kn/, out: 'ᚾ', start: true }, { re: /^gn/, out: 'ᚾ', start: true },
    { re: /^wr/, out: 'ᚱ', start: true }, { re: /^ps/, out: 'ᛊ', start: true },
    { re: /^gh/, out: 'ᚷ', start: true },
    { re: /^igh/, out: 'ᚨᛁ' }, { re: /^eigh/, out: 'ᛖᛁ' }, { re: /^augh/, out: 'ᛟ' }, { re: /^ough/, out: 'ᛟ' },
    { re: /^gh/, out: '' }, // silent, as in "night"
    { re: /^tch/, out: 'ᛏᛊ' }, { re: /^chr/, out: 'ᚲᚱ' }, { re: /^ch/, out: 'ᛏᛊ' },
    { re: /^sh/, out: 'ᛊ' }, { re: /^th/, out: 'ᚦ' }, { re: /^ph/, out: 'ᚠ' }, { re: /^wh/, out: 'ᚹ' },
    { re: /^ck/, out: 'ᚲ' }, { re: /^qu/, out: 'ᚲᚹ' }, { re: /^ng/, out: 'ᛜ' }, { re: /^nk/, out: 'ᛜᚲ' },
    { re: /^mb$/, out: 'ᛗ' },
    { re: /^ee/, out: 'ᛁ' }, { re: /^ea/, out: 'ᛁ' }, { re: /^oo/, out: 'ᚢ' },
    { re: /^ou/, out: 'ᚨᚢ' }, { re: /^ow/, out: 'ᚨᚢ' }, { re: /^ai/, out: 'ᛖᛁ' }, { re: /^ay/, out: 'ᛖᛁ' },
    { re: /^ei/, out: 'ᛖᛁ' }, { re: /^ey$/, out: 'ᛁ' }, { re: /^oa/, out: 'ᛟ' }, { re: /^oi/, out: 'ᛟᛁ' },
    { re: /^oy/, out: 'ᛟᛁ' }, { re: /^au/, out: 'ᛟ' }, { re: /^aw/, out: 'ᛟ' }, { re: /^ew/, out: 'ᛃᚢ' },
    { re: /^c(?=[eiy])/, out: 'ᛊ' }, { re: /^x/, out: 'ᚲᛊ' },
    // Long vowels marked by a silent e (see below): make, fire, home, rune, here
    { re: /^A/, out: 'ᛖᛁ' }, { re: /^I/, out: 'ᚨᛁ' }, { re: /^O/, out: 'ᛟ' }, { re: /^U/, out: 'ᚢ' }, { re: /^E/, out: 'ᛁ' },
  ];

  const SINGLE = {
    a: 'ᚨ', b: 'ᛒ', c: 'ᚲ', d: 'ᛞ', e: 'ᛖ', f: 'ᚠ', g: 'ᚷ', h: 'ᚺ', i: 'ᛁ', j: 'ᛃ', k: 'ᚲ', l: 'ᛚ', m: 'ᛗ',
    n: 'ᚾ', o: 'ᛟ', p: 'ᛈ', q: 'ᚲ', r: 'ᚱ', s: 'ᛊ', t: 'ᛏ', u: 'ᚢ', v: 'ᚹ', w: 'ᚹ', x: 'ᚲᛊ', z: 'ᛉ',
  };

  function spellEnglish(word) {
    let w = word.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/’/g, "'");
    if (ENGLISH_WORDS[w]) return ENGLISH_WORDS[w];
    w = w.replace(/'/g, '');
    if (ENGLISH_WORDS[w]) return ENGLISH_WORDS[w];

    // A silent e lengthens the vowel before it (mak-e → "mayk") and isn't said itself.
    w = w.replace(/(^|[^aeiou])([aeiou])([bcdfgklmnprstvz])e(s|d)?$/, (m, pre, v, c, suf) =>
      suf === 'd' && (c === 't' || c === 'd')
        ? m // "hated" keeps its e
        : pre + v.toUpperCase() + (c === 'c' ? 's' : c) + (suf || '')); // "nice" → "nIs"
    if (/[^aeiou]e$/.test(w) && /[aeiouAEIOU]/.test(w.slice(0, -1))) w = w.slice(0, -1);
    // A final "ow" is "o" in longer words (yellow, window) but "au" in short ones (how, now).
    if (/[aeiou][^aeiou]+ow$/.test(w)) w = w.slice(0, -2) + 'O';

    const hasOtherVowel = /[aeiouAEIOU]/.test(w);
    let out = '';
    for (let i = 0; i < w.length;) {
      const rest = w.slice(i);
      const rule = SOUND_RULES.find((r) => (!r.start || i === 0) && r.re.test(rest));
      if (rule) {
        out += rule.out;
        i += rest.match(rule.re)[0].length;
        continue;
      }
      const ch = w[i];
      if (ch === 'y') {
        // "yes" → ᛃ, "sky" → ᚨᛁ, "happy" → ᛁ
        out += i === 0 && /[aeiou]/.test(w[1] || '') ? 'ᛃ' : hasOtherVowel ? 'ᛁ' : 'ᚨᛁ';
      } else {
        out += SINGLE[ch] || '';
      }
      i++;
    }
    // Runes never write a doubled letter: "hall" → ᚺᚨᛚ.
    return out.replace(/(.)\1+/gu, '$1');
  }

  /**
   * Spell English text in runes.
   * mode 'sound' (default) spells words the way they are said;
   * 'letters' swaps letter for letter. Returns { runes, words: [{ word, runes }] }.
   */
  function englishToRunes(text, mode = 'sound') {
    const words = [];
    const runes = text.replace(/[A-Za-zÀ-ÿ]+(?:['’][A-Za-z]+)*/g, (word) => {
      const spelled = mode === 'letters' ? latinToRunes(word) : spellEnglish(word);
      words.push({ word, runes: spelled });
      return spelled;
    });
    return { runes, words };
  }

  root.RuneGlyphs = { compose, drawGlyph, latinToRunes, englishToRunes, RUNES, ALPHABETS, STYLES };
})(typeof self !== 'undefined' ? self : this);
