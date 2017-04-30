export default function navigate(currentUrl, navigateImpl) {
  return function _navigate(nextUrl) {
    navigateImpl(link(nextUrl));
  };

  function link(url, baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'))) {
    if (url.startsWith('/')) {
      return url;
    }

    if (url.startsWith('./')) {
      return [baseUrl, url.substring(2)].join('/');
    }

    if (url.startsWith('../')) {
      return link(url.substring(3), baseUrl.substring(0, baseUrl.lastIndexOf('/')))
    }

    if (url.startsWith(';')) {
      const lastSegmentIndex = currentUrl.lastIndexOf('/');
      const lastSegment = currentUrl.substring(lastSegmentIndex);

      const currentParams = lastSegment
        .split(';')
        .slice(1)
        .map(param => param.split('='))
        .map(([ key, value ]) => ({ [key]: value }))
        .reduce((params, param) => Object.assign({}, params, param), {});

       const newParams = url
        .substring(1)
        .split(';')
        .map(param => param.split('='))
        .map(([ key, value ]) => ({ [key]: value }))
        .reduce((params, param) => Object.assign({}, params, param), {});

       const mergedParams = Object.assign({}, currentParams, newParams);

       const params = Object.keys(mergedParams).map(key => `${key}=${mergedParams[key]}`).join(';');

       return currentUrl.substring(0, lastSegmentIndex) + lastSegment.split(';')[0] + ';' + params;
    }

    return [baseUrl, url].join('/');
  }
}
