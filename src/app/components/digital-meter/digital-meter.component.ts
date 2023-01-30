import { Component, Input, OnInit } from '@angular/core';
import { format } from 'date-fns';

@Component({
  selector: 'app-digital-meter',
  templateUrl: './digital-meter.component.html',
  styleUrls: ['./digital-meter.component.scss'],
})
export class DigitalMeterComponent implements OnInit {
  kmH: any = 0;
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

  public time = ['00', '00'];
  public speedArr = ['0', '0', '0'];

  constructor() { }

  ngOnInit() {
    const widthFactor = 470 / window.innerWidth
    for (const led of this.arrLeds) {
      led.margin = this.getPxToTop(led.value - 18);
      led.deg = this.getDegValue((led.value - 18) * widthFactor);
    }
    this.initClock();
  }

  @Input()
  set dataIn(value: any) {
    try {
      this.kmH = value > 0 ? value : 0;
      this.speedArr = this.kmH.toString().split('');
      for (let index = this.speedArr.length; index < 3; index++) {
        this.speedArr.unshift('0');
      }
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

  //******************************** RELOJ ******************************/

  private initClock() {
    this.time[0] = format(new Date(), 'HH');
    this.time[1] = format(new Date(), 'mm');
    this.time[2] = format(new Date(), 'ss');
    setInterval(() => {
      this.time[0] = format(new Date(), 'HH');
      this.time[1] = format(new Date(), 'mm');
      this.time[2] = format(new Date(), 'ss');
    }, 1000)
  }


}
