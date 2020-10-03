import {Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {AppComponent} from '../app.component';
import {FocusOptions} from "@angular/cdk/a11y/focus-monitor/focus-monitor";

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
  source = '<div class="line"></div>' +
    '<div class="line">0 // First comment line</div>' +
    '<div class="line">0 // a triangle</div>' +
    '<div class="line">3 <b>16</b> 0 0 0 5 4 0 5 0 0</div>';
  original = '<div class="line"></div>' +
    '<div class="line">0 // First comment line</div>' +
    '<div class="line">0 // a triangle</div>' +
    '<div class="line">3 <b>16</b> 0 0 0 5 4 0 5 0 0</div>';
  caretPos = '1:1';
  private lineNumber: number;
  private lineOffset: number;
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
    const ie = event as InputEvent;
    console.log('data: ' + ie.data);
    console.log('inputType: ' + ie.inputType);
    console.log('detail: ' + ie.detail);
    console.log('type: ' + ie.type);
    console.log(this.source);
    this.updateCaretPos();
    console.log(event.target.innerHTML);
    console.log(event.target.innerText);
    this.restoreCaretPos(this.lineNumber, this.lineOffset);

  }

  updateCaretPos() {
    this.lineNumber = this.calculateLineNumber(getSelection().anchorNode);
    this.lineOffset = (getSelection().anchorOffset + this.calculateLineOffset(getSelection().anchorNode));
    this.caretPos = this.lineNumber + ':' + this.lineOffset;
    console.log('lineNumber: ' + this.lineNumber);
    console.log('lineOffset: ' + this.lineOffset);
  }

  restoreCaretPos(lineNumber: number, lineOffset: number) {
    const div = this.viewContainerRef.element.nativeElement as HTMLDivElement;
    // TODO: Parse here
    div.innerHTML = this.original;

    function min(num1: number, num2: number) {
      if (num1 < num2) {
        return num1;
      }
      return num2;
    }
    let lineNode = div.childNodes.item(min(lineNumber, div.childNodes.length));
    let nodeNotFound = true;
    function consumeOffset(node: Node) {
      if (nodeNotFound && node instanceof Text) {
        if (lineOffset >= node.length) {
          lineOffset -= node.length;
          lineNode = node;
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
    if (lineOffset > (lineNode.childNodes.item(0).textContent?.length || 0)) {
      lineNode.childNodes.forEach(node => {
        consumeOffset(node);
      });
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

  calculateLineOffset(node: Node): number {
    const parentNode = node.parentNode;
    if (parentNode === null) {
      return 0;
    }
    if (parentNode instanceof HTMLDivElement && (parentNode as HTMLDivElement).className === 'content') {
      return 1;
    }
    let offset = 0;
    let foundOriginalNode = false;
    parentNode.childNodes.forEach(child => {
      if (child === node) {
        foundOriginalNode = true;
      }
      if (!foundOriginalNode) {
        offset += child.nodeValue?.length || 0;
      }
    });
    if (!(parentNode instanceof HTMLDivElement && (parentNode as HTMLDivElement).className === 'line')) {
      offset += this.calculateLineOffset(parentNode);
    } else {
      offset++;
    }
    return offset;
  }
}
