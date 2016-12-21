import { expect } from 'chai';
import { stub, spy, match } from 'sinon';
import watch from './watch';

describe('watch (configured with a URL provider)', () => {
  const rootContext = 'root context';

  let route;
  let changeUrl;

  beforeEach(() => route = watch(callback => changeUrl = callback));

  describe('when configured with two root-level routes', () => {
    const defaultRender = stub();
    const defaultContext = 'default context';
    defaultRender.returns(defaultContext);
    const defaultTeardown = spy();

    const usersRender = stub();
    const usersContext = 'users context';
    usersRender.returns(usersContext);
    const usersTeardown = spy();

    beforeEach(() => {
      route(rootContext, [
        {
          path: '/',
          render: defaultRender,
          teardown: defaultTeardown
        },
        {
          path: '/users',
          render: usersRender,
          teardown: usersTeardown
        }
      ]);
    });

    afterEach(() => [defaultRender, defaultTeardown, usersRender, usersTeardown].forEach(spy => spy.reset()));

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

        it('should tear down the users route and re-activate with new params', () => {
          expect(usersTeardown).to.have.been.called;
          expect(usersRender).to.have.been.calledWith(match.has('params', match({ page: 4 })))
        });
      });
    });
  });

  describe('when configured with a route with a named parameter', () => {
    const render = spy();

    beforeEach(() => {
      route(rootContext, [
        {
          path: '/:id',
          render
        }
      ]);
    });

    afterEach(() => render.reset());

    describe('when the URL changes to /blah', () => {
      beforeEach(() => changeUrl('/blah'));

      it('should provide the id parameter value "blah" to the render method', () => {
        expect(render).to.have.been.calledWith(match.has('params', { id: 'blah' }));
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

    beforeEach(() => {
      route(rootContext, [
        {
          path: '/users',
          render: usersRender,
          teardown: usersTeardown,
          children: [
            {
              path: '/list',
              render: listRender,
              teardown: listTeardown
            },
            {
              path: '/:id',
              render: detailRender,
              teardown: () => {}
            }
          ]
        }
      ]);
    });

    afterEach(() => [usersRender, usersTeardown, listRender, listTeardown, detailRender].forEach(spy => spy.reset()));

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
      });
    });
  });
});