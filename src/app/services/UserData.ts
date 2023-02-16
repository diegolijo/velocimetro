/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable object-shorthand */
import { Injectable } from '@angular/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';


@Injectable()
export class UserData {
    private readonly APP_PREFIX = 'KITT';
    private storageObservable = new Subject<any>();

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


    public async init() {
        return new Promise((resolve, reject) => {
            this.storageBrowser.create().then(() => {
                resolve(true);
            }, (err) => {
                reject(err);
            });
        });
    }

    private setItem(key: string, value: any): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.platform.is('cordova')) {
                this.storageNative.setItem(key, value).then(() => {
                    resolve();
                }, (err: any) => {
                    reject(err);
                });
            } else {
                this.storageBrowser.set(key, value).then(() => {
                    this.storageObservable.next({ key, value });
                    resolve();
                }, (err: any) => {
                    reject(err);
                });
            }
        });
    }

    private getItem(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.platform.is('cordova')) {
                this.storageNative.getItem(key).then((value: any) => {
                    resolve(value);
                }, (err: any) => {
                    if (err.code === 2) {
                        resolve(null);
                    } else {
                        reject(err);
                    }
                });
            } else {
                this.storageBrowser.get(key).then((value: any) => {
                    resolve(value);
                }, (err: any) => {
                    if (err.code === 2) {
                        resolve(null);
                    } else {
                        reject(err);
                    }
                });
            }
        });
    }

    private removeItem(key: string) {
        return new Promise((resolve, reject) => {
            if (this.platform.is('cordova')) {
                this.storageNative.remove(key).then(() => {
                    resolve(null);
                }).catch((err: any) => {
                    reject(err);
                });
            } else {
                this.storageBrowser.remove(key).then(() => {
                    resolve(null);
                }).catch((err: any) => {
                    reject(err);
                });
            }
        });
    }

    private clear() {
        return new Promise((resolve, reject) => {
            if (this.platform.is('cordova')) {
                this.storageNative.clear().then(() => {
                    resolve(null);
                }, (err: any) => {
                    reject(err);
                });
            } else {
                this.storageBrowser.clear().then(() => {
                    resolve(null);
                }, (err: any) => {
                    reject(err);
                });
            }
        });
    }
}
