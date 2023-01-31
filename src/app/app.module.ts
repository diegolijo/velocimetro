import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { AndroidFullScreen } from '@awesome-cordova-plugins/android-full-screen/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { NativeGeocoder } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SpeechToText } from 'angular-speech-to-text';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpManager } from './services/http-provider';
import { LocationMngr } from './services/location-manager';
import { MongerIA } from './services/monger-ia';
import { ProStorage } from './services/storage-provider';

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
    ProStorage,
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
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
