import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class LDConfigParser {
  private ldConfigFile: string;

  constructor(private http: HttpClient) {
  }

  public parseIncludedLDConfig() {
    this.http.get('assets/ldconfig.ldr', {responseType: 'text'}).toPromise()
      .then(data => {
        this.ldConfigFile = data;
      })
      .finally(() => this.parseLDConfigFile());
  }

  private parseLDConfigFile() {
    for (const line of this.ldConfigFile.split(/[\r\n]+/)){
      this.parseLDConfigLine(line);
    }
  }

  private parseLDConfigLine(line: string) {
    // TODO Needs implementation!
    console.log(line);
  }
}
