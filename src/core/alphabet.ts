const alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

/**
 * index number 2 letters
 * @example stringAt(26) ==> 'AA'
 * @param index
 */
export function stringAt(index: number): string {
  let str = '';
  let cindex = index;
  while (cindex >= alphabets.length) {
    cindex /= alphabets.length;
    cindex -= 1;
    str += alphabets[cindex % alphabets.length];
  }
  const last = index % alphabets.length;
  str += alphabets[last];
  return str;
}

/**
 * translate letter in A to number
 * @example indexAt('A') -> 0
 * @param str
 */
export function indexAt(str: string) {
  let ret = 0;
  const A = 'A'.charCodeAt(0);
  for (let i = 0; i < str.length - 1; i += 1) {
    const cindex = str.charCodeAt(i) - A;
    const exponet = str.length - 1 - i;
    ret += (alphabets.length ** exponet) + (alphabets.length * cindex);
  }
  ret += str.charCodeAt(str.length - 1) - A;
  return ret;
}


/**
 * translate A1-tag to XY-tag, B10 -> x,y
 * @param src
 */
export function expr2xy(src: string) {
  const reg = /^([A-Z]+)([0-9]+)$/;
  const res = src.match(reg);
  if (!res?.[1] || !res?.[2]) return [0, 0];
  return [indexAt(res?.[1]), parseInt(res?.[2], 10) - 1];
}

/**
 * translate XY-tag to A1-tag
 * @example [0, 0]  -> A1
 * @param x
 * @param y
 */
export function xy2expr(x: number, y: number) {
  return `${stringAt(x)}${y + 1}`;
}

/**
 * add tag(like A1) src by (xn, yn)
 * @example A1 1 1 -> B2
 * @param src
 * @param xn
 * @param yn
 * @param condition
 */
export function expr2expr(src: string, xn: number, yn: number, condition: (x: number, y: number) => true = () => true) {
  if (xn === 0 && yn === 0) return src;
  const [x, y] = expr2xy(src);
  if (!condition(x, y)) return src;
  return xy2expr(x + xn, y + yn);
}
