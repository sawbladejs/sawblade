export default function watch(url) {
  return function route(path, callback) {
    let currentUrl = null;
    let currentParams = null;

    url(newUrl => {
      const newParams = newUrl
        .substring(path.length)
        .split(';')
        .filter(param => param)
        .map(param => param.split('='))
        .map(param => ({ [param[0]]: isNaN(param[1]) ? param[1] : parseInt(param[1]) }))
        .reduce((params, param) => Object.assign({}, params, param), {});

      const paramsChanged = JSON.stringify(newParams) !== JSON.stringify(currentParams);

      if (newUrl.startsWith(path) && (currentUrl === null || !currentUrl.startsWith(path) || paramsChanged)) {
        callback({
          route: (subpath, callback) => route(path + subpath, callback),
          params: newParams
        });
      }

      currentUrl = newUrl;
      currentParams = newParams;
    });
  };
}
