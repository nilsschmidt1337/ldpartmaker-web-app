import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
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

  it('should have a canvas when the native file system api is supported', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.hasNativeFS = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('canvas').textContent).toContain('Your browser does not support the <canvas> element.');
  });

  it('should have a div when the native file system api is not supported', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#not-supported').textContent).toContain('Native File System API');
  });
});
