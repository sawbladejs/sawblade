import { expect } from 'chai';
import { stub, spy, match } from 'sinon';
import { bootstrap, navigate } from './router';

describe('router', () => {
  let changeUrl;

  const unsubscribe = spy();
  const rootContext = 'root context';
  const urlProvider = {
    get: stub(),
    set: spy(),
    observe(callback) {
      changeUrl = callback;
      return unsubscribe;
    }
  };

  function createRoutes(routes) {
    return bootstrap(rootContext, routes, urlProvider);
  }

  afterEach(() => [unsubscribe, urlProvider.set].forEach(resettable => resettable.reset()));

  describe('when configured with two root-level routes', () => {
    const defaultRender = stub();
    const defaultContext = 'default context';
    defaultRender.returns(defaultContext);
    const defaultTeardown = spy();

    const usersRender = stub();
    const usersContext = 'users context';
    usersRender.returns(usersContext);
    const usersUpdate = spy();
    const usersTeardown = spy();

    beforeEach(() => {
      createRoutes([
        {
          path: '/',
          render: defaultRender,
          update: () => {},
          teardown: defaultTeardown
        },
        {
          path: '/users',
          render: usersRender,
          update: usersUpdate,
          teardown: usersTeardown
        }
      ]);
    });

    afterEach(() => {
      [defaultRender, defaultTeardown, usersRender, usersUpdate, usersTeardown].forEach(spy => spy.reset());
    });

    describe('when the URL changes to /', () => {
      beforeEach(() => changeUrl('/'));

      it('should activate the default route with root context', () => {
        expect(defaultRender).to.have.been.calledWith(match.has('parent', rootContext));
      });

      it('should not activate the users route', () => {
        expect(usersRender).not.to.have.been.called;
      });

      describe('and then changes to /users', () => {
        beforeEach(() => changeUrl('/users'));

        it('should tear down the default route, providing the context', () => {
          expect(defaultTeardown).to.have.been.calledWith(defaultContext);
        });
      });
    });

    describe('when the URL changes to /users', () => {
      beforeEach(() => changeUrl('/users'));

      it('should activate the users route with root context', () => {
        expect(usersRender).to.have.been.calledWith(match.has('parent', rootContext));
      });

      it('should not activate the default route', () => {
        expect(defaultRender).not.to.have.been.called;
      });

      describe('and then changes to /', () => {
        beforeEach(() => changeUrl('/'));

        it('should tear down the users route, providing the context', () => {
          expect(usersTeardown).to.have.been.calledWith(usersContext);
        });
      });
    });

    describe('when the URL changes to /users;x=y;page=3', () => {
      beforeEach(() => changeUrl('/users;x=y;page=3'));

      it('should provide the matrix parameters to the render function', () => {
        expect(usersRender).to.have.been.calledWith(match.has('params', match({ x: 'y', page: 3 })));
      });

      describe('and then changes to /users;x=y;page=4', () => {
        beforeEach(() => changeUrl('/users;x=y;page=4'));

        it('should update the users route with new params', () => {
          expect(usersUpdate).to.have.been.calledWithMatch(({ context, params }) => {
            return context === usersContext && params.page === 4;
          });
        });
      });
    });
  });

  describe('when configured with a route with a named parameter', () => {
    const render = spy();
    const update = spy();

    beforeEach(() => {
      createRoutes([
        {
          path: '/:id',
          render,
          update,
          teardown: () => {}
        }
      ]);
    });

    afterEach(() => [render, update].forEach(spy => spy.reset()));

    describe('when the URL changes to /blah', () => {
      beforeEach(() => changeUrl('/blah'));

      it('should provide the id parameter value "blah" to the render method', () => {
        expect(render).to.have.been.calledWith(match.has('params', match({ id: 'blah' })));
      });

      describe('and then changes to /whatever', () => {
        beforeEach(() => changeUrl('/whatever'));

        it('should provide the id parameter value "whatever" to the update method', () => {
          expect(update).to.have.been.calledWith(match({ params: { id: 'whatever' } }));
        });
      });
    });
  });

  describe('when configured with child routes', () => {
    const usersRender = stub();
    const usersContext = 'users context';
    usersRender.returns(usersContext);
    const usersTeardown = spy();

    const listRender = stub();
    const listContext = 'list context';
    listRender.returns(listContext);
    const listTeardown = spy();

    const detailRender = spy();
    const detailTeardown = spy();

    let teardown;

    beforeEach(() => {
      teardown = createRoutes([
        {
          path: '/users',
          render: usersRender,
          update: () => {},
          teardown: usersTeardown,
          children: [
            {
              path: '/list',
              render: listRender,
              update: () => {},
              teardown: listTeardown
            },
            {
              path: '/:id',
              render: detailRender,
              update: () => {},
              teardown: detailTeardown
            }
          ]
        }
      ]);
    });

    afterEach(() => {
      [
        usersRender,
        usersTeardown,
        listRender,
        listTeardown,
        detailRender,
        detailTeardown
      ].forEach(spy => spy.reset());
    });

    describe('when the URL changes to /users/list', () => {
      beforeEach(() => changeUrl('/users/list'));

      it('should activate the users route', () => {
        expect(usersRender).to.have.been.called;
      });

      it('should activate the list route with the users context', () => {
        expect(listRender).to.have.been.calledWith(match.has('parent', usersContext));
      });

      describe('and then the URL changes to /users/123', () => {
        beforeEach(() => changeUrl('/users/123'));

        it('should tear down the list route', () => {
          expect(listTeardown).to.have.been.called;
        });

        it('should not tear down the users route', () => {
          expect(usersTeardown).not.to.have.been.called;
        });

        it('should activate the detail route', () => {
          expect(detailRender).to.have.been.calledWith(match.has('params', match({ id: 123 })));
        });

        describe('and then the router is torn down', () => {
          beforeEach(() => teardown());

          it('should tear down the routes', () => {
            expect(detailTeardown).to.have.been.called;
            expect(usersTeardown).to.have.been.called;
            expect(detailTeardown).to.have.been.calledBefore(usersTeardown);
          });

          it('should unsubscribe from the URL provider', () => {
            expect(unsubscribe).to.have.been.called;
          });
        });
      });
    });
  });

  describe('when configured with a route with no render/teardown methods', () => {
    beforeEach(() => createRoutes([ { path: '/' }, { path: '/other', render: () => {} } ]));

    it('should not throw when the route is activated', () => changeUrl('/'));

    it('should not throw when the route is deactivated', () => {
      changeUrl('/');
      changeUrl('/other');
    });
  });

  describe('when configured with a route with no update method', () => {
    beforeEach(() => {
      createRoutes([
        {
          path: '/',
          render: () => {},
          teardown: () => {}
        }
      ]);
    });

    it('should not throw when the route is updated', () => {
      changeUrl('/');
      changeUrl('/;page=3');
    });
  });

  describe('when configured with parameterized route with another parameterized route as its parent', () => {
    let render, update;

    beforeEach(() => {
      render = spy();
      update = spy();

      createRoutes([
        {
          path: '/:categoryId',
          render: () => {},
          teardown: () => {},
          children: [
            {
              path: '/:postId',
              render,
              update,
              teardown: () => {}
            }
          ]
        }
      ]);
    });

    describe('when the URL changes to /321/123', () => {
      beforeEach(() => changeUrl('/321/123'));

      it('should provide parent and child route parameters to the child route', () => {
        expect(render).to.have.been.calledWith(match.has('params', { categoryId: 321, postId: 123 }));
      });

      describe('and then the URL changes to /322/123', () => {
        beforeEach(() => changeUrl('/322/123'));

        it('should update the child route, including parent route parameters', () => {
          expect(update).to.have.been.calledWith(match.has('params', { categoryId: 322, postId: 123 }));
        });
      });
    });
  });

  describe('navigate function', () => {
    describe('given a current URL of /users/', () => {
      beforeEach(() => urlProvider.get.returns('/users/'));

      describe('when called with /', () => {
        beforeEach(() => navigate('/'));

        it('should navigate to /', () => {
          expect(urlProvider.set).to.have.been.calledWith('/');
        });
      });

      describe('when called with /posts/', () => {
        beforeEach(() => navigate('/posts/'));

        it('should navigate to /posts/', () => {
          expect(urlProvider.set).to.have.been.calledWith('/posts/');
        });
      });

      describe('when called with 123', () => {
        beforeEach(() => navigate('123'));

        it('should navigate to /users/123', () => {
          expect(urlProvider.set).to.have.been.calledWith('/users/123');
        });
      });

      describe('when called with ./123', () => {
        beforeEach(() => navigate('./123'));

        it('should navigate to /users/123', () => {
          expect(urlProvider.set).to.have.been.calledWith('/users/123');
        });
      });

      describe('when called with ../posts', () => {
        beforeEach(() => navigate('../posts'));

        it('should navigate to /posts', () => {
          expect(urlProvider.set).to.have.been.calledWith('/posts');
        });
      });

      describe('when called with ;page=10', () => {
        beforeEach(() => navigate(';page=10'));

        it('should navigate to /users/;page=10', () => {
          expect(urlProvider.set).to.have.been.calledWith('/users/;page=10');
        });
      });
    });

    describe('given a current URL of /a/b/c', () => {
      beforeEach(() => urlProvider.get.returns('/a/b/c'));

      describe('when called with ../test', () => {
        beforeEach(() => navigate('../test'));

        it('should navigate to /a/b/test', () => {
          expect(urlProvider.set).to.have.been.calledWith('/a/test');
        });
      });

      describe('when called with ./test', () => {
        beforeEach(() => navigate('./test'));

        it('should navigate to /a/b/test', () => {
          expect(urlProvider.set).to.have.been.calledWith('/a/b/test');
        });
      });

      describe('when called with test', () => {
        beforeEach(() => navigate('test'));

        it('should navigate to /a/b/test', () => {
          expect(urlProvider.set).to.have.been.calledWith('/a/b/test');
        });
      });

      describe('when called with ;page=3;x=y', () => {
        beforeEach(() => navigate(';page=3;x=y'));

        it('should navigate to /a/b/c;page=3;x=y', () => {
          expect(urlProvider.set).to.have.been.calledWith('/a/b/c;page=3;x=y');
        });
      });
    });

    describe('given an initial URL of /a/b;c=d;e=f', () => {
      beforeEach(() => urlProvider.get.returns('/a/b;c=d;e=f'));

      describe('when called with ;c=g', () => {
        beforeEach(() => navigate(';c=g'));

        it('should navigate to /a/b;c=g;e=f', () => {
          expect(urlProvider.set).to.have.been.calledWith('/a/b;c=g;e=f');
        });
      });
    });
  });
});
