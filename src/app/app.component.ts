import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ldpartmaker-web-app';
  hasNativeFS = window["chooseFileSystemEntries"];

  constructor() {  }

  ngOnInit() {
    console.log("Hello LDraw World!")
    console.log("hasNativeFS is " + this.hasNativeFS)
  }
}
