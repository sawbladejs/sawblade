import { spy, stub } from 'sinon';
import { expect } from 'chai';
import * as parseModule from './parse';
import sawblade from './';

describe('sawblade', () => {
  let parse;

  beforeEach(() => parse = stub(parseModule, 'default'));

  afterEach(() => parse.restore());

  describe('when invoked with a callback', () => {
    const callback = spy();

    beforeEach(() => sawblade(callback));

    afterEach(() => callback.reset());

    describe('when the location hash changes', () => {
      const hash = '#/a/b/c';
      const route = ['x', 'y', 'z'];

      beforeEach(() => {
        parse.withArgs(hash).returns(route);
        
        window.location.hash = hash;
        window.dispatchEvent(new HashChangeEvent('hashchange', { bubbles: true, cancelable: false }));
      });

      it('should invoke the callback with the parsed route', () => {
        expect(callback).to.be.calledWith(route);
      });
    });
  });
});
