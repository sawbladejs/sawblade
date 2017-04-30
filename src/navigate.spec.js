import { spy } from 'sinon';
import { expect } from 'chai';
import navigate from './navigate';

describe('navigate', () => {
  it('should navigate to a sibling resource specified by subpath', () => {
    const go = spy();
    const _navigate = navigate('/users/1/bio', go);
    _navigate('photos');
    expect(go).to.be.calledWith('/users/1/photos');
  });

  it('should navigate to a sibling resource specified by relative subpath', () => {
    const go = spy();
    const _navigate = navigate('/users/1/bio', go);
    _navigate('./photos');
    expect(go).to.be.calledWith('/users/1/photos');
  });

  it('should navigate to a parent resource specified by relative URL', () => {
    const go = spy();
    const _navigate = navigate('/users/1/bio', go);
    _navigate('../1');
    expect(go).to.be.calledWith('/users/1');
  });

  it('should navigate to an ancestor resource specified by relative URL', () => {
    const go = spy();
    const _navigate = navigate('/users/1/bio', go);
    _navigate('../../posts');
    expect(go).to.be.calledWith('/posts');
  });

  it('should allow a link to add a parameter when none exists', () => {
    const go = spy();
    const _navigate = navigate('/users/list', go);
    _navigate(';sort=desc');
    expect(go).to.be.calledWith('/users/list;sort=desc');
  });

  it('should allow a link to add a parameter when a parameter already exists', () => {
    const go = spy();
    const _navigate = navigate('/users/list;page=5', go);
    _navigate(';sort=desc');
    expect(go).to.be.calledWith('/users/list;page=5;sort=desc');
  });

  it('should allow a link to change a subset of parameters', () => {
    const go = spy();
    const _navigate = navigate('/users/list;sort=asc;filter=abc;limit=100', go);
    _navigate(';sort=desc;limit=50');
    expect(go).to.be.calledWith('/users/list;sort=desc;filter=abc;limit=50');
  });
});
