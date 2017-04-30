import Welcome from './Welcome';
import Users from './Users';
import UserDetail from './UserDetail';
import UserBio from './UserBio';
import UserPhotos from './UserPhotos';

export default [
  {
    path: '/',
    render: ({ parent }) => new Welcome({ target: parent.refs.outlet }),
    teardown: component => component.teardown()
  },
  {
    path: '/users',
    render: ({ parent, navigate, path }) => new Users({ target: parent.refs.outlet, data: { navigate, path } }),
    teardown: component => component.teardown(),
    children: [
      {
        path: '/',
        render: ({ navigate }) => navigate('./1')
      },
      {
        path: '/:id',
        render({ parent, params: { id }, navigate, path }) {
          return new UserDetail({ target: parent.refs.outlet, data: { id, navigate, path } });
        },
        update: ({ context, params: { id }, path }) => context.set({ id, path }),
        teardown: component => component.teardown(),
        children: [
          {
            path: '/',
            render: ({ navigate, path }) => navigate(path + 'bio')
          },
          {
            path: '/photos',
            render: ({ parent }) => new UserPhotos({ target: parent.refs.outlet }),
            teardown: component => component.teardown()
          },
          {
            path: '/bio',
            render: ({ parent }) => new UserBio({ target: parent.refs.outlet }),
            teardown: component => component.teardown()
          }
        ]
      }
    ]
  }
];
