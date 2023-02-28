import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {AppComponent} from '../app.component';
import {LDrawParser} from '../parser/ldraw-parser';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css'],
})
export class TextEditorComponent implements OnInit, AfterViewInit {
  static maxZIndex = 999;

  @Input() bounds: HTMLDivElement;
  @Input() parentComponent: AppComponent;

  @ViewChild('sourceEditor', {read: ViewContainerRef}) viewContainerRef: ViewContainerRef;

  internalZIndex = 100;
  shown = true;
  initialSource =
    '<div class="line">0 // First comment line</div>' +
    '<div class="line">0 // a triangle</div>' +
    '<div class="line">3 <b>16</b> 0 0 0 5 4 0 5 0 0</div>' +
    '<div class="line">4 16 -1 0 5 -8 0 4 -12 0 -4 -4 0 -5</div>';
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
  private breakNotFound = true;

  private readonly INSERT_PARAGRAPH = 'insertParagraph';
  private readonly NONE = '';

  constructor(private parser: LDrawParser) {}

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.onInputEvent(new InputEvent(this.NONE));
  }

  onClick() {
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
    const newComponent = this.parentComponent.viewContainerRef.createComponent(TextEditorComponent);
    newComponent.instance.parentComponent = this.parentComponent;
    newComponent.instance.bounds = this.bounds;
    newComponent.instance.shown = true;
  }

  onInputEvent(event: any) {
    const div = this.viewContainerRef.element.nativeElement as HTMLDivElement;
    const newSource = div.innerHTML;
    const newLines = newSource.split('<div class="line">');
    const ie = event as InputEvent;
    console.log(`data: ${ie.data ?? 'null'}`);
    console.log(`inputType: ${ie.inputType}`);
    console.log(`detail: ${ie.detail}`);
    console.log(`type: ${ie.type}`);
    // TODO: Parse here
    // Reformat
    let newFormattedSource = '';
    let lineCounter = 0;
    this.breakNotFound = true;
    let skipNextLines = 0;
    for (const line of newLines) {
      if (skipNextLines > 0) {
        skipNextLines--;
        continue;
      }
      if (!this.lineCache.has(line) || (this.breakNotFound && lineCounter === this.lineNumber && ie.inputType === this.INSERT_PARAGRAPH)) {
        if (lineCounter === this.lineNumber && ie.inputType === this.INSERT_PARAGRAPH && this.breakNotFound) {
          const oldLines = this.oldSource.split('<div class="line">');
          const oldLine = oldLines[this.lineNumber];
          const splitResult = this.splitLine(this.lineOffset, oldLine);
          newFormattedSource += splitResult[0];
          this.breakNotFound = false;
          if (this.lineNumber === this.lineNumberEnd) {
            newFormattedSource += splitResult[1];
            if (newLines.length > oldLines.length) {
              skipNextLines = 1;
            }
          } else {
            const oldLineEnd = oldLines[this.lineNumberEnd];
            const splitResultEnd = this.splitLine(this.lineOffsetEnd, oldLineEnd);
            newFormattedSource += splitResultEnd[1];
            skipNextLines = this.lineNumberEnd - this.lineNumber - 1;
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
    } else if (ie.inputType !== this.INSERT_PARAGRAPH && ie.inputType !== this.NONE) {
      this.updateCaretPos();
      lineCounter = 0;
      // lineCounter += newLines.length;
      for (const line of newLines) {
        lineCounter++;
      }
      insertedText = ie.data;
    }
    this.oldSource = newFormattedSource;
    div.innerHTML = newFormattedSource;
    if (ie.inputType !== this.NONE) {
      this.restoreCaretPos(this.lineNumber, this.lineOffset);
    }
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
    let plaintext = this.parser.parse(this.extractPlaintext(line));
    // Finish formatted line with </div> tag and cache the result
    plaintext = plaintext + '</div>';
    this.lineCache.set(plaintext, true);
    return '<div class="line">' + plaintext;
  }

  updateCaretPos() {
    const s = getSelection();
    if (!this.breakNotFound) {
      this.breakNotFound = true;
      return;
    }
    if (!s || s.anchorNode === null || s.focusNode === null) {
      return;
    }

    const div = this.viewContainerRef.element.nativeElement as HTMLDivElement;
    this.nodeFound = false;
    const line = this.calculateLineNumber(s.anchorNode);
    if (line === 0) {
      return;
    }
    this.selection = s.toString();
    this.selectionLength = this.selection.length;
    this.lineNumber = line;
    this.lineNumberEnd = this.calculateLineNumber(s.focusNode);
    this.nodeFound = false;
    this.lineOffset = 0;
    let tempLineOffset = (s.focusOffset + this.calculateLineOffset(s.focusNode, div, this.lineNumberEnd));
    if (!this.nodeFound) {
      this.lineOffset = 0;
      this.lineNumberEnd--;
      tempLineOffset = (s.focusOffset + this.calculateLineOffset(s.focusNode, div, this.lineNumberEnd));
    }
    this.nodeFound = false;
    this.lineOffset = 0;
    this.lineOffset = (s.anchorOffset + this.calculateLineOffset(s.anchorNode, div, this.lineNumber));
    if (!this.nodeFound) {
      this.lineOffset = 0;
      this.lineNumber--;
      this.lineOffset = (s.anchorOffset + this.calculateLineOffset(s.anchorNode, div, this.lineNumber));
    }
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
      this.caretPos = `${this.lineNumber}:${this.lineOffset}`;
    } else {
      this.caretPos = `${this.lineNumber}:${this.lineOffset} to ${this.lineNumberEnd}:${this.lineOffsetEnd}`;
    }
    console.log(`lineNumber: ${this.lineNumber}`);
    console.log(`lineOffset: ${this.lineOffset}`);
  }

  restoreCaretPos(lineNumber: number, lineOffset: number) {
    const div = this.viewContainerRef.element.nativeElement as HTMLDivElement;
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function min(num1: number, num2: number) {
      if (num1 < num2) {
        return num1;
      }
      return num2;
    }
    let lineNode = div.childNodes.item(min(lineNumber - 1, div.childNodes.length - 1));
    let nodeNotFound = true;
    let lastNodeLength = 0;
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function consumeOffset(node: Node) {
      if (nodeNotFound && node instanceof Text) {
        if (lineOffset > node.length) {
          lineOffset -= node.length;
          lineNode = node;
          lastNodeLength = node.length;
          console.log(`[in progress] text:${node.wholeText} offset:${lineOffset}`);
        } else if (nodeNotFound) {
          lineOffset--;
          lineNode = node;
          nodeNotFound = false;
          console.log(`[finish] text:${node.wholeText} offset:${lineOffset}`);
        }
      } else if ((node.childNodes?.length || 0) > 0) {
        node.childNodes.forEach(consumeOffset);
      }
    }

    if (!(lineNode instanceof HTMLDivElement)) {
      return;
    }
    console.log(`initial offset:${lineOffset}`);
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
    getSelection()?.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
  }

  calculateLineNumber(node: Node): number {
    const parentNode = node.parentNode;
    if (parentNode === null) {
      return 0;
    }
    let lineNumber = 1;
    if (!(parentNode instanceof HTMLDivElement && (parentNode ).className === 'content')) {
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
    if (nodeToProcess instanceof HTMLDivElement && (nodeToProcess ).className === 'content') {
      console.log(`dive into line ${line} to find ${nodeToFind.textContent ?? 'null'}`);
      this.lineOffset = 1;
      return this.calculateLineOffset(nodeToFind, nodeToProcess.childNodes.item(line - 1), line);
    }
    // Detect lines which only consist of a line break
    if (this.lineOffset === 1 && nodeToProcess.childNodes.length === 0 && nodeToProcess.nodeName.toUpperCase() === 'BR') {
      console.log(`line ${line} contains only a line break.`);
      this.nodeFound = true;
      return this.lineOffset;
    }
    // Get the offset until the node was found
    console.log(`get offset in line segment ${nodeToProcess.textContent ?? 'null'}`);
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

  private moveCaretToNextLine() {
    this.lineNumber++;
    this.lineOffset = 1;
    this.caretPos = `${this.lineNumber}:${this.lineOffset}`;
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

  private splitLine(offset: number, line: string): string[] {
    const plaintext = this.replaceHtmlEntities(this.extractPlaintext(line));
    console.log(`split at ${offset} (formatted): ${line}`);
    console.log(`split at ${offset} (plain): ${plaintext}`);
    if (line === '<br></div>') {
      return ['<div class="line"><br></div>', '<div class="line"><br></div>'];
    }
    const splitResult = [
      this.insertHtmlEntities(plaintext.substring(0, offset - 1)),
      this.insertHtmlEntities(plaintext.substring(offset - 1))];
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
