import { spy } from 'sinon';
import { expect } from 'chai';
import navigate from './navigate';

describe('navigate', () => {
  let _navigate, navigateImpl;

  beforeEach(() => navigateImpl = spy());

  describe('given a current URL of /users/', () => {
    beforeEach(() => _navigate = navigate('/users/', navigateImpl));

    describe('when called with /', () => {
      beforeEach(() => _navigate('/'));

      it('should navigate to /', () => {
        expect(navigateImpl).to.be.calledWith('/');
      });
    });

    describe('when called with /posts/', () => {
      beforeEach(() => _navigate('/posts/'));

      it('should navigate to /posts/', () => {
        expect(navigateImpl).to.be.calledWith('/posts/');
      });
    });

    describe('when called with 123', () => {
      beforeEach(() => _navigate('123'));

      it('should navigate to /users/123', () => {
        expect(navigateImpl).to.be.calledWith('/users/123');
      });
    });

    describe('when called with ./123', () => {
      beforeEach(() => _navigate('./123'));

      it('should navigate to /users/123', () => {
        expect(navigateImpl).to.be.calledWith('/users/123');
      });
    });

    describe('when called with ../posts', () => {
      beforeEach(() => _navigate('../posts'));

      it('should navigate to /posts', () => {
        expect(navigateImpl).to.be.calledWith('/posts');
      });
    });

    describe('when called with ;page=10', () => {
      beforeEach(() => _navigate(';page=10'));

      it('should navigate to /users/;page=10', () => {
        expect(navigateImpl).to.be.calledWith('/users/;page=10');
      });
    });
  });

  describe('given a current URL of /a/b/c', () => {
    beforeEach(() => _navigate = navigate('/a/b/c', navigateImpl));

    describe('when called with ../test', () => {
      beforeEach(() => _navigate('../test'));

      it('should navigate to /a/b/test', () => {
        expect(navigateImpl).to.be.calledWith('/a/test');
      });
    });

    describe('when called with ./test', () => {
      beforeEach(() => _navigate('./test'));

      it('should navigate to /a/b/test', () => {
        expect(navigateImpl).to.be.calledWith('/a/b/test');
      });
    });

    describe('when called with test', () => {
      beforeEach(() => _navigate('test'));

      it('should navigate to /a/b/test', () => {
        expect(navigateImpl).to.be.calledWith('/a/b/test');
      });
    });

    describe('when called with ;page=3;x=y', () => {
      beforeEach(() => _navigate(';page=3;x=y'));

      it('should navigate to /a/b/c;page=3;x=y', () => {
        expect(navigateImpl).to.be.calledWith('/a/b/c;page=3;x=y');
      });
    });
  });

  describe('given an initial URL of /a/b;c=d;e=f', () => {
    beforeEach(() => _navigate = navigate('/a/b;c=d;e=f', navigateImpl));

    describe('when called with ;c=g', () => {
      beforeEach(() => _navigate(';c=g'));

      it('should navigate to /a/b;c=g;e=f', () => {
        expect(navigateImpl).to.be.calledWith('/a/b;c=g;e=f');
      });
    });
  });
});
