import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { LDConfigParser } from './parser/ldconfig-parser';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        LDConfigParser, HttpClient, HttpHandler
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'ldpartmaker-web-app'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('ldpartmaker-web-app');
  });

  it('should have no canvas when the native file system api is supported', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.hasNativeFS = true;
    fixture.detectChanges();
    const app = fixture.componentInstance;
    expect(app.hasWebGL2Support).toBeFalse();
  });

  it('should have a div when the native file system api is not supported', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#nfs-api-not-supported').textContent).toContain('Native File System API');
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });
});
