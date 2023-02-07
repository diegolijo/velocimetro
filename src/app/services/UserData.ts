/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable object-shorthand */
import { Injectable } from '@angular/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';


@Injectable()
export class UserData {
    private readonly APP_PREFIX = 'KITT';

    constructor(
        public platform: Platform,
        public storageBrowser: Storage,
        public storageNative: NativeStorage
    ) { }

    public setDistanceTraveled(meters: number) {
        return this.setItem(this.APP_PREFIX + 'traveled', meters);
    }

    public getDistanceTraveled() {
        return this.getItem(this.APP_PREFIX + 'traveled');
    }

    private setItem(key: string, value: any): Promise<void> {
        if (this.platform.is('cordova')) {
            return new Promise((resolve, reject) => {
                this.storageNative.setItem(key, value).then(() => {
                    resolve();
                }, (err: any) => {
                    reject(err);
                });
            });
        } else {
            return this.storageBrowser.set(key, value);
        }
    }

    private getItem(key: string): Promise<any> {
        if (this.platform.is('cordova')) {
            return new Promise((resolve, reject) => {
                this.storageNative.getItem(key).then((value: any) => {
                    resolve(value);
                }, (err: any) => {
                    if (err.code === 2) {
                        resolve(null);
                    } else {
                        reject(err);
                    }
                });
            });
        } else {
            return this.storageBrowser.get(key);
        }
    }

    private removeItem(key: string) {
        if (this.platform.is('cordova')) {
            return new Promise((resolve, reject) => {
                this.storageNative.remove(key).then(() => {
                    resolve(null);
                }).catch((err: any) => {
                    reject(err);
                });
            });
        } else {
            return this.storageBrowser.remove(key);
        }
    }

    private clear() {
        if (this.platform.is('cordova')) {
            return new Promise((resolve, reject) => {
                this.storageNative.clear().then(() => {
                    resolve(null);
                }, (err: any) => {
                    reject(err);
                });
            });
        } else {
            return this.storageBrowser.clear();
        }
    }
}
