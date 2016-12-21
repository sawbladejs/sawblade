export default function watch(handleUrlChanges) {
  let root;
  let config;

  let previousRouteInstances = [];

  handleUrlChanges(next => {
    const nextRouteInstances = createRouteInstances(next, config);

    previousRouteInstances
      .filter(previous => !nextRouteInstances.find(next => equalRouteInstances(previous, next)))
      .reverse()
      .forEach(instance => instance.config.teardown(instance.context));

    nextRouteInstances
      .map(next => ({
        previous: previousRouteInstances.find(previous => equalRouteInstances(previous, next)),
        next
      }))
      .filter(({ previous }) => previous)
      .forEach(({ previous, next }) => next.context = previous.context);

    nextRouteInstances
      .filter(instance => !instance.context)
      .map(instance => ({ instance, position: nextRouteInstances.indexOf(instance) }))
      .forEach(({ instance, position }) => instance.context = instance.config.render({
        parent: position < 1 ? root : nextRouteInstances[position - 1].context,
        params: getParams(instance.match, instance.config.path)
      }));

    previousRouteInstances = nextRouteInstances;
  });

  function createRouteInstances(url, config) {
    const match = url.match(/(\/[^/]*)/)[0];
    const matchConfig = config.find(config => configMatchesPath(config, match));
    const instance = createRouteInstance(match, matchConfig);
    const descendantUrl = url.substring(match.length);

    if (descendantUrl && matchConfig.children) {
      return [instance].concat(createRouteInstances(descendantUrl, matchConfig.children));
    }

    return [instance];
  }

  function createRouteInstance(match, config) {
    return { config, match };
  }

  function equalRouteInstances(instance1, instance2) {
    return instance1.config === instance2.config && instance1.match === instance2.match;
  }

  function configMatchesPath(config, path) {
    const testPath = path.split(';')[0];

    if (config.path === testPath) {
      return true;
    }

    if (config.path.startsWith('/:') && /^\/.+$/.test(testPath)) {
      return true;
    }

    return false;
  }

  function getParams(match, configPath) {
    const matchParts = match.split(';');

    const params = matchParts.slice(1)
      .map(param => param.split('='))
      .map(param => ({ [param[0]]: normalizeParamValue(param[1]) }))
      .reduce((params, param) => Object.assign({}, params, param), {});

    if (configPath.startsWith('/:')) {
      params[configPath.substring(2)] = normalizeParamValue(matchParts[0].substring(1));
    }

    return params;
  }

  function normalizeParamValue(value) {
    return isNaN(value) ? value : parseInt(value);
  }

  return function route(r, c) {
    root = r;
    config = c;
  };
}
