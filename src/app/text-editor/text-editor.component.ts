import {Component, ComponentFactoryResolver, Input, OnInit} from '@angular/core';
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
  source = '<div class="line"></div>' +
    '<div class="line">0 // First comment line</div>' +
    '<div class="line">0 // a triangle</div>' +
    '<div class="line">3 <b>16</b> 0 0 0 5 4 0 5 0 0</div>';
  caretPos = '1:1';

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
  }

  updateCaretPos() {
    const lineNumber = this.lineNumber(getSelection().anchorNode);
    const offset = (getSelection().anchorOffset + this.lineOffset(getSelection().anchorNode));
    this.caretPos = lineNumber + ':' + offset;
    console.log('lineNumber: ' + lineNumber);
    console.log('lineOffset: ' + offset);
  }

  lineNumber(node: Node) {
    const parentNode = node.parentNode;
    let lineNumber = 0;
    if (!(parentNode instanceof HTMLDivElement && (parentNode as HTMLDivElement).className === 'content')) {
      return this.lineNumber(parentNode);
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

  lineOffset(node: Node): number {
    const parentNode = node.parentNode;
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
      offset += this.lineOffset(parentNode);
    } else {
      offset++;
    }
    return offset;
  }
}
