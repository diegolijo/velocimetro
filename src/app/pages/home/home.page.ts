/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AndroidFullScreen } from '@awesome-cordova-plugins/android-full-screen/ngx';
import { IonSegment, Platform } from '@ionic/angular';
import { LocationMngr } from '../../services/location-manager';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild('segment', { static: true }) segment!: IonSegment;
  private static START_POSITION = -135;
  public deg = HomePage.START_POSITION;

  public ledIndex = 0;
  public factorLed = 1.14
  public kmH = 160;
  public btnSelected = 'AUTOCRUISE'
  public x = 0;
  public y = 0;
  public z = 0

  constructor(
    private platform: Platform,
    private androidFullScreen: AndroidFullScreen,
    private location: LocationMngr
  ) { }

  async ngOnInit() {
    if (this.platform.is('cordova')) {
      await this.platform.ready();
      this.initSubscribePosition();
      this.initSubscribeAcelerometer();
      await this.androidFullScreen.immersiveMode();
      return;
    }
    setInterval(() => {
      this.ledIndex = Math.round(Math.random() * 8);
    }, 200);
  }



  public onClickBtn(event: any) {
    if (this.btnSelected === event.currentTarget.textContent) return;
    this.btnSelected = event.currentTarget.textContent;
    switch (event.currentTarget.textContent) {

      case 'AUTOCRUISE':
        this.btnSelected = event.currentTarget.textContent;
        break;
      case 'NORMALCRUISE':

        break;
      case 'PURSUIT':

        break;

      default:
        break;
    }
  }

  private async initSubscribePosition() {
    await this.location.locationHiAccuracyRequest();
    this.location.initWatchPosition();
    this.location.getPositionObservable().subscribe((value: any) => {
      this.onUpdatePosition(value);
    });
  }

  private onUpdatePosition(value: any) {
    this.kmH = value.coords.speed * 3.6;
    this.deg = this.convertSpeedToDeg(this.kmH);
  }

  private convertSpeedToDeg(speed: number) {
    return HomePage.START_POSITION + (speed * 1.35);
  }

  private initSubscribeAcelerometer() {
    window.addEventListener("devicemotion", (event) => {
      if (event.acceleration) {
        this.x = Math.abs(event.acceleration.x || this.x);
        this.y = Math.abs(event.acceleration.y || this.y);
        this.z = Math.abs(event.acceleration.z || this.z);
      }
      console.log(event.acceleration);
      console.log(event);
    }, true);

  }


}


