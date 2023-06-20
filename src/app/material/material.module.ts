import { NgModule } from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacySliderModule as MatSliderModule} from '@angular/material/legacy-slider';



@NgModule({

  imports: [

    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatSliderModule

  ],

  exports: [

    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatSliderModule

  ]

})

export class MaterialModule {}
