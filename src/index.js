import parse from './parse';

export default function sawblade(callback) {
  callback(parse(window.location.hash));
  window.addEventListener('hashchange', () => {
    callback(parse(window.location.hash));
  });
}
