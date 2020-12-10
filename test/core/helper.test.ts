import helper from '../../src/core/helper';

describe('helper', () => {
  describe('.cloneDeep()', () => {
    it('The modification of the returned value does not affect the original value', () => {
      const obj = { k: { k1: 'v' } };
      const obj1 = helper.cloneDeep(obj);
      obj1.k.k1 = 'v1';
      expect(obj.k.k1).toBe( 'v');
    });
  });
  describe('.merge()', () => {
    it('should return { a: \'a\' } where the value is { a: \'a\' }', () => {
      const merge = helper.merge({ a: 'a' });
      expect(merge.a).toBe( 'a');
    });
    it('should return {a: \'a\', b: \'b\'} where the value is {a: \'a\'}, {b: \'b\'}', () => {
      const merge = helper.merge({ a: 'a' }, { b: 'b' });
      expect(merge.a).toBe( 'a');
      expect(merge.b).toBe( 'b');
    });
    it('should return { a: { a1: \'a2\' }, b: \'b\' } where the value is {a: {a1: \'a1\'}, b: \'b\'}, {a: {a1: \'b\'}}', () => {
      const obj = { a: { a1: 'a1' }, b: 'b' };
      const merge = helper.merge(obj, { a: { a1: 'a2' } });
      expect(obj.a.a1).toBe( 'a1');
      expect(merge.a.a1).toBe( 'a2');
      expect(merge.b).toBe( 'b');
    });
  });
  // sum
  describe('.sum()', () => {
    it('should return [50, 3] where the value is [10, 20, 20]', () => {
      const [total, size] = helper.sum([10, 20, 20]);
      expect(total).toBe( 50);
      expect(size).toBe( 3);
    });
    it('should return [50, 3] where the value is {k1: 10, k2: 20, k3: 20}', () => {
      const [total, size] = helper.sum({ k1: 10, k2: 20, k3: 20 });
      expect(total).toBe( 50);
      expect(size).toBe( 3);
    });
  });
});
