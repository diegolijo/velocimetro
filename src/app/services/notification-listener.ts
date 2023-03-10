import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare const cordova: any;

@Injectable()
export class NotificationListener {

    private notificationObservable = new Subject<any>();

    constructor() { }

    public listen() {
        cordova.plugins.NotificationListener.listen((n) => {
            console.log('Received notification ' + JSON.stringify(n));
            this.notificationObservable.next({ notification: n });
        }, (e) => {
            console.log('Notification Error ' + e);
            this.notificationObservable.next({ error: e });
        });
    }

    public async hasPermission(): Promise<any> {
        const permission = await cordova.plugins.NotificationListener.hasPermission();
        console.log('permission: ' + JSON.stringify(permission));
        return permission;
    }

    public launchSettings() {
        cordova.plugins.NotificationListener.launchPermission();
    }

    public getObservable() {
        return this.notificationObservable.asObservable();
    }

}
