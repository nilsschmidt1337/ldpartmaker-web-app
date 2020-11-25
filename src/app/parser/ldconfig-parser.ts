import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class LDConfigParser {

  constructor(private http: HttpClient) {
  }

  public parseIncludedLDConfig() {
    const url = 'assets/ldconfig.ldr';
    this.downloadLDConfigFile(url);
  }

  public parseLDConfigFromLDrawOrg() {
    // This needs a CORS configuration to allow GET requests to LDraw.org
    const url = 'https://www.ldraw.org/library/official/ldconfig.ldr';
    this.downloadLDConfigFile(url);
  }

  public parseLDConfig(textPromise: Promise<string>) {
    textPromise.then(text => this.parseLDConfigFile(text));
  }

  private downloadLDConfigFile(url: string) {
    this.http.get(url, {responseType: 'text'}).toPromise()
      .then(data => this.parseLDConfigFile(data));
  }

  private parseLDConfigFile(ldConfigFile: string) {
    for (const line of ldConfigFile.split(/[\r\n]+/)){
      this.parseLDConfigLine(line);
    }
  }

  private parseLDConfigLine(line: string) {
    // TODO Needs implementation!
    console.log(line);
  }
}
