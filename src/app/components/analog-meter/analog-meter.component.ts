/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-analog-meter',
  templateUrl: './analog-meter.component.html',
  styleUrls: ['./analog-meter.component.scss'],
})
export class AnalogMeterComponent implements OnInit {

  /** uso
   * <app-analog-meter  [WIDTH]="100" [maxValue]="100" [dataIn]="magnitude" [top]="200" [right]="0"   >
   * </app-analog-meter>
   *
   */

  /** tamaño del componente */
  @Input()
  WIDTH!: number;
  /** posiciion absoluta */
  @Input()
  top!: number;
  @Input()
  left!: number;
  @Input()
  right!: number;
  @Input()
  bottom!: number;
  /** valor del punto maximo de la medida */
  @Input()
  public HEIGHT!: number;
  public deg!: number;

  constructor() {
  }

  async ngOnInit() {
    this.deg = -135;
  }

  @Input()
  set dataIn(value: any) {
    try {
      this.deg = value;
    } catch (err) {
      console.log(err);
    }
  }





}
