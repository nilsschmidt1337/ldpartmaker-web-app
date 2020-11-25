import { LDConfigParser } from './ldconfig-parser';

describe('LDConfigParser', () => {
  it('should create an instance', () => {
    expect(new LDConfigParser(null)).toBeTruthy();
  });
});
