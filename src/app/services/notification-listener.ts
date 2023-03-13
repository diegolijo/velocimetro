/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface INotificacion {
    notification: {
        id: string;
        title: string;
        package: string;
        text: string;
        textLines: string;
        group: boolean;
        onGoing: boolean;
        actions?: [
            {
                title: string;
            },
            {
                title: string;
            }
        ];
    };
};

declare const cordova: any;

@Injectable()
export class NotificationListener {


    private notificationObservable = new Subject<any>();

    constructor() { }

    public listen() {
        cordova.plugins.NotificationListener.listen((n) => {

            this.notificationObservable.next({ notification: n });
        }, (e) => {
            this.notificationObservable.next({ error: e });
        });
    }

    public async hasPermission(): Promise<any> {
        return new Promise((rs, rj) => {
            cordova.plugins.NotificationListener.hasPermission((permission) => {
                rs(permission);
            }, (e) => {
                rj(e);
            });
        });
    }

    public launchSettings() {
        return new Promise((rs, rj) => {
            cordova.plugins.NotificationListener.launchSettings((launch) => {
                rs(launch);
            }, (e) => {
                rj(e);
            });
        });
    }

    public getObservable() {
        return this.notificationObservable.asObservable();
    }

    public getNotifications() {
        return new Promise((rs, rj) => {
            cordova.plugins.NotificationListener.getNotifications((notifications) => {
                console.log('Get Notifications: ' + JSON.stringify(notifications, null, 4));
                rs(notifications);
            }, (e) => {
                rj(e);
            });
        });
    }

    public sendAction(values) {
        cordova.plugins.NotificationListener.sendAction(values);
    }

}
