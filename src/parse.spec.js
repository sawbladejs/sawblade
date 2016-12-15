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

  it('should parse the hash into segment objects', () => {
    const hash = '#/a;page=1;x=y/b';
    const expected = [
      { path: 'a', query: { page: 1, x: 'y' } },
      { path: 'b', query: {} }
    ];
    expect(parse(hash)).to.deep.equal(expected);
  });
});
