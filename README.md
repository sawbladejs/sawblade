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

Installation
------------
Install via npm:
```
npm i sawblade
npm i sawblade-hash # currently the only URL provider available; supports hash-based URLs like #/blah
```
Then import/require via your favorite module loader.

Documentation & Examples
------------------------
More formal documentation is forthcoming. For now, please review the [example project](https://github.com/sawbladejs/example) and [spec](https://github.com/sawbladejs/sawblade/blob/master/src/router.spec.js).
