export default function parse(hash) {
  return hash
    .substring(2)
    .split('/')
    .map(segment => ~segment.indexOf(';') ? parseSegment(segment) : segment);
}

function parseSegment(segment) {
  const items = segment.split(';');
  const path = items[0];
  const query = items
    .slice(1)
    .map(item => item.split('='))
    .map(item => ({ [item[0]]: isNaN(item[1]) ? item[1] : parseInt(item[1]) }))
    .reduce((items, item) => Object.assign({}, items, item), {});
  return { path, query };
}
