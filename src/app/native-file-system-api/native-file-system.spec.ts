import { NativeFileSystem } from './native-file-system';

describe('NativeFileSystem', () => {
  it('should create an instance', () => {
    void expect(new NativeFileSystem()).toBeTruthy();
  });
});
