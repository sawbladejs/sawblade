import { spy, match, stub } from 'sinon';
import { expect } from 'chai';
import { Observable, Subject } from 'rxjs/Rx';
import bootstrap from './router';
import * as navigateModule from './navigate';

describe('router', () => {
  it('should unsubscribe from URL changes on teardown', () => {
    const unsubscribe = spy();
    bootstrap(null, [], Observable.create(() => unsubscribe))();
    expect(unsubscribe).to.be.called;
  });

  it('should tear down active routes on teardown', () => {
    const routeTeardown = spy();
    const url = new Subject();
    const teardown = bootstrap(null, [ { path: '/', teardown: routeTeardown } ], url);
    url.next('/');
    teardown();
    expect(routeTeardown).to.be.called;
  });

  describe('given a route configuration', () => {
    const root = 'root context';
    const url = new Subject();
    const navigateImpl = 'navigate implementation';

    let teardown;

    function configure(routes) {
      teardown = bootstrap(root, routes, url, navigateImpl);
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
      expect(update).to.be.calledWith(match({ params: { id: 'newid' }, context }));
    });

    it('should update a child route when parent route parameters change', () => {
      const update = spy();
      configure([ { path: '/users', children: [ { path: '/bio', update } ] } ]);
      url.next('/users;id=user1/bio');
      url.next('/users;id=user2/bio');
      expect(update).to.be.calledWith(match.has('params', match.has('id', 'user2')));
    });

    it('should merge parent and child route parameters into a single params object when rendering', () => {
      const render = spy();
      configure([ { path: '/:id', children: [ { path: '/photos', render } ] } ]);
      url.next('/user1/photos;view=all');
      expect(render).to.be.calledWith(match.has('params', match({ id: 'user1', view: 'all' })));
    });

    it('should merge parent and child route parameters into a single params object when updating', () => {
      const update = spy();
      configure([ { path: '/:id', children: [ { path: '/photos', update } ] } ]);
      url.next('/user1/photos;view=all');
      url.next('/user2/photos;view=none');
      expect(update).to.be.calledWith(match.has('params', match({ id: 'user2', view: 'none' })));
    });

    it('should update the child route when the parent route parameters change', () => {
      const update = spy();
      configure([ { path: '/:id', children: [ { path: '/photos', update } ] } ]);
      url.next('/user1/photos');
      url.next('/user2/photos');
      expect(update).to.be.called;
    });

    it('should tear down routes providing the context', () => {
      const context = 'expected context';
      const teardown = spy();
      configure([ { path: '/a', render: () => context, teardown }, { path: '/b' } ]);
      url.next('/a');
      url.next('/b');
      expect(teardown).to.be.calledWith(context);
    });

    it('should not tear down a parent route when the active child route changes', () => {
      const teardown = spy();
      configure([ { path: '/users', teardown, children: [ { path: '/list' }, { path: '/:id' } ] } ]);
      url.next('/users/list');
      url.next('/users/123');
      expect(teardown).not.to.be.called;
    });

    it('should tear down routes in order of specificity', () => {
      const teardownParent = spy();
      const teardownChild = spy();
      configure([
        { path: '/c' },
        { path: '/a', teardown: teardownParent, children: [ { path: '/b', teardown: teardownChild } ] }
      ]);
      url.next('/a/b');
      url.next('/c');
      expect(teardownChild).to.be.calledBefore(teardownParent);
    });

    it('should convert integer parameters to the appropriate type', () => {
      const render = spy();
      configure([ { path: '/', render } ]);
      url.next('/;id=123');
      expect(render).to.be.calledWith(match.has('params', match({ id: 123 })));
    });

    it('should inject a contextual navigate function into the route render function', () => {
      const render = spy();
      const navigateFactory = stub(navigateModule, 'default');
      const expected = 'contextual navigate function';
      navigateFactory.withArgs('/users', navigateImpl).returns(expected);
      configure([ { path: '/users', render, children: [ { path: '/list' } ] } ]);
      url.next('/users/list');
      navigateFactory.restore();
      expect(render).to.be.calledWith(match.has('navigate', expected));
    });
  });
});
