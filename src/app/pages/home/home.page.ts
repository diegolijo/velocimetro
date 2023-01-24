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

  constructor(
    private platform: Platform,
    private androidFullScreen: AndroidFullScreen,
    private location: LocationMngr
  ) { }

  async ngOnInit() {
    if (this.platform.is('cordova')) {
      await this.platform.ready();
      this.initSubscribePosition();
      await this.androidFullScreen.immersiveMode();
      return;
    }
    setInterval(() => {
      this.deg = this.convertSpeedToDeg(Math.random() * 20);
    }, 100);
  }

  private async initSubscribePosition() {
    await this.location.locationHiAccuracyRequest();
    this.location.initWatchPosition();
    this.location.getPositionObservable().subscribe((value: any) => {
      this.onUpdatePosition(value);
    });
  }

  private onUpdatePosition(value: any) {
    const kmH = value.coords.speed * 3.6;
    this.deg = this.convertSpeedToDeg(kmH);
  }

  private convertSpeedToDeg(speed: number) {
    return HomePage.START_POSITION + (speed * 1.35);
  }



}


