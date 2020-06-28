import {AfterViewInit, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Canvas, Renderer, Wizard} from "webgl-operate";
import {AppRenderer} from "./app.renderer";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy, OnInit, AfterViewInit {

  title = 'ldpartmaker-web-app';
  hasNativeFS = window["chooseFileSystemEntries"];

  private _canvas: Canvas;
  private _renderer: AppRenderer;

  constructor() {
  }

  ngOnInit() {
    console.log("Hello LDraw World!")
    console.log("hasNativeFS is " + this.hasNativeFS)
  }

  ngAfterViewInit() {
    let htmlCanvasElement = <HTMLCanvasElement>document.getElementById("multiframe")
    console.log("canvas is " + htmlCanvasElement)

    if (htmlCanvasElement != null) {
      this.onInitialize(htmlCanvasElement)
    }
  }

  /**
   * The ngOnDestroy method is called both when the component is destroyed by Angular
   * AND when the browser event window:beforeunload is fired
   * (*) Page Refresh
   * (*) Tab Close
   * (*) Browser Close
   * (*) Navigation Away From Page
   */
  @HostListener('window:beforeunload')
  async ngOnDestroy() {
    console.log("disposing resources..")
    try {
      this?._canvas.dispose()
      console.log("canvas is disposed")
    } catch (e) {
      console.log(e)
      console.error("problem during canvas disposal")
    }

    if ((this?._renderer as Renderer).initialized) {
      try {
        (this?._renderer as Renderer).uninitialize()
        console.log("renderer is uninitialized. It was done after the canvas disposal.")
      } catch (e) {
        console.log(e)
        console.error("problem during renderer disposal")
      }
    }
  }

  onInitialize(element: HTMLCanvasElement | string) {

    this._canvas = new Canvas(element, {antialias: true});
    this._canvas.controller.multiFrameNumber = 1;
    this._canvas.framePrecision = Wizard.Precision.byte;
    this._canvas.frameScale = [1.0, 1.0];

    this._renderer = new AppRenderer();
    this._canvas.renderer = this._renderer;
  }
}
