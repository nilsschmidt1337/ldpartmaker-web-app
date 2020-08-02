import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})
export class TextEditorComponent implements OnInit {
  @Input() bounds: HTMLDivElement;

  constructor() { }

  ngOnInit(): void {
  }

}
