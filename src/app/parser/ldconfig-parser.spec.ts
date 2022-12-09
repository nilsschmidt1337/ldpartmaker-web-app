import { mock } from 'ts-mockito';
import { HttpClient } from '@angular/common/http';
import { LDConfigParser } from './ldconfig-parser';

describe('LDConfigParser', () => {
  it('should create an instance', () => {
    const mockedHttpClient = mock(HttpClient);
    void expect(new LDConfigParser(mockedHttpClient)).toBeTruthy();
  });
});
