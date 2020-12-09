import { expr2expr, expr2xy, indexAt, stringAt, xy2expr } from '../../src/core/alphabet';

describe('core/alphabet', () => {
  it('stringAt', () => {
    // assert(stringAt(10) === 'A');
    expect(stringAt(0)).toBe('A');
    expect(stringAt(25)).toBe('Z');
  });

  it('indexAt', () => {
    expect(indexAt('A')).toBe(0);
    expect(indexAt('Z')).toBe(25);
    expect(indexAt('AA')).toBe(26);
    expect(indexAt('AAZ')).toBe(1 * (26 ** 2) + 1 * 26 + 25);
  });

  it('expr2xy', () => {
    expect(expr2xy('A1')).toEqual([0, 0]);
    expect(expr2xy('AA12')).toEqual([26, 11]);
    expect(expr2xy('23')).toEqual([0, 0]);
  });

  it('xy2expr', () => {
    expect(xy2expr(0, 0)).toBe('A1');
    expect(xy2expr(26, 11)).toBe('AA12');
  });

  it('expr2expr', () => {
    expect(expr2expr('A1', 1, 1)).toBe('B2');
    expect(expr2expr('A1', 2, 3)).toBe('C4');
  });
});
