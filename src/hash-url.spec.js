import { spy } from 'sinon';
import { expect } from 'chai';
import hashUrl, { cleanup } from './hash-url';

describe('hashUrl (URL provider)', () => {
  let callback;

  beforeEach(() => callback = spy());

  afterEach(cleanup);

  describe('when window.location.hash is undefined', () => {
    describe('when invoked', () => {
      beforeEach(() => hashUrl(callback));

      it('should invoke the callback with /', () => {
        expect(callback).to.have.been.calledWith('/');
      });
    });
  });

  describe('when window.location.hash is empty', () => {
    beforeEach(() => window.location.hash = '#');

    afterEach(() => window.location.hash = null);

    describe('when invoked', () => {
      beforeEach(() => hashUrl(callback));

      it('should invoke the callback with /', () => {
        expect(callback).to.have.been.calledWith('/');
      });
    });
  });

  describe('when window.location.hash is #/users', () => {
    const hash = '#/users';

    beforeEach(() => window.location.hash = hash);

    afterEach(() => window.location.hash = null);

    describe('when invoked', () => {
      beforeEach(() => hashUrl(callback));

      it('should invoke the callback with /users', () => {
        expect(callback).to.be.calledWith('/users');
      });

      describe('when window.location.hash changes to #/a/b/c', () => {
        beforeEach(() => {
          window.location.hash = '#/a/b/c';
          window.dispatchEvent(new HashChangeEvent('hashchange', { bubbles: true, cancelable: false }));
        });

        it('should invoke the callback with /a/b/c', () => {
          expect(callback).to.be.calledWith('/a/b/c');
        });
      });
    });
  });
});
