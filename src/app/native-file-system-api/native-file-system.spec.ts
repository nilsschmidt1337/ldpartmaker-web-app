import { NativeFileSystem } from './native-file-system';

describe('NativeFileSystem', () => {
  it('should create an instance', () => {
    expect(new NativeFileSystem()).toBeTruthy();
  });
});
