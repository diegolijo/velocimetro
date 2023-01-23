/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';

@Injectable()
export class ProStorage {


    public readonly AUTORANGE = 'AUTORANGE';
    public readonly RANGE_HOLD_TIME = 'RANGE_HOLD_TIME';
    public readonly CALIBRATE_INFO = 'INFO_CALIBRATE';

    private storageObservable = new Subject<any>();

    constructor(
        public platform: Platform,
        private storage: Storage,
    ) { }


    public async init() {
        return new Promise((resolve, reject) => {
            this.storage.create().then(() => {
                resolve(true);
            }, (err) => {
                reject(err);
            });
        });
    }

    public setItem(key: string, value: any) {
        return new Promise((resolve, reject) => {
            this.storage.set(key, value).then(() => {
                this.storageObservable.next({ key, value });
                resolve(null);
            }, (err: any) => {
                reject(err);
            });
        });
    }

    public getItem(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.storage.get(key).then((value: any) => {
                resolve(value);
            }, (err: any) => {
                if (err.code === 2) {
                    resolve(null);
                } else {
                    reject(err);
                }
            });
        });
    }

    public removeItem(key: string) {

        return new Promise((resolve, reject) => {
            this.storage.remove(key).then(() => {
                resolve(null);
            }).catch((err: any) => {
                reject(err);
            });
        });

    }

    public clear() {
        return new Promise((resolve, reject) => {
            this.storage.clear().then(() => {
                resolve(null);
            }, (err: any) => {
                reject(err);
            });
        });
    }
}
