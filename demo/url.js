import { Observable, ReplaySubject } from 'rxjs/Rx';

const observable = Observable.create(observer => {
  const { location } = window;

  if (!location.hash || location.hash === '#') {
    location.hash = '#';
  }

  handleHashChange();
  window.addEventListener('hashchange', handleHashChange);

  return () => window.removeEventListener('hashchange', handleHashChange);

  function handleHashChange() {
    observer.next(location.hash.substring(1));
  }
});

const subject = new ReplaySubject();
observable.subscribe(subject);
export default subject;
