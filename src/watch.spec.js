import { spy } from 'sinon';
import { expect } from 'chai';
import watch from './watch';

describe('watch', () => {
  describe('given a URL provider', () => {
    let url;
    let route;

    function changeUrl(newUrl) {
      for (let i = 0; i < url.callCount; i++) {
        url.getCall(i).args[0](newUrl);
      }
    }

    beforeEach(() => {
      url = spy();
      route = watch(url);
    });

    describe('when configured only with empty root route', () => {
      const callback = spy();

      beforeEach(() => route('', callback));

      afterEach(() => callback.reset());

      describe('when the URL changes to /hello', () => {
        beforeEach(() => changeUrl('/hello'));

        it('should invoke the callback', () => {
          expect(callback).to.have.been.called;
        });

        describe('and then changes to /goodbye', () => {
          beforeEach(() => changeUrl('/goodbye'));

          it('should not invoke the callback a second time', () => {
            expect(callback.callCount).to.be.lessThan(2);
          });
        });
      });
    });

    describe('when configured with empty root route and sub-routes /posts and /users', () => {
      const postsCallback = spy();
      const usersCallback = spy();

      beforeEach(() => {
        route('', ({ route }) => {
          route('/posts', postsCallback);
          route('/users', usersCallback);
        });
      });

      afterEach(() => [postsCallback, usersCallback].forEach(callback => callback.reset()));

      describe('when the URL changes to /posts', () => {
        beforeEach(() => changeUrl('/posts'));

        it('should invoke the posts callback', () => {
          expect(postsCallback).to.have.been.called;
        });
      });

      describe('when the URL changes to /users;page=3;sort=asc', () => {
        beforeEach(() => changeUrl('/users;page=3;sort=asc'));

        it('should invoke the users callback', () => {
          expect(usersCallback).to.have.been.called;
        });

        it('should pass parameters to callback', () => {
          let params = null;
          if (usersCallback.called) {
            params = usersCallback.getCall(0).args[0].params;
          }
          expect(params).to.deep.equal({ page: 3, sort: 'asc' });
        });

        describe('when the URL changes to /users;page=4;sort=asc', () => {
          beforeEach(() => {
            usersCallback.reset();
            changeUrl('/users;page=4;sort=asc');
          });

          it('should invoke the users callback', () => {
            expect(usersCallback).to.have.been.called;
          });

          it('should pass parameters to callback', () => {
            let params = null;
            if (usersCallback.called) {
              params = usersCallback.getCall(1).args[0].params;
            }
            expect(params).to.deep.equal({ page: 4, sort: 'asc' });
          });
        });
      });
    });
  });
});
