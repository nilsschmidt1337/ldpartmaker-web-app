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
  initialSource =
    '<div class="line">0 // First comment line</div>' +
    '<div class="line">0 // a triangle</div>' +
    '<div class="line">3 <b>16</b> 0 0 0 5 4 0 5 0 0</div>';
  caretPos = '1:1';
  private lineNumber: number;
  private lineOffset: number;
  private lineNumberEnd: number;
  private lineOffsetEnd: number;
  private selection: string;
  private selectionLength: number;
  private nodeFound = false;
  private lineCache = new Map<string, boolean>();
  private oldSource = '';
  @ViewChild('sourceEditor', {read: ViewContainerRef}) viewContainerRef: ViewContainerRef;
  private breakNotFound = true;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit(): void {
  }

  async onClick() {
    this.internalZIndex = this.calculateZIndex();
    // console.log('calculated new z-index ' + this.internalZIndex);
  }

  calculateZIndex() {
    TextEditorComponent.maxZIndex += 1;
    return TextEditorComponent.maxZIndex;
  }

  assignZIndex() {
    // console.log('assigned z-index ' + this.internalZIndex);
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
    let lineCounter = 0;
    this.breakNotFound = true;
    let skipNextLine = false;
    for (const line of newLines) {
      if (skipNextLine) {
        skipNextLine = false;
        continue;
      }
      if (!this.lineCache.has(line) || (this.breakNotFound && lineCounter === this.lineNumber && ie.inputType === 'insertParagraph')) {
        if (lineCounter === this.lineNumber && ie.inputType === 'insertParagraph' && this.breakNotFound) {
          const oldLines = this.oldSource.split('<div class="line">');
          const oldLine = oldLines[this.lineNumber];
          const splitResult = this.splitLine(oldLine);
          newFormattedSource += splitResult[0];
          newFormattedSource += splitResult[1];
          this.breakNotFound = false;
          if (newLines.length > oldLines.length) {
            skipNextLine = true;
          }
          this.moveCaretToNextLine();
        } else {
          newFormattedSource += this.formatLine(line);
        }
      } else if (line !== '</div>') {
        newFormattedSource += '<div class="line">' + line;
        // Cache only 10.000 lines
        if (this.lineCache.size > 10000) {
          this.lineCache.delete(line);
        }
      }
      lineCounter++;
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
    } else if (ie.inputType !== 'insertParagraph') {
      this.updateCaretPos();
      lineCounter = 0;
      for (const line of newLines) {
        lineCounter++;
      }
      insertedText = ie.data;
    }
    this.oldSource = newFormattedSource;
    event.target.innerHTML = newFormattedSource;
    this.restoreCaretPos(this.lineNumber, this.lineOffset);
  }

  private moveCaretToNextLine() {
    this.lineNumber++;
    this.lineOffset = 1;
    this.caretPos = this.lineNumber + ':' + this.lineOffset;
  }

  formatLine(line: string) {
    // First line element is empty
    if (line === '' || line === '</div>') {
      return '';
    }
    // Keep line breaks
    if (line === '<br></div>') {
      return '<div class="line"><br></div>';
    }
    let plaintext = this.extractPlaintext(line);
    const trimmedPlaintext = plaintext.replace('&nbsp;', ' ').trim();
    if (trimmedPlaintext.startsWith('0')) {
      plaintext = '<p style="color:blue">' + plaintext + '</p>';
    }
    // Finish formatted line with </div> tag and cache the result
    plaintext = plaintext + '</div>';
    this.lineCache.set(plaintext, true);
    return '<div class="line">' + plaintext;
  }

  private extractPlaintext(line: string) {
    // Extract plain text from DOM string
    // '<div>foo</div>' will be 'foo'
    let plaintext = '';
    let isAppending = true;
    for (const c of line) {
      if (c === '<') {
        isAppending = false;
      } else if (c === '>') {
        isAppending = true;
      } else if (isAppending) {
        plaintext += c;
      }
    }
    return plaintext;
  }

  private replaceHtmlEntities(line: string) {
    return line
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp/g, '&');
  }

  private insertHtmlEntities(line: string) {
    return line
      .replace(/&/g, '&amp;')
      .replace(/ /g, '&nbsp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt');
  }

  updateCaretPos() {
    if (!this.breakNotFound) {
      this.breakNotFound = true;
      return;
    }
    const div = this.viewContainerRef.element.nativeElement as HTMLDivElement;
    this.nodeFound = false;
    const line = this.calculateLineNumber(getSelection().anchorNode);
    if (line === 0) {
      return;
    }
    this.selection = getSelection().toString();
    this.selectionLength = this.selection.length;
    this.lineNumber = line;
    this.lineNumberEnd = this.calculateLineNumber(getSelection().focusNode);
    this.nodeFound = false;
    this.lineOffset = 0;
    let tempLineOffset = (getSelection().focusOffset + this.calculateLineOffset(getSelection().focusNode, div, this.lineNumberEnd));
    const foundEndOfLine = this.nodeFound;
    if (!foundEndOfLine) {
      this.lineOffset = 0;
      this.lineNumberEnd--;
      tempLineOffset = (getSelection().focusOffset + this.calculateLineOffset(getSelection().focusNode, div, this.lineNumberEnd));
    }
    this.nodeFound = false;
    this.lineOffset = 0;
    this.lineOffset = (getSelection().anchorOffset + this.calculateLineOffset(getSelection().anchorNode, div, this.lineNumber));
    this.nodeFound = false;
    this.lineOffsetEnd = tempLineOffset;
    if (this.lineNumberEnd < this.lineNumber || this.lineNumberEnd === this.lineNumber && this.lineOffsetEnd < this.lineOffset) {
      const swapLineNumber = this.lineNumberEnd;
      const swapLineOffset = this.lineOffsetEnd;
      this.lineNumberEnd = this.lineNumber;
      this.lineOffsetEnd = this.lineOffset;
      this.lineNumber = swapLineNumber;
      this.lineOffset = swapLineOffset;
    }
    if (this.lineNumber === this.lineNumberEnd && this.lineOffset === this.lineOffsetEnd) {
      this.caretPos = this.lineNumber + ':' + this.lineOffset;
    } else {
      this.caretPos = this.lineNumber + ':' + this.lineOffset + ' to ' + this.lineNumberEnd + ':' + this.lineOffsetEnd;
    }
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
    let lineNode = div.childNodes.item(min(lineNumber - 1, div.childNodes.length - 1));
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
    if (!(lineNode.childNodes.length === 1 && lineNode.childNodes.item(0) instanceof Text)) {
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
    let lineNumber = 1;
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

  calculateLineOffset(nodeToFind: Node, nodeToProcess: Node, line: number): number {
    // Quit when the node was found
    if (this.nodeFound || nodeToProcess === null) {
      return 0;
    }
    // Dive into the current line
    if (nodeToProcess instanceof HTMLDivElement && (nodeToProcess as HTMLDivElement).className === 'content') {
      console.log('dive into line ' + line + ' to find ' + nodeToFind.textContent);
      this.lineOffset = 1;
      return this.calculateLineOffset(nodeToFind, nodeToProcess.childNodes.item(line - 1), line);
    }
    // Get the offset until the node was found
    console.log('get offset in line segment' + nodeToProcess.textContent);
    nodeToProcess.childNodes.forEach(node => {
      if (this.nodeFound || node === nodeToFind) {
        this.nodeFound = true;
      } else if (node instanceof Text) {
        this.lineOffset += node.length;
      } else {
        this.calculateLineOffset(nodeToFind, node, line);
      }
    });
    return this.lineOffset;
  }

  private splitLine(line: string): string[] {
    const plaintext = this.replaceHtmlEntities(this.extractPlaintext(line));
    console.log('split at ' +  this.lineOffset + ' (formatted): ' + line);
    console.log('split at ' +  this.lineOffset + ' (plain): ' + plaintext);
    if (line === '<br></div>') {
      return ['<div class="line"><br></div>', '<div class="line"><br></div>'];
    }
    const splitResult = [
      this.insertHtmlEntities(plaintext.substring(0, this.lineOffset - 1)),
      this.insertHtmlEntities(plaintext.substring(this.lineOffset - 1))];
    if (splitResult[0] === '') {
      splitResult[0] = '<br></div>';
    }
    if (splitResult[1] === '') {
      splitResult[1] = '<br></div>';
    }
    console.log('split (prefix): ' + splitResult[0]);
    console.log('split (suffix): ' + splitResult[1]);
    const prefix = this.formatLine(splitResult[0]);
    const suffix = this.formatLine(splitResult[1]);
    console.log('split (formatted prefix): ' + prefix);
    console.log('split (formatted suffix): ' + suffix);
    return [prefix, suffix];
  }
}
