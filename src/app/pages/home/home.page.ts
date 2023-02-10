/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { IonSelect, Platform } from '@ionic/angular';
import { SpeechToText } from 'angular-speech-to-text';
import { LocationMngr } from '../../services/location-manager';
import { IResponse, MongerIA } from '../../services/monger-ia';
import { UserData } from '../../services/UserData';
import { Util } from '../../services/util';

export interface IVoice { name: string; locale: string; requiresNetwork: boolean; latency: number; quality: number }

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild('selectRef', { static: true }) selectRef!: IonSelect;

  private static DISTANCIA_MINIMA_RECORRIDA = 20 / 1000;
  private static DISTANCE_TO_RADAR = 2;

  private arrPositions: any = [];
  public distanceTraveled = 0;
  public ledIndex = 0;
  public factorLed = 1.14;
  public kmH = 0;
  public btnSelected: 'AUTOCRUISE' | 'NORMALCRUISE' | 'PURSUIT' = 'AUTOCRUISE';
  public x = 0;
  public y = 0;
  public z = 0;
  public module = 0;
  private bussy = false;
  private isRecording = false;
  private DEFAULT_LANG = 'es';
  private ES = 'vosk-model-small-es-0.42';
  public voices: IVoice[] = [];
  public selectedVoice = '';
  private adress: any;
  public lat = 0;
  public long = 0;
  public alt = 0;




  constructor(
    private platform: Platform,
    private location: LocationMngr,
    private speechToText: SpeechToText,
    private audio: NativeAudio,
    private androidPermissions: AndroidPermissions,
    private mongerIa: MongerIA,
    private util: Util,
    private userData: UserData
  ) { }


  getDevLat(lat: number, lon: number) {
    return { coords: { latitude: lat, longitude: lon } };
  }

  //iKnightRider
  //imichaelKnight
  async ngOnInit() {
    try {
      //  this.util.showMessage('chanfon es guay');
      if (this.platform.is('cordova')) {
        await this.platform.ready();
        this.requestPermissions();
        this.initSubscribePosition();
        this.initSubscribeAcelerometer();
        this.initSubscribeSpeechToText();
        await this.loadAudioSamples();
        this.voices = await this.speechToText.getSpeechVoices();
        return;
      }
      setInterval(() => {
        this.ledIndex = Math.round(Math.random() * 8);
        // this.kmH += 1;
      }, 200);
      /*       await this.mongerIa.getMeteo('sol', -8.97105767826291, 42.63869055614203, 'pobra', 'wind');
            await this.mongerIa.getWiki('perro'); */
      this.CheckRadars({ coords: { latitude: 42.86434551941315, longitude: -8.554476508704525, alt: 0.000014999999621 } });
    } catch (err) {
      console.log(err);
    }
  }


  public onClickBtn(event: any) {
    /*     if (this.btnSelected === event.currentTarget.textContent) { return; } */
    this.btnSelected = event.currentTarget.textContent;
    switch (event.currentTarget.textContent) {
      case 'AUTOCRUISE':
        this.speechToText.stopSpeech();
        this.isRecording = false;
        break;
      case 'NORMALCRUISE':
        this.speechToText.speechText('');
        break;
      case 'PURSUIT':
        this.speechToText.startSpeech();
        break;
      default:
        break;
    }
  }

  public onClickSelect() {
    this.selectRef.open();
  }

  async onChangeVoice(event: any) {
    this.selectedVoice = event.detail.value;
    // await this.translate.reloadLang(lang);
    this.speechToText.setSpeechVoice(this.selectedVoice);
  }

  public async onClickSpeechDireccion() {
    this.adress = await this.location.reverseGeocode(this.lat, this.long);
    this.speechToText.speechText('estamos en ' + this.adress[0].thoroughfare + ' ' + this.adress[0].subThoroughfare + ', ' + this.adress[0].locality);
  }

  public async onClickClearDistance() {
    this.util.showConfirmationAlert(
      'Atencion!',
      '¿Quieres resetear la distancia recorrida?',
      async () => {
        this.distanceTraveled = 0;
        await this.userData.setDistanceTraveled(0);
      },
      () => { }
    );
  }

  /************************************************************/

  private async requestPermissions() {
    const result = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO);
    const result2 = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT);
    if (result.hasPermission === false) {
      // grabar micro para pedir permisos;
    } else {
      console.log('permissions ok');
    }
  }

  private async initSubscribePosition() {
    await this.location.locationHiAccuracyRequest();
    this.location.initWatchPosition();
    this.distanceTraveled = await this.userData.getDistanceTraveled() || 0;
    this.location.getPositionObservable().subscribe(async (value: any) => {
      await this.updateDistance(value);
      this.onUpdatePosition(value);
      this.CheckRadars(value);
    });
  }

  private async updateDistance(value: any) {
    if (this.lat && this.long && this.arrPositions.length >= 5) {
      const last = this.arrPositions.shift();
      const distanceMedia = this.util.calculateDistance(
        last.coords.latitude, last.coords.longitude, value.coords.latitude, value.coords.longitude);
      const distanceInstant = this.util.calculateDistance(this.lat, this.long, value.coords.latitude, value.coords.longitude);
      console.log(((value.timestamp - last.timestamp) / 1000).toFixed(1) + ' seg. distance inst:' + distanceInstant + ' distance media: ' + distanceMedia);
      if (distanceMedia > HomePage.DISTANCIA_MINIMA_RECORRIDA) {  // 20 metros en 5 seg. + -
        this.distanceTraveled += distanceInstant;
        await this.userData.setDistanceTraveled(this.distanceTraveled);
      }
    }
    this.arrPositions.push(value);
  }

  private async onUpdatePosition(value: any) {
    this.lat = value.coords.latitude;
    this.long = value.coords.longitude;
    this.alt = value.coords.altitude;
    this.kmH = parseInt((value.coords.speed * 3.6).toFixed(), 10);
  }

  private async CheckRadars(value: any) {
    const closeRadars = LocationMngr.radarTJson.filter(el => this.isClosed(value, el));
    console.log(closeRadars);
    if (closeRadars.length) {
      this.alertRadar();
    }
    /* radarTJson; */
  }


  private isClosed(coords: any, el) {
    let value = false;
    const dist = this.util.calculateDistance(
      coords.coords.latitude, coords.coords.longitude, this.puntoMedio(el.coords).lat, this.puntoMedio(el.coords).long);
    if (dist < HomePage.DISTANCE_TO_RADAR && 'Radar Móvil' !== el.tipo) {
      value = true;
    }
    /*     if (dist < 20 && 'Radar Móvil' !== el.tipo) {
      console.log('distancia al radar: ' + dist.toFixed(1) + ' km - ' + el.carretera + ' km: ' + el.pk[0].toFixed(1) + ' tipo: ' + el.tipo + ' - ' + this.puntoMedio(el.coords).lat + ',' + this.puntoMedio(el.coords).long);
    } */
    return value;
  }

  private puntoMedio(arg0: any) {
    let lat = 0;
    let long = 0;
    for (const el of arg0) {
      lat += el.lat;
      long += el.long;
    }
    return { lat: lat / arg0.length, long: long / arg0.length };
  }

  /***************************************** ACELEDOMETER *******************************************/
  private initSubscribeAcelerometer() {
    window.addEventListener('devicemotion', (event) => {
      if (event.acceleration) {
        this.x = Math.abs(event.acceleration.x || this.x);
        this.y = Math.abs(event.acceleration.y || this.y);
        this.z = Math.abs(event.acceleration.z || this.z);
        this.module = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
      }
    }, true);
  }

  private async initSubscribeSpeechToText() {
    this.subscribeToSpeech();
    // **** STT ****
    const downloaded = await this.speechToText.getDownloadedLanguages();
    if (downloaded.length && downloaded[0] === this.ES) {
      console.log('downloaded: ' + downloaded[0]);
      await this.speechToText.enableSpeech(this.DEFAULT_LANG);
    } else {
      this.subscribeToDownload();
      this.speechToText.download(this.DEFAULT_LANG);
    }
    // **** TTS ****
    // TODO this.speechToText.setPtch()
  }

  private async subscribeToSpeech() {
    this.speechToText.subscrbeToSpeech(
      'home',
      async (value: any) => {
        console.log(JSON.stringify(value));
        //*****STT****
        if (value.action === 'recognize' && value.result === 'play') {
          this.isRecording = true;
        }
        // TODO recoger flag 'stop' y poner isRecording a 'false'
        if (!this.bussy) {
          switch (value.parcial) {
            case 'que':
              this.bussy = true;
              this.speechToText.speechText('Dime maiquel? ¿que tal estas?');
              break;
            case 'kit':
              this.bussy = true;
              this.speechToText.speechText('Dime maiquel? ¿que tal estas?');
              break;
            default:
              break;
          }
          if (value.texto) {
            this.bussy = true;
            const response: IResponse = await this.mongerIa.processSpeechResult(value.texto);
            this.speechToText.speechText(response.todas);
          }
        }
      },
      (err: any) => {
        console.log(err);
      },
      (progress: any) => {  // **** TTS ****
        console.log(progress);
        switch (progress.result) {
          case 'speech start':
            this.speechToText.stopSpeech();
            break;
          case 'speech done':
            setTimeout(() => {
              if (this.isRecording) {
                this.speechToText.startSpeech();
              }
              this.bussy = false;
            }, 100);
            break;
          case 'speech error':
            break;
          default:
            break;
        }
      });
  }

  private subscribeToDownload() {
    this.speechToText.subscrbeToDownload('download',
      async (value: any) => {
        console.log('download events: ' + JSON.stringify(value));
        switch (value.result) {
          case 'start':
            // TODO
            break;
          case 'vosk_model_extracting':
            // TODO
            break;
          case 'vosk_model_save':
            // TODO
            break;
          default:
            break;
        }
      }, (err: any) => {
        console.log('err download: ' + err);
      });
  }

  /******************************************** AUDIO *************************************/


  public loadAudioSamples() {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.platform.is('cordova')) {
          await this.audio.preloadComplex('DIME', 'assets/sounds/DIME.mp3', 1, 1, 0);
          await this.audio.preloadComplex('alarm', 'assets/sounds/DIME.mp3', 1, 1, 0);
        }
        resolve(true);
      } catch (err) {
        console.log(err);
        resolve(false);
      }
    });
  }

  public async play(value: string) {
    try {
      if (this.platform.is('cordova')) {
        this.bussy = true;
        await this.audio.play(value);
        this.bussy = false;
      }
    } catch (err) {
      console.log(err);
    }
  }


  private alertRadar() {
    this.play('alarm');
  }


}


