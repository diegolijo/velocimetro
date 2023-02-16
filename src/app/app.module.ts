import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { AndroidFullScreen } from '@awesome-cordova-plugins/android-full-screen/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { NativeGeocoder } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SpeechToText } from 'angular-speech-to-text';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpManager } from './services/http-provider';
import { LocationMngr } from './services/location-manager';
import { MongerIA } from './services/monger-ia';
import { UserData } from './services/UserData';
import { Util } from './services/util';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    Storage,
    LocationMngr,
    Geolocation,
    NativeGeocoder,
    LocationAccuracy,
    AndroidFullScreen,
    SpeechToText,
    NativeAudio,
    AndroidPermissions,
    MongerIA,
    HttpManager,
    HTTP,
    Util,
    NativeStorage,
    UserData,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
