export function bootstrap(root, routeConfigs, urlProvider) {
  urlProvider.observe(createRouter(root, routeConfigs));
}

function createRouter(root, routeConfigs) {
  let previousRouteInstances = [];

  return function handleUrlChange(url) {
    const nextRouteInstances = createRouteInstances(url, routeConfigs);

    previousRouteInstances
      .filter(previous => !nextRouteInstances.find(next => previous.equals(next)))
      .reverse()
      .forEach(routeInstance => routeInstance.teardown());

    nextRouteInstances
      .map(next => ({
        previous: previousRouteInstances.find(previous => previous.equals(next)),
        next
      }))
      .filter(({ previous }) => previous)
      .forEach(({ previous, next }) => next.context = previous.context);

    nextRouteInstances
      .filter(routeInstance => !routeInstance.context)
      .map(routeInstance => ({ routeInstance, position: nextRouteInstances.indexOf(routeInstance) }))
      .forEach(({ routeInstance, position }) => routeInstance.context = routeInstance.routeConfig.render({
        parent: position < 1 ? root : nextRouteInstances[position - 1].context,
        params: getParams(routeInstance.segment, routeInstance.routeConfig.path)
      }));

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

  equals(other) {
    return this.segment === other.segment && this.routeConfig === other.routeConfig;
  }

  teardown() {
    this.routeConfig.teardown(this.context);
  }
}

function getParams(segment, configPath) {
  const segments = segment.split(';');

  const params = segments.slice(1)
    .map(param => param.split('='))
    .map(param => ({ [param[0]]: normalizeParamValue(param[1]) }))
    .reduce((params, param) => Object.assign({}, params, param), {});

  if (configPath.startsWith('/:')) {
    params[configPath.substring(2)] = normalizeParamValue(segments[0].substring(1));
  }

  return params;
}

function normalizeParamValue(value) {
  return isNaN(value) ? value : parseInt(value);
}
