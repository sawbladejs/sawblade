export default function watch(url) {
  return function route(path, callback) {
    let currentUrl = '';
    url(newUrl => {
      if (newUrl.startsWith(path) && !currentUrl.startsWith(path)) {
        callback({
          route: (subpath, callback) => route(path + subpath, callback),
          params: newUrl
            .substring(path.length)
            .split(';')
            .filter(param => param)
            .map(param => param.split('='))
            .map(param => ({ [param[0]]: isNaN(param[1]) ? param[1] : parseInt(param[1]) }))
            .reduce((params, param) => Object.assign({}, params, param), {})
        });
      }
      currentUrl = newUrl;
    });
  };
}
