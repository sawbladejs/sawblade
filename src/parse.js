export default function parse(hash) {
  if (!hash) {
    return [];
  }

  return hash
    .substring(2)
    .split('/')
    .filter(segment => segment)
    .map(parseSegment);
}

function parseSegment(segment) {
  const items = segment.split(';');
  const path = items[0];
  const params = items
    .slice(1)
    .map(item => item.split('='))
    .map(item => ({ [item[0]]: isNaN(item[1]) ? item[1] : parseInt(item[1]) }))
    .reduce((items, item) => Object.assign({}, items, item), {});
  return { path, params };
}
