import { LDConfigParser } from './ldconfig-parser';

describe('LDConfigParser', () => {
  it('should create an instance', () => {
    void expect(new LDConfigParser(null)).toBeTruthy();
  });
});
