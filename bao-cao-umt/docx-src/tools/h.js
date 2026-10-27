// Hàm tiện ích cho nội dung
module.exports = {
  H1: (n, s, o = {}) => Object.assign({ t: 'h1', n, s }, o),
  H2: s => ({ t: 'h2', s }),
  H3: s => ({ t: 'h3', s }),
  P: (s, o) => ({ t: 'p', s, o }),
  UL: (...items) => ({ t: 'ul', items }),
  OL: (ref, ...items) => ({ t: 'ol', ref, items }),
  T: (key, cap, w, head, rows, src, o = {}) => Object.assign({ t: 'table', key, cap, w, head, rows, src }, o),
  F: (key, img, cap, src, w = 16) => ({ t: 'fig', key, img, cap, src, w }),
  G: (key, cols, items, cap, src) => ({ t: 'grid', key, cols, items, cap, src }),
  N: (title, p, kind) => ({ t: 'note', title, p, kind }),
  K: (items, cols = 4) => ({ t: 'kpi', items, cols }),
  chip: (c, s) => ({ chip: c, s }),
  PB: () => ({ t: 'pb' }),
};
