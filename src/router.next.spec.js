import { spy, match } from 'sinon';
import { expect } from 'chai';
import { Observable, Subject } from 'rxjs/Rx';
import { bootstrap } from './router.next';

describe('router', () => {
  it('should unsubscribe from URL changes on teardown', () => {
    const unsubscribe = spy();
    bootstrap(null, [], Observable.create(() => unsubscribe))();
    expect(unsubscribe).to.be.called;
  });

  describe('given a route configuration', () => {
    const root = 'root context';
    const url = new Subject();

    let teardown;

    function configure(routes) {
      teardown = bootstrap(root, routes, url);
    }

    afterEach(() => teardown());

    it('should activate top-level routes with the root context', () => {
      const render = spy();
      configure([ { path: '/', render } ]);
      url.next('/');
      expect(render).to.be.calledWith(match.has('parent', root));
    });

    it('should activate only the matching route', () => {
      const notExpectedRender = spy();
      const expectedRender = spy();
      configure([ { path: '/huh', render: notExpectedRender }, { path: '/whatever', render: expectedRender } ]);
      url.next('/whatever');
      expect(notExpectedRender).not.to.be.called;
      expect(expectedRender).to.be.called;
    });

    it('should match a parameterized path', () => {
      const render = spy();
      configure([ { path: '/:id', render } ]);
      url.next('/abcdef');
      expect(render).to.be.calledWith(match.has('params', match.has('id', 'abcdef')));
    });

    it('should not activate non-matching child routes', () => {
      const render = spy();
      configure([ { path: '/a', children: [ { path: '/b', render } ] } ]);
      url.next('/a');
      expect(render).not.to.be.called;
    });

    it('should activate matching child routes with the parent context', () => {
      const parent = 'expected parent context';
      const render = spy();
      configure([ { path: '/a', render: () => parent, children: [ { path: '/b', render } ] } ]);
      url.next('/a/b');
      expect(render).to.be.calledWith(match.has('parent', parent));
    });

    it('should update a route with the context and updated parameters when the parameters change', () => {
      const update = spy();
      const context = 'expected context';
      configure([ { path: '/:id', render: () => context, update } ]);
      url.next('/whatever');
      url.next('/newid');
      expect(update).to.be.calledWith(match.has('params', match.has('id', 'newid')));
    });

    it('should update a child route when parent route parameters change', () => {
      
    });
  });
});
