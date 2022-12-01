import {WebGLRenderer} from './webgl-renderer';

describe('WebGLRenderer', () => {
  it('should create an instance', () => {
    void expect(new WebGLRenderer()).toBeTruthy();
  });
});
