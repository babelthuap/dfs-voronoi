// distance function
const possibleMetics = {
  1: 1,
  2: 2,
  3: 3,
};
const metric =
    possibleMetics[new URLSearchParams(location.search).get('metric')] || 2;

export const dist = (metric == 1) ?
    // taxicab distance
    ((x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2)) :
    ((metric == 3) ? ((x1, y1, x2, y2) => {
      // cubic distance
      const dx = Math.abs(x1 - x2);
      const dy = Math.abs(y1 - y2);
      return dx * dx * dx + dy * dy * dy;
    }) :
                     ((x1, y1, x2, y2) => {
                       // euclidean distance
                       const dx = x1 - x2;
                       const dy = y1 - y2;
                       return dx * dx + dy * dy;
                     }));

// store two positive shorts in one int
// technically, x in [0, 2**16), y in [0, 2**15)
const MASK = 2 ** 15 - 1;
export const pair = (x, y) => (x << 15) | y;
export const unpair = n => [n >> 15, n & MASK];

// random int in [0, n)
export const rand = (n) => Math.floor(Math.random() * n);
