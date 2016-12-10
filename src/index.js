import parse from './parse';

export default function sawblade(callback) {
  window.addEventListener('hashchange', () => {
    callback(parse(window.location.hash));
  });
}
