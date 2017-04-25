export function bootstrap(root, routes, url) {
  const subscription = url.subscribe(() => {});
  return function teardown() {
    subscription.unsubscribe();
  };
}
