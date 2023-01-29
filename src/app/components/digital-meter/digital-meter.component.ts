import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-digital-meter',
  templateUrl: './digital-meter.component.html',
  styleUrls: ['./digital-meter.component.scss'],
})
export class DigitalMeterComponent implements OnInit {
  kmH: any = { t: 0, c: 0, d: 0, u: 0 };
  arrLeds = [
    { value: 1, margin: 0, deg: 0 },
    { value: 2, margin: 0, deg: 0 },
    { value: 3, margin: 0, deg: 0 },
    { value: 4, margin: 0, deg: 0 },
    { value: 5, margin: 0, deg: 0 },
    { value: 6, margin: 0, deg: 0 },
    { value: 7, margin: 0, deg: 0 },
    { value: 8, margin: 0, deg: 0 },
    { value: 9, margin: 0, deg: 0 },
    { value: 10, margin: 0, deg: 0 },
    { value: 11, margin: 0, deg: 0 },
    { value: 12, margin: 0, deg: 0 },
    { value: 13, margin: 0, deg: 0 },
    { value: 14, margin: 0, deg: 0 },
    { value: 15, margin: 0, deg: 0 },
    { value: 16, margin: 0, deg: 0 },
    { value: 17, margin: 0, deg: 0 },
    { value: 18, margin: 0, deg: 0 },
    { value: 19, margin: 0, deg: 0 },
    { value: 20, margin: 0, deg: 0 },
    { value: 21, margin: 0, deg: 0 },
    { value: 22, margin: 0, deg: 0 },
    { value: 23, margin: 0, deg: 0 },
    { value: 24, margin: 0, deg: 0 },
    { value: 25, margin: 0, deg: 0 },
    { value: 26, margin: 0, deg: 0 },
    { value: 27, margin: 0, deg: 0 },
    { value: 28, margin: 0, deg: 0 },
  ];
  public factor = 2000;
  constructor() { }

  ngOnInit() {
    for (const led of this.arrLeds) {
      led.margin = this.getPxToTop(led.value - 18);
      led.deg = this.getDegValue(led.value - 18);
    }
  }

  @Input()
  set dataIn(value: any) {
    try {
      this.kmH.t = value > 0 ? value : 0;
      this.kmH.c = Math.floor(this.kmH.t / 100);
      const dec = this.kmH.t / 100 - Math.trunc(this.kmH.t / 100);
      this.kmH.d = 10 * Number.parseFloat((dec).toFixed(1));
      const un = this.kmH.t / 10 - Math.trunc(this.kmH.t / 10);
      this.kmH.u = 10 * Number.parseFloat((un).toFixed(1));
    } catch (err) {
      console.log(err);
    }
  }

  public getDegValue(deg: number) {
    console.log('deg: ' + deg * 2);
    return deg * 2;
  }

  public getPxToTop(deg: number) {
    const cos = this.factor - Math.cos(deg / (180 / Math.PI)) * this.factor;
    console.log('margin: ' + cos);
    return cos;
  }
}
