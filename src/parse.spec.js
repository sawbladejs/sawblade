import { expect } from 'chai';
import parse from './parse';

describe('parse', () => {
  describe('when the location hash is null/undefined', () => {
    it('should return an empty array', () => {
      expect(parse()).to.deep.equal([]);
    });
  });

  describe('when the location hash is empty', () => {
    it('should return an empty array', () => {
      expect(parse('#')).to.deep.equal([]);
    });
  });

  describe('without params', () => {
    it('should parse the hash into segment strings', () => {
      expect(parse('#/a/b/c')).to.deep.equal(['a', 'b', 'c']);
    });
  });

  describe('with params', () => {
    it('should parse the hash into segment objects', () => {
      expect(parse('#/a;page=1;x=y/b')).to.deep.equal([ { path: 'a', query: { page: 1, x: 'y' } }, 'b' ]);
    });
  });
});
