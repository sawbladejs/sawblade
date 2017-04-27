import navigateFactory from './navigate';

export default function bootstrap(root, config, url, navigate) {
  class Route {
    constructor(subpath, config, parent) {
      this.subpath = subpath;
      this.config = config;
      this.parent = parent;

      if (config.render) {
        this.context = config.render({
          parent: this.parent ? this.parent.context : root,
          params: this.params,
          navigate: navigateFactory(this.path, navigate)
        });
      }
    }

    get params() {
      return Object.assign({}, this.parent ? this.parent.params : null, getParams(this.config, this.subpath));
    }

    get path() {
      return this.parent ? [this.parent.path, this.subpath].join('') : this.subpath;
    }

    matchesSubpath(subpath) {
      return configMatchesSubpath(this.config, subpath);
    }

    update(subpath) {
      this.subpath = subpath;
      const { update } = this.config;
      update && update({ params: this.params, context: this.context });
    }

    teardown() {
      const { teardown } = this.config;
      teardown && teardown(this.context);
    }
  }

  const routes = [];

  const subscription = url.subscribe(url => {
    const path = urlToPath(url);

    const invalid = routes.findIndex((route, index) => !route.matchesSubpath(path[index]));
    invalid !== -1 && routes.splice(invalid).reverse().forEach(route => route.teardown());

    routes.forEach((route, index) => route.update(path[index]));

    for (let i = routes.length; i < path.length; i++) {
      const subpath = path[i];
      const parent = i === 0 ? null : routes[i - 1];
      const configs = parent ? parent.config.children : config;
      const matchingConfig = findConfig(configs, subpath);
      routes.push(new Route(subpath, matchingConfig, parent));
    }
  });

  return function teardown() {
    routes.splice(0).reverse().forEach(route => route.teardown());
    subscription.unsubscribe();
  };
}

function urlToPath(url) {
  return url.substring(1).split('/').map(subpath => `/${subpath}`);
}

function findConfig(configs, subpath) {
  const testSubpath = subpath.split(';')[0];
  const matchingConfig = configs.find(config => configMatchesSubpath(config, subpath));
  if (!matchingConfig) {
    throw new Error(`No matching configuration found for path ${subpath}!`);
  }
  return matchingConfig;
}

function configMatchesSubpath({ path }, subpath) {
  const testSubpath = subpath.split(';')[0];
  return testSubpath === path || (path.startsWith('/:') && /^\/.+$/.test(testSubpath));
}

function getParams({ path: configPath }, subpath) {
  const params = subpath
    .split(';')
    .slice(1)
    .map(param => param.split('='))
    .map(([ key, value ]) => ({ [key]: normalizeParameter(value) }))
    .reduce((params, param) => Object.assign({}, params, param), {});

  if (configPath.startsWith('/:')) {
    Object.assign(params, { [configPath.substring(2)]: subpath.split(';')[0].substring(1) });
  }

  return params;
}

function normalizeParameter(value) {
  return /^[0-9]+$/.test(value) ? parseInt(value) : value;
}
