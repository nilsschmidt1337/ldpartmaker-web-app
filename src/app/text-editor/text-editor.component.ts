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
  source = '<br>0 // First comment line<br>0 // a triangle<br>3 <b>16</b> 0 0 0 5 4 0 5 0 0';

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
    console.log('documentPosition ' + getSelection().anchorNode);
    console.log('anchorOffset: ' + getSelection().anchorOffset);
    console.log(event.target.innerHTML);
    console.log(event.target.innerText);
  }
}
