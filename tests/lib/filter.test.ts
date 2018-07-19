import { db } from '../../src/lib/db';
import { applyPagination, applySearch, applySorting } from '../../src/lib/filter';

describe('lib/filter', () => {
  describe('applyPagination', () => {
    it('Should return same query when filters does not contain pagination', () => {
      const originalQuery = db('myTable');
      const query = db('myTable');

      applyPagination(query, {});
      expect(query).toEqual(originalQuery);
    });
  });

  describe('applySorting', () => {
    it('Should return same query when filters does not contain sorting keys', () => {
      const originalQuery = db('myTable');
      const query = db('myTable');

      applySorting(query, {});
      expect(query).toEqual(originalQuery);
    });
  });

  describe('applySearch', () => {
    it('Should return same query when filters does not contain search key', () => {
      const originalQuery = db('myTable');
      const query = db('myTable');

      applySearch(query, {});
      expect(query).toEqual(originalQuery);
    });
  });
});
