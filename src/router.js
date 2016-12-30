let urlProvider;

export function bootstrap(root, routeConfigs, _urlProvider_) {
  urlProvider = _urlProvider_;
  urlProvider.observe(createRouter(root, routeConfigs));
}

export function navigate(url) {
  urlProvider.set(link(url));
}

function createRouter(root, routeConfigs) {
  let previousRouteInstances = [];

  return function handleUrlChange(url) {
    const nextRouteInstances = createRouteInstances(url, routeConfigs);

    previousRouteInstances
      .filter(previous => !nextRouteInstances.find(next => previous.sameConfig(next)))
      .reverse()
      .forEach(routeInstance => routeInstance.teardown());

    nextRouteInstances
      .map(next => ({
        previous: previousRouteInstances.find(previous => previous.sameConfig(next)),
        next
      }))
      .filter(({ previous }) => previous)
      .forEach(({ previous, next }) => {
        next.context = previous.context;
        next.update();
      });

    nextRouteInstances
      .filter(routeInstance => !routeInstance.context)
      .map(routeInstance => ({ routeInstance, position: nextRouteInstances.indexOf(routeInstance) }))
      .forEach(({ routeInstance, position }) => {
        routeInstance.render(position < 1 ? root : nextRouteInstances[position - 1].context);
      });

      previousRouteInstances = nextRouteInstances;
  };
}

function createRouteInstances(url, routeConfigs) {
  const segment = url.match(/(\/[^/]*)/)[0];
  const routeConfig = routeConfigs.find(configsMatching(segment));
  const routeInstance = new RouteInstance(segment, routeConfig);
  const descendantUrl = url.substring(segment.length);
  const { children } = routeConfig;

  if (descendantUrl && children) {
    return [routeInstance].concat(createRouteInstances(descendantUrl, children));
  }

  return [routeInstance];
}

function configsMatching(segment) {
  return function(config) {
    const testSegment = segment.split(';')[0];

    if (config.path === testSegment) {
      return true;
    }

    if (config.path.startsWith('/:') && /^\/.+$/.test(testSegment)) {
      return true;
    }

    return false;
  };
}

class RouteInstance {
  constructor(segment, routeConfig) {
    this.segment = segment;
    this.routeConfig = routeConfig;
  }

  get params() {
    const { segment, routeConfig } = this;
    const { path } = routeConfig;

    const segments = segment.split(';');

    const params = segments.slice(1)
      .map(param => param.split('='))
      .map(param => ({ [param[0]]: normalizeParamValue(param[1]) }))
      .reduce((params, param) => Object.assign({}, params, param), {});

    if (path.startsWith('/:')) {
      params[path.substring(2)] = normalizeParamValue(segments[0].substring(1));
    }

    return params;
  }

  sameConfig(other) {
    return this.routeConfig === other.routeConfig;
  }

  render(parent) {
    return this.context = this.routeConfig.render({ parent, params: this.params });
  }

  update() {
    return this.routeConfig.update({ params: this.params, context: this.context });
  }

  teardown() {
    return this.routeConfig.teardown(this.context);
  }
}

function normalizeParamValue(value) {
  return isNaN(value) ? value : parseInt(value);
}

function link(url) {
  const currentUrl = urlProvider.get();

  if (url.startsWith(';')) {
    const currentUrlLastSegment = currentUrl.substring(currentUrl.lastIndexOf('/'));
    const currentUrlParams = currentUrlLastSegment
      .split(';')
      .slice(1)
      .map(param => param.split('='))
      .map(param => ({ [param[0]]: param[1] }))
      .reduce((params, param) => Object.assign({}, params, param), {});

    const newUrlParams = url
      .substring(1)
      .split(';')
      .map(param => param.split('='))
      .map(param => ({ [param[0]]: param[1] }))
      .reduce((params, param) => Object.assign({}, params, param), {});

    const params = Object.assign({}, currentUrlParams, newUrlParams);
    const urlParams = Object.keys(params).map(key => `;${key}=${params[key]}`).join('');

    return [
      currentUrl.substring(0, currentUrl.lastIndexOf('/')),
      currentUrl.substring(currentUrl.lastIndexOf('/')).split(';')[0],
      urlParams
    ].join('');
  }

  if (url.startsWith('/')) {
    return url;
  }

  if (url.startsWith('./')) {
    return currentUrl.substring(0, currentUrl.lastIndexOf('/')) + url.substring(1);
  }

  if (url.startsWith('../')) {
    return currentUrl
      .split('/')
      .slice(1)
      .map(segment => `/${segment}`)
      .filter((element, index, array) => index < array.length - 2)
      .concat(url.substring(2))
      .join('');
  }

  return currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1) + url;
}
