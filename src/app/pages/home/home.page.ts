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
  private static START_POSITION = -135;
  private static RADIO_TIERRA_EN_KILOMETROS = 6371;

  private arrPositions: any = [];
  public distanceTraveled = 0;
  public deg = HomePage.START_POSITION;
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

  async ngOnInit() {
    try {
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
      await this.mongerIa.getMeteo('sol', -8.536549, 42.875713);
      await this.mongerIa.getWiki('perro');
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

  public async onClickDireccion() {
    this.adress = await this.location.reverseGeocode(this.lat, this.long);
    console.log(this.adress[0].addressLines[0]);
    this.speechToText.speechText('estamos en, ' + this.adress[0].addressLines[0]);
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
    this.location.getPositionObservable().subscribe((value: any) => {
      this.onUpdatePosition(value);
    });
  }

  private async onUpdatePosition(value: any) {
    this.distanceTraveled = await this.updateDistance(value, this.distanceTraveled);
    this.lat = value.coords.latitude;
    this.long = value.coords.longitude;
    this.alt = value.coords.altitude;
    this.kmH = parseInt((value.coords.speed * 3.6).toFixed(), 10);
    this.deg = HomePage.START_POSITION + (this.kmH * 1.35); //TODO mover a analog-meter.component
  }

  private async updateDistance(value: any, distanceTraveled: number) {
    let distance = distanceTraveled;
    if (this.lat && this.long && this.arrPositions.length >= 5) {
      const distanceMedia = this.calculateDistance(
        this.arrPositions[4].coords.latitude, this.arrPositions[4].coords.longitude, value.coords.latitude, value.coords.longitude);
      if (distanceMedia > 0.00002) {
        distance += this.calculateDistance(this.lat, this.long, value.coords.latitude, value.coords.longitude);
        await this.userData.setDistanceTraveled(this.distanceTraveled);
      }
    }
    this.arrPositions.push(value);
    return distance;
  }

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

  //************************************** DISTANCIAS *************************************/
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    // Convertir todas las coordenadas a radianes
    lat1 = this.degToRad(lat1);
    lon1 = this.degToRad(lon1);
    lat2 = this.degToRad(lat2);
    lon2 = this.degToRad(lon2);
    // Aplicar fórmula
    const longsDiff = lon2 - lon1;
    const latsDiff = lat2 - lat1;
    const a = Math.pow(Math.sin(latsDiff / 2.0), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(longsDiff / 2.0), 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * HomePage.RADIO_TIERRA_EN_KILOMETROS;
    return c / 1000;
  };


  private degToRad(grados: number) {
    return grados * Math.PI / 180;
  };

}


