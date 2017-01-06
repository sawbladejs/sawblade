sawblade
========

Introduction
------------
This is a lightweight, framework-agnostic client-side JavaScript routing library.

Motivation
----------
I was loving [Svelte](https://github.com/sveltejs/svelte), but it didn't have a routing service. I knew there were other routers out there, so I began my search. My criteria included:
* Framework agnosticism (because it needed to work with a Svelte component)
* Friendly to Svelte's component lifecycle and API
* Composable routing configuration (because I like to break routing configuration apart into multiple modules)
* Hierarchical routes
* Route parameters

As you've probably already guessed, nothing matched (at least as far as I could tell), so this project was born.

Example
-------
```
import { bootstrap } from 'sawblade';
import HashUrlProvider from 'sawblade-hash';
import App from './App';
import Default from './Default';
import Users from './Users';
import UserList from './UserList';
import UserDetail from './UserDetail';

bootstrap(new App({ target: document.getElementById('app') }), [
  {
    path: '/',
    render: ({ parent: app }) => new Default({ target: app.refs.outlet }),
    teardown: defaultInstance => defaultInstance.teardown()
  },
  {
    path: '/users',
    render: ({ parent: app }) => new Users({ target: app.refs.outlet }),
    teardown: users => users.teardown(),
    children: [
      {
        path: '/',
        render: ({ parent: users, params }) => {
          return new UserList({ target: users.refs.outlet, data: { page: params.page } });
        },
        update: ({ context: userList, params }) => userList.set({ page: params.page }),
        teardown: userList => userList.teardown()
      },
      {
        path: '/:id',
        render: ({ parent: users, params }) => {
          return new UserDetail({ target: users.refs.outlet, data: { id: params.id } });
        },
        update: ({ context: userDetail, params }) => userDetail.set({ id: params.id }),
        teardown: userDetail => userDetail.teardown()
      }
    ]
  }
], new HashUrlProvider());
```
For a more complete example, please review the [example project](https://github.com/sawbladejs/example).

Installation
------------
Install via npm:
```
npm i sawblade
npm i sawblade-hash # currently the only URL provider available; supports hash-based URLs like #/blah
```
Then import/require via your favorite module loader.

API
---
###bootstrap(root, routeConfiguration, urlProvider)
Activates the router.

**root**: The root context, i.e. the top-level element of your application. This is injected into the render function as the "parent" of any top-level routes in your route configuration.

**routeConfiguration**: An array of route configuration objects.

**urlProvider**: The URL provider, such as an instance of the hash URL provider class

###route configuration: { path, render, update, teardown, children }

**path**: The URL of the route relative to the parent route.

**render({ parent, params })**: A function that is invoked when the route is activated.
* The supplied *parent* parameter is the parent context (i.e. the return value of the parent route's render function; or, for top-level routes, the root context provided as the *root* parameter for *bootstrap*.
* The supplied *params* parameter is an object containing the route parameters.
* The return value of this function will be provided as the *context* parameter to the route's *update* function and as the only parameter to the route's *teardown* function.

**update({ context, params })**: A function that is invoked when the route parameters change.
* The supplied *context* parameter is the value returned by the corresponding *render* function.
* The supplied *params* parameter is an object containing the route parameters.

**teardown(context)**: A function that is invoked when the route is de-activated. As in the *update* method, the *context* parameter is the value returned by the corresponding *render* function.

**children**: An array of child routes.
