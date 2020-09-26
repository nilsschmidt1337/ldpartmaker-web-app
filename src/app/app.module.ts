import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {TextEditorComponent} from './text-editor/text-editor.component';
import {AngularDraggableModule} from 'angular2-draggable';
import {MaterialModule} from './material/material.module';

@NgModule({
  declarations: [
    AppComponent,
    TextEditorComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AngularDraggableModule,
        MaterialModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
