let listeners = [];

export default function hashUrl(callback) {
  const { hash } = window.location;
  callback(hash ? (hash.substring(1) || '/') : '/');

  const listener = () => callback(window.location.hash.substring(1));
  listeners.push(listener);
  window.addEventListener('hashchange', listener);
}

export function cleanup() {
  listeners.forEach(listener => window.removeEventListener('hashchange', listener));
  listeners = [];
}
