import { AppPage } from './app.po';
import { browser, logging } from 'protractor';
import { TestBed } from '@angular/core/testing';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    void page.navigateTo();
    void expect(page.getTitleText()).toEqual('ldpartmaker-web-app app is running!');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });
});
