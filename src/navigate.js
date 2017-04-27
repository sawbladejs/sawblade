export default function navigate(currentUrl, navigateImpl) {
  return function _navigate(nextUrl) {
    navigateImpl(link(nextUrl));
  };

  function link(url) {
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
}
