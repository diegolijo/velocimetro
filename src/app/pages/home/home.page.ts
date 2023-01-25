/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AndroidFullScreen } from '@awesome-cordova-plugins/android-full-screen/ngx';
import { IonSegment, Platform } from '@ionic/angular';
import { SpeechToText } from 'angular-speech-to-text';
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
  public module = 0;
  langs: any;

  constructor(
    private platform: Platform,
    private androidFullScreen: AndroidFullScreen,
    private location: LocationMngr,
    private speechToText: SpeechToText
  ) { }

  async ngOnInit() {
    try {
      if (this.platform.is('cordova')) {
        await this.platform.ready();
        this.initSubscribePosition();
        this.initSubscribeAcelerometer();
       // this.initSubscribeSpeechToText();
        await this.androidFullScreen.immersiveMode();
        return;
      }
      setInterval(() => {
        this.ledIndex = Math.round(Math.random() * 8);
      }, 200);
    } catch (err) {
      console.log(err);
    }
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
        this.module = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2))
      }
    }, true);
  }

  private async initSubscribeSpeechToText() {
    this.subscribeToSpeech();
    const downloaded = await this.speechToText.getDownloadedLanguages();
    if (downloaded.length && downloaded[0] === 'vosk-model-small-es-0.3') {
      console.log('downloaded: ' + downloaded[0]);
      /*       await this.speechToText.enableSpeech('es');
            await this.speechToText.startSpeech(); */
    } else {

      this.subscribeToDownload();
      await this.speechToText.download('es');
    }
  }

  private subscribeToDownload() {
    this.speechToText.subscrbeToDownload('download',
      async (value: any) => {
        console.log('download events: ' + value)
        /*         await this.speechToText.enableSpeech('es');
                await this.speechToText.startSpeech(); */
      }, (err: any) => {
        console.log('err download: ' + err);
      });
  }

  private subscribeToSpeech() {
    this.speechToText.subscrbeToSpeech(
      'speech',
      (value: any) => {
        console.log(value);
      },
      (err: any) => {
        console.log(err);
      });
  }

}


