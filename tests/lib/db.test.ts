import { parseTotalCount } from '../../src/lib/db';

describe('lib/db', () => {
  describe('parseTotalCount', () => {
    it('Should return 0 when the array is empty', () => {
      const result = parseTotalCount([]);
      expect(result).toEqual(0);
    });

    it('Should extract the total property from the first item and return number', () => {
      const result = parseTotalCount([{ total: 12 }, { total: 10 }]);
      expect(result).toEqual(12);
    });
  });
});
