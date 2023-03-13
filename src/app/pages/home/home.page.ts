/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { IonSelect, Platform } from '@ionic/angular';
import { SpeechToText } from 'angular-speech-to-text';
import { LocationMngr } from '../../services/location-manager';
import { IResponse, MongerIA } from '../../services/monger-ia';
import { NotificationListener } from '../../services/notification-listener';
import { OcrService } from '../../services/ocr-service';
import { ProPhoto } from '../../services/photo-provider';
import { UserData } from '../../services/UserData';
import { Util } from '../../services/util';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { SpeechManager } from '../../services/speech-manager';
import { Subject } from 'rxjs';
//iKnightRider
//imichaelKnight

declare const screen: any;

const DEFAULT_LANG = 'es';

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
  public btnSelected: 'AUTOCRUISE' | 'NORMALCRUISE' | 'PURSUIT' = 'NORMALCRUISE';
  public x = 0;
  public y = 0;
  public z = 0;
  public module = 0;
  private bussy = false;
  private bussyNots = false;
  private ES = 'vosk-model-small-es-0.42';
  public voices: IVoice[] = [];
  public selectedVoice = '';
  private adress: any;
  public lat = 0;
  public long = 0;
  public alt = 0;
  public textOCR = '';

  private questionSubject = new Subject<boolean>();

  constructor(
    private platform: Platform,
    private location: LocationMngr,
    private speechToText: SpeechToText,
    private audio: NativeAudio,
    private androidPermissions: AndroidPermissions,
    private mongerIa: MongerIA,
    private util: Util,
    private userData: UserData,
    private router: Router,
    private ocr: OcrService,
    private proPhoto: ProPhoto,
    private notificationListener: NotificationListener,
    private scOrientation: ScreenOrientation,
    private speechManager: SpeechManager
  ) { }


  getDevLat(lat: number, lon: number) {
    return { coords: { latitude: lat, longitude: lon } };
  }

  async ngOnInit() {
    try {
      // this.util.showMessage('chanfon es gay<br> caca de  vaca <brpollas en vinagre');
      if (this.platform.is('cordova')) {
        await this.platform.ready();
        this.requestAudioPermissions();
        this.initSubscribePosition();
        this.initSubscribeAcelerometer();
        this.initSubscribeSpeechToText();
        await this.loadAudioSamples();
        this.voices = await this.speechToText.getSynthVoices();
        this.checkNotificationPermission();
        this.initSubscribeNotification();
        this.notificationListener.listen();
        this.scOrientation.lock(this.scOrientation.ORIENTATIONS.PORTRAIT);
        return;
      }
      setInterval(() => {
        this.ledIndex = Math.round(Math.random() * 8);
        // this.kmH += 1;
      }, 200);
      /*
      await this.mongerIa.getMeteo('sol', -8.97105767826291, 42.63869055614203, 'pobra', 'wind');
      await this.mongerIa.getWiki('perro');
      */
      this.CheckRadars({ coords: { latitude: 42.86434551941315, longitude: -8.554476508704525, alt: 0.000014999999621 } });
    } catch (err) {
      console.log(err);
    }
  }

  public async onClickBtn(event: any) {
    this.btnSelected = event.currentTarget.textContent;
    switch (event.currentTarget.textContent) {
      case 'AUTOCRUISE':
        await this.speechManager.startRecognizer(DEFAULT_LANG);
        break;
      case 'NORMALCRUISE':
        this.speechManager.stopRecognizer();
        break;
      case 'PURSUIT':
        await this.speechManager.synthText(`  escucharme?`);
        const value = await this.speechManager.checkQuestion('XXXX', `¿Quieres volves a escucharme?`);
        console.log('check speechText ' + value);
        if (value) {
          const e = event;
          this.onClickBtn(e);
        }
        break;
      default:
        break;
    }
  }

  public onClickGetNotifications() {
    this.getNotifications();
  }


  public onClickSelect() {
    this.selectRef.open();
  }

  public onClickMap() {
    this.router.navigate(['map']);
  }

  async onChangeVoice(event: any) {
    this.selectedVoice = event.detail.value;
    // await this.translate.reloadLang(lang);
    this.speechToText.setSynthVoice(this.selectedVoice);
  }

  public async onClickSpeechDireccion() {
    this.adress = await this.location.reverseGeocode(this.lat, this.long);
    const msg = 'estamos en ' + this.adress[0].thoroughfare + ' ' + this.adress[0].subThoroughfare + ', ' + this.adress[0].locality;
    this.speechToText.synthText(msg, true);
  }

  public async onClickClearDistance(event: any) {
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
  public async onOCR() {
    let b64Image;
    if (this.platform.is('cordova')) {
      b64Image = await this.proPhoto.takePhotoB64();
    }
    this.textOCR = await this.ocr.recognize(b64Image || 'https://tesseract.projectnaptha.com/img/eng_bw.png');
    this.util.showException(this.textOCR);
  }

  /************************************************************/
  private async requestAudioPermissions() {
    const result = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO);
    const result2 = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT);
    if (result.hasPermission === false) {
      // grabar micro para pedir permisos;
    } else {
      console.log('audio permissions ok');
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
      //    console.log(((value.timestamp - last.timestamp) / 1000).toFixed(1) + ' seg. distance inst (metros):' + distanceInstant * 1000 + ' distance media (metros): ' + distanceMedia * 1000);
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
    //   console.log(closeRadars);
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

  /***************************************** SPEECH *******************************************/
  getQuestionObservable() {
    this.questionSubject.asObservable();
  }

  private async initSubscribeSpeechToText() {
    const downloaded = await this.speechToText.getDownloadedLanguages();
    if (downloaded.length && downloaded[0] === this.ES) {
      console.log(downloaded[0] + ' is saved');
      await this.speechToText.enableRecognizer(DEFAULT_LANG);
    } else {
      this.speechToText.download(DEFAULT_LANG);
      this.subscribeToDownload();
    }
  }

  private async subscribeToSpeech() {
    this.speechToText.subscrbeToRecognizer('home',
      async (value: any) => {
        console.log(JSON.stringify(value));
        //**************************** STT *****************************
        if (!this.bussy) {
          switch (value.parcial) {
            case 'TODO':
              // TODO
              break;
            default:
              break;
          }
          if (value.texto && this.btnSelected === 'PURSUIT') {
            this.bussy = true;
            const response: IResponse = await this.mongerIa.processSpeechResult(value.texto);
            this.speechToText.synthText(response.todas, false);
          }
        }
      },
      (err: any) => {
        console.log(err);
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
            await this.speechToText.enableRecognizer(DEFAULT_LANG);
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

  /******************************** Notifications ****************************/
  private initSubscribeNotification() {
    console.log('subscribe to notifications');
    this.notificationListener.getObservable().subscribe(value => {
      this.notificationHandler(value);
    });
  }

  private async checkNotificationPermission() {
    const permission = await this.notificationListener.hasPermission();
    if (!permission) {
      // TODO alert explicando lo que tiene que activar en la cofig
      this.launchSettings();
    };
  }

  private launchSettings() {
    this.notificationListener.launchSettings();
  }

  // TODO hacerlo sincrono: cola de procesamiento ||  flush -> farzar return por defecto del proceso e ejecución
  private notificationHandler(value: any) {
    console.log('notification: ' + JSON.stringify(value, null, 4));
    if (this.btnSelected !== 'AUTOCRUISE') {
      return;
    }
    if (!value.notification.group) {
      switch (value.notification.package) {
        case 'com.whatsapp':
          this.processWhatsapp(value);
          break;
        case 'com.google.android.gm':
          this.processGMail(value);
          break;
        case 'com.android.systemui':
          this.processSystemui(value);
          break;
        case 'com.google.android.apps.dynamite':
          this.processChatGm(value);
          break;
        default:
          break;
      }
    }


  }
  async processChatGm(value: any) {

    if (!value.notification.group && !this.bussyNots) { //TODO meter en una cola las notificaciones y procesarlas en lote
      this.bussyNots = true;
      await this.speechManager.synthText(`Nuevo Gchat de ${value.notification.title} con asunto ${value.notification.text}`);
      const response = await this.speechManager.checkQuestion('processGMail', '¿quieres volver a escuchar el mensaje?');
      console.log('response: ' + response);
      if (response) {
        await this.processChatGm(value);
      }
      this.bussyNots = false;
      /*  notification: {
          "notification": {
              "id": "0|com.google.android.gm|0|377044571::SUMMARY::Chat|10145",
              "title": "",
              "package": "com.google.android.gm",
              "text": "",
              "textLines": "",
              "group": true, // TODO
              "onGoing": false
          }
      }
    notification: {
          "notification": {
              "id": "0|com.google.android.gm|0|377044571::a:AT_MENTION_STUBBY_HUB_DYNAMITE:/chime/space/vkmqZ4AAAAE|10145",
              "title": "diego Santiago",
              "package": "com.google.android.gm",
              "text": "prueba", //TODO texto
              "textLines": "",
              "group": false, // TODO
              "onGoing": false,
              "actions": [
                  {
                      "title": "Leído"
                  },
                  {
                      "title": "Responder"
                  }
              ]
          }
      }
  //     main.be2ec36097e6051c.js:1  ***** SpeechManagerSpeech speech start
    notification: {
          "notification": {
              "id": "0|com.google.android.apps.dynamite|0|377044571::SUMMARY::206ffa5b1e18220e2ec446a734206ed7|10249",
              "title": "",
              "package": "com.google.android.apps.dynamite",
              "text": "",
              "textLines": "",
              "group": true, // TODO
              "onGoing": false
          }
      }
    notification: {
          "notification": {
              "id": "0|com.google.android.apps.dynamite|0|377044571::a:AT_MENTION_STUBBY_HUB_DYNAMITE:/chime/space/vkmqZ4AAAAE|10249",
              "title": "diego Santiago",
              "package": "com.google.android.apps.dynamite",
              "text": "prueba", // TODO texto duplicado
              "textLines": "",
              "group": false, // TODO
              "onGoing": false,
              "actions": [
                  {
                      "title": "Leído"
                  },
                  {
                      "title": "Responder"
                  }
              ]
          }/*
      }
  /*     main.be2ec36097e6051c.js:1  ***** SpeechManagerSpeech speech done
      main.be2ec36097e6051c.js:1 speechManager.synthText
      main.be2ec36097e6051c.js:1  ***** SpeechManagerSpeech speech start
      main.be2ec36097e6051c.js:1  ***** SpeechManagerSpeech speech done
      main.be2ec36097e6051c.js:1 checkRecognizer On????
      main.be2ec36097e6051c.js:1 checkQuestion On???? undefined
      main.be2ec36097e6051c.js:1 SpeechManagerQuestion [object Object]
      main.be2ec36097e6051c.js:1 enableRecognizer -----------> [object Object]
      main.be2ec36097e6051c.js:1 ****** speechManager -> senbResponse
      98.9bb71c55f74ba6a3.js:1 response: false */
    }
  }

  processSystemui(value: any) {
    /*   { 'notification': { 'id': '-1|com.android.systemui|10006|null|10181', 'title': 'Carga completada', 'package': 'com.android.systemui',
    'text': 'La batería está llena', 'textLines': '', 'group': false, 'onGoing': false } }
     */
  }

  private async processGMail(value: any) {
    if (!value.notification.group && !this.bussyNots) { //TODO meter en una cola las notificaciones y procesarlas en lote
      this.bussyNots = true;
      await this.speechManager.synthText(`Nuevo correo de ${value.notification.title} con asunto ${value.notification.text}`);
      const response = await this.speechManager.checkQuestion('processGMail', '¿quieres volver a escuchar el mensaje?');
      console.log('response: ' + response);
      if (response) {
        await this.processGMail(value);
      }
      this.bussyNots = false;
    }
    /*

notification: {
    "notification": {
        "id": "0|com.google.android.gm|0|gig:377044571:PRIORITY_INBOX_IMPORTANT|10145",
        "title": "mí",
        "package": "com.google.android.gm",
        "text": "Re: prueba",
        "textLines": "",
        "group": true,
        "onGoing": false,
        "actions": [
            {
                "title": "Archivar"
            },
            {
                "title": "Responder"
            }
        ]
    }
}
 notification: {
    "notification": {
        "id": "0|com.google.android.gm|2017564114|gig:377044571:PRIORITY_INBOX_IMPORTANT|10145",
        "title": "mí",
        "package": "com.google.android.gm",
        "text": "Re: prueba",
        "textLines": "",
        "group": false,
        "onGoing": false,
        "actions": [
            {
                "title": "Archivar"
            },
            {
                "title": "Responder"
            }
        ]
    }
} */
  }

  private async processWhatsapp(value: any) {
    if (!value.notification.group) {
      const msg = value.notification.textLines || value.notification.text;
      await this.speechManager.synthText('whatsapp de ' + value.notification.title + '.: ' + msg);
      const response = await this.speechManager.checkQuestion('processGMail', '¿quieres volver a escuchar el mensaje?');
      console.log('response: ' + response);
      if (response) {
        await this.processGMail(value);
      }
    }
    /* notification: {
    "notification": {
        "id": "0|com.whatsapp|1|WaXGYcGzFUVX10WjvOc48MmszCxB8oTZ1fKMCUxk09I=\n|10240",
        "title": "Charlie Ava Martínez",
        "package": "com.whatsapp",
        "text": "Bravo!!! 😁",
        "textLines": "",
        "group": false,
        "onGoing": false,
        "actions": [
            {
                "title": "Responder"
            },
            {
                "title": "Marcar como leído"
            },
            {
                "title": "Silenciar"
            }
        ]
    }
}
notification: {
    "notification": {
        "id": "0|com.whatsapp|1|null|10240",
        "title": "Charlie Ava Martínez",
        "package": "com.whatsapp",
        "text": "Bravo!!! 😁",
        "textLines": "",
        "group": true,
        "onGoing": false
    }
} */
  }

  private async getNotifications() {
    return await this.notificationListener.getNotifications();
  }

  public async onClickClearSendAction() {
    this.notificationListener.sendAction({ notification: 0, action: 1 });
  }
}


