import {AfterViewInit, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Canvas, Renderer, Wizard} from 'webgl-operate';
import {WebGLRenderer} from './webgl-renderer/webgl-renderer';
import {name, version} from '../../package.json';
import {NativeFileSystem} from './native-file-system-api/native-file-system';
import {FileSystemEntriesOptions, ChooseFileSystemEntriesType} from './native-file-system-api/file-system-entries-options';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy, OnInit, AfterViewInit {

  title = 'ldpartmaker-web-app';

  // tslint:disable-next-line
  hasNativeFS = window['chooseFileSystemEntries'];
  hasWebGL2Support = false;
  hasWebWorkerSupport = typeof Worker !== undefined;

  private canvas: Canvas;
  private renderer: WebGLRenderer;

  /**
   * Create the AppComponent and display the name and version of this program
   */
  constructor() {
    console.log('started ' + name + ' version ' + version);
  }

  /**
   * This is invoked with first priority, but only once on instantiation.
   * It displays some information about the browser and system environment
   * (e.g. the availability of the Native File System API).
   */
  ngOnInit() {
    console.log('Native File System support : ' + this.hasNativeFS);
    console.log('Web Worker multithreading  : ' + this.hasWebWorkerSupport);
  }

  /**
   * This is triggered after the component view initialization is complete.
   * It retrieves the canvas element from the DOM and
   * then delegates the creation of the renderer.
   */
  ngAfterViewInit() {
    const htmlCanvasElement = document.getElementById('multiframe') as HTMLCanvasElement;
    console.log('HTML <canvas> support      : ' + htmlCanvasElement);

    if (htmlCanvasElement != null) {
      this.onInitialize(htmlCanvasElement);
    }
  }

  /**
   * The ngOnDestroy method is called both when the component is destroyed by Angular
   * AND when the browser event window:beforeunload is fired.
   * (*) Page Refresh
   * (*) Tab Close
   * (*) Browser Close
   * (*) Navigation Away From Page
   */
  @HostListener('window:beforeunload')
  async ngOnDestroy() {

    console.log('disposing resources..');

    if (this.canvas != null) {
      try {
        this.canvas.dispose();
        console.log('canvas is disposed');
      } catch (e) {
        console.log(e);
        console.error('problem during canvas disposal');
      }
    }

    if ((this.renderer as Renderer)?.initialized) {
      try {
        (this.renderer as Renderer).uninitialize();
        console.log('renderer is uninitialized. It was done after the canvas disposal.');
      } catch (e) {
        console.log(e);
        console.error('problem during renderer disposal');
      }
    }
  }

  /**
   * Initializes the canvas and connects a new renderer instance to
   * the renderer.
   *
   * @param element the canvas element from the DOM
   */
  onInitialize(element: HTMLCanvasElement | string) {

    this.canvas = new Canvas(element, {antialias: true});
    this.canvas.controller.multiFrameNumber = 1;
    this.canvas.framePrecision = Wizard.Precision.byte;
    this.canvas.frameScale = [1.0, 1.0];
    this.hasWebGL2Support = this.canvas.context.isWebGL2;
    console.log('WebGL 2 capable browser    : ' + this.hasWebGL2Support);

    const divElement = document.getElementById('webgl2-not-supported') as HTMLDivElement;

    if (this.hasWebGL2Support) {
      this.renderer = new WebGLRenderer();
      this.canvas.renderer = this.renderer;
      divElement.remove();
    } else {
      // Show the error div and hide the canvas
      divElement.hidden = false;
      this.canvas.element.hidden = true;
    }
  }

  async onClick() {
    const opts = new FileSystemEntriesOptions();
    opts.type = ChooseFileSystemEntriesType.openFile;
    // opts.type = ChooseFileSystemEntriesType.openDirectory;
    const fileHandle = await NativeFileSystem.chooseFileSystemEntries(opts);
    const f = await fileHandle.getFile();
    console.log(f.name);
    // Do something with the file handle
  }
}
