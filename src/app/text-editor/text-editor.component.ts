import {Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {AppComponent} from '../app.component';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css'],
})
export class TextEditorComponent implements OnInit {
  static maxZIndex = 999;

  @Input() bounds: HTMLDivElement;
  @Input() parentComponent: AppComponent;

  internalZIndex = 100;
  shown = true;
  initialSource = '<div class="line"></div>' +
    '<div class="line">0 // First comment line</div>' +
    '<div class="line">0 // a triangle</div>' +
    '<div class="line">3 <b>16</b> 0 0 0 5 4 0 5 0 0</div>';
  caretPos = '1:1';
  private lineNumber: number;
  private lineOffset: number;
  private nodeFound = false;
  private lineCache = new Map<string, boolean>();
  private oldSource = '';
  @ViewChild('sourceEditor', {read: ViewContainerRef}) viewContainerRef: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit(): void {
  }

  async onClick() {
    this.internalZIndex = this.calculateZIndex();
    console.log('calculated new z-index ' + this.internalZIndex);
  }

  calculateZIndex() {
    TextEditorComponent.maxZIndex += 1;
    return TextEditorComponent.maxZIndex;
  }

  assignZIndex() {
    console.log('assigned z-index ' + this.internalZIndex);
    return this.internalZIndex;
  }

  onClose() {
    this.shown = false;
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TextEditorComponent);
    const newComponent = this.parentComponent.viewContainerRef.createComponent(componentFactory);
    newComponent.instance.parentComponent = this.parentComponent;
    newComponent.instance.bounds = this.bounds;
    newComponent.instance.shown = true;
  }

  onInputEvent(event: any) {
    this.updateCaretPos();
    const div = this.viewContainerRef.element.nativeElement as HTMLDivElement;
    const newSource = event.target.innerHTML;
    const newLines = newSource.split('<div class="line">');
    const ie = event as InputEvent;
    console.log('data: ' + ie.data);
    console.log('inputType: ' + ie.inputType);
    console.log('detail: ' + ie.detail);
    console.log('type: ' + ie.type);
    // TODO: Parse here
    // Reformat
    let newFormattedSource = '';
    for (const line of newLines) {
      if (!this.lineCache.has(line)) {
        newFormattedSource += this.formatLine(line);
      } else {
        newFormattedSource += '<div class="line">' + line;
      }
    }
    // Detect delta
    let insertedText;
    if (ie.data === null && ie.inputType === 'insertFromPaste') {
      // Detect the data which was pasted via clipboard (slow?)
      console.log('parse inserted clipboard content');
      const oldLines = this.oldSource.split('<div class="line">');
      let delta = '';
      for (let i = this.lineNumber + 1; i < newLines.length; i++) {
        if (i < oldLines.length) {
          if (oldLines[i] !== newLines[i]) {
            delta += newLines[i];
          }
        } else {
          delta += newLines[i];
        }
        console.log(delta);
      }
    } else {
      let lineCounter = 0;
      for (const line of newLines) {
        lineCounter++;
      }
      insertedText = ie.data;
    }
    this.oldSource = newFormattedSource;
    event.target.innerHTML = newFormattedSource;
    this.restoreCaretPos(this.lineNumber, this.lineOffset);
  }

  formatLine(line: string) {
    // First line element is empty
    if (line === '') {
      return '';
    }
    if (line.startsWith('0')) {
      line = '<p style="color:blue">' + line.replace('</div>' , '') + '</p></div>';
    }
    return '<div class="line">' + line;
  }

  updateCaretPos() {
    const div = this.viewContainerRef.element.nativeElement as HTMLDivElement;
    this.nodeFound = false;
    const line = this.calculateLineNumber(getSelection().anchorNode);
    if (line === 0) {
      return;
    }
    this.lineNumber = line;
    this.lineOffset = (getSelection().anchorOffset + this.calculateLineOffset(getSelection().anchorNode, div));
    this.caretPos = this.lineNumber + ':' + this.lineOffset;
    console.log('lineNumber: ' + this.lineNumber);
    console.log('lineOffset: ' + this.lineOffset);
  }

  restoreCaretPos(lineNumber: number, lineOffset: number) {
    const div = this.viewContainerRef.element.nativeElement as HTMLDivElement;
    function min(num1: number, num2: number) {
      if (num1 < num2) {
        return num1;
      }
      return num2;
    }
    let lineNode = div.childNodes.item(min(lineNumber, div.childNodes.length));
    let nodeNotFound = true;
    let lastNodeLength = 0;
    function consumeOffset(node: Node) {
      if (nodeNotFound && node instanceof Text) {
        if (lineOffset > node.length) {
          lineOffset -= node.length;
          lineNode = node;
          lastNodeLength = node.length;
          console.log('[in progress] text:' + node.wholeText + ' offset:' + lineOffset);
        } else if (nodeNotFound) {
          lineOffset--;
          lineNode = node;
          nodeNotFound = false;
          console.log('[finish] text:' + node.wholeText + ' offset:' + lineOffset);
        }
      } else if ((node.childNodes?.length || 0) > 0) {
        node.childNodes.forEach(consumeOffset);
      }
    }

    if (!(lineNode instanceof HTMLDivElement)) {
      return;
    }
    console.log('initial offset:' + lineOffset);
    if (!(lineNode.childNodes.item(0) instanceof Text)) {
      lineNode.childNodes.forEach(node => {
        consumeOffset(node);
      });
      if (nodeNotFound) {
        lineOffset += lastNodeLength - 1;
      }
    } else {
      lineNode = lineNode.childNodes.item(0);
      lineOffset--;
    }

    const anchorNode = lineNode;
    const anchorOffset = lineOffset;
    const focusNode = lineNode;
    const focusOffset = lineOffset;
    getSelection().setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
  }

  calculateLineNumber(node: Node) {
    const parentNode = node.parentNode;
    if (parentNode === null) {
      return 0;
    }
    let lineNumber = 0;
    if (!(parentNode instanceof HTMLDivElement && (parentNode as HTMLDivElement).className === 'content')) {
      return this.calculateLineNumber(parentNode);
    } else {
      let foundOriginalNode = false;
      parentNode.childNodes.forEach(child => {
        if (child === node) {
          foundOriginalNode = true;
        }
        if (!foundOriginalNode) {
          lineNumber++;
        }
      });
      return lineNumber;
    }
  }

  calculateLineOffset(nodeToFind: Node, nodeToProcess: Node): number {
    // Quit when the node was found
    if (this.nodeFound) {
      return 0;
    }
    // Dive into the current line
    if (nodeToProcess instanceof HTMLDivElement && (nodeToProcess as HTMLDivElement).className === 'content') {
      console.log('dive into line ' + this.lineNumber + ' to find ' + nodeToFind.textContent);
      this.lineOffset = 1;
      return this.calculateLineOffset(nodeToFind, nodeToProcess.childNodes.item(this.lineNumber));
    }
    // Get the offset until the node was found
    console.log('get offset in line segment' + nodeToProcess.textContent);
    nodeToProcess.childNodes.forEach(node => {
      if (this.nodeFound || node === nodeToFind) {
        this.nodeFound = true;
      } else if (node instanceof Text) {
        this.lineOffset += node.length;
      } else {
        this.calculateLineOffset(nodeToFind, node);
      }
    });
    return this.lineOffset;
  }

  onBeforePaste(event: any) {
    console.log(event);
  }
}
