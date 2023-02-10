import { Injectable } from '@angular/core';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderOptions } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { Subject, Subscription } from 'rxjs';

@Injectable()
export class LocationMngr {


    static radarFJson = require('../../assets/radars/fijosEsp.json');
    static radarTJson = require('../../assets/radars/noMovilEsp.json');

    public lastLocation: any;
    private locationObservable = new Subject<any>();
    private locationSubscription!: Subscription;
    private subscribePosition!: any;

    constructor(
        private geolocation: Geolocation,
        private nativeGeocoder: NativeGeocoder,
        public locationAccuracy: LocationAccuracy,
    ) { }

    async locationHiAccuracyRequest() {
        return await this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
    }

    public initWatchPosition() {
        if (!this.locationSubscription || this.locationSubscription.closed) {
            const highAccOpt = {
                enableHighAccuracy: true,
                timeout: 1000 * 5,
                maximunAge: 0
            };
            this.subscribePosition = this.geolocation.watchPosition(highAccOpt).subscribe(
                (resp: any) => {
                    this.locationObservable.next(resp);
                    this.lastLocation = resp;
                }, (error: any) => {
                    throw error;
                });
        }
    }

    public stopGeolocating() {
        if (this.subscribePosition) {
            // this.geolocation.clearWatch(this.subscribePosition);  -> llamar al complemento cordova dirtectamente
        }
    }

    public getPositionObservable() {
        return this.locationObservable.asObservable();
    }


    public async getCurrentPosition() {
        return new Promise(async (resolve, reject) => {
            try {
                const highAccOpt = {
                    enableHighAccuracy: true,
                    timeout: 1000 * 30,
                    maximunAge: 0
                };
                this.lastLocation = await this.geolocation.getCurrentPosition(highAccOpt);
                resolve(this.lastLocation);
            } catch (err) {
                reject(err);
            }
        });
    }


    public async forwardGeocode(adress: string) {
        try {
            const options: NativeGeocoderOptions = {
                useLocale: true,
                maxResults: 5
            };
            const res = await this.nativeGeocoder.forwardGeocode(adress, options);
            const latLng = {
                lat: Number.parseFloat(res[0].latitude),
                lng: Number.parseFloat(res[0].longitude)
            };
            return latLng;
        } catch (err) {
            return null;
        }
    }

    public async reverseGeocode(lat: number, long: number) {
        try {
            const options: NativeGeocoderOptions = {
                useLocale: true,
                maxResults: 5
            };
            const res = await this.nativeGeocoder.reverseGeocode(lat, long, options);
            console.log(res);
            return res;
        } catch (err) {
            return null;
        }
    }


}


