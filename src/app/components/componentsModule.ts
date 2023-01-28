import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AnalogMeterComponent } from './analog-meter/analog-meter.component';
import { DigitalMeterComponent } from '../digital-meter/digital-meter.component';


const PAGES_COMPONENTS = [AnalogMeterComponent, DigitalMeterComponent];
@NgModule({

  imports: [
    CommonModule,
    IonicModule.forRoot(),
  ],
  declarations: [PAGES_COMPONENTS],
  entryComponents: [PAGES_COMPONENTS],
  exports: [PAGES_COMPONENTS]
})


export class ComponentsModule { }
