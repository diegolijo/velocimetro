/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable object-shorthand */
/* eslint-disable no-bitwise */
/* eslint-disable one-var */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
//import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import {
    ActionSheetController,
    AlertController, IonicSafeString, LoadingController, ModalController, Platform, PopoverController, ToastController
} from '@ionic/angular';
//import { TranslateService } from '@ngx-translate/core';
import { format, parse } from 'date-fns';
import es from 'date-fns/locale/es';
//import { UserData } from './user-data';

export interface IappLoader {
    spinner?: 'circles' | 'bubbles' | 'circular' | 'crescent' | 'dots' | 'lines' | 'lines-small' | 'lines-sharp' | 'lines-sharp-small' | null | undefined;
    translucent?: boolean;
    cssClass?: string | string[];
    message?: string | IonicSafeString;
    backdropDismiss?: boolean;
    idFn?: string;
    shown?: boolean;
    present?: any;
    dismiss?: any;
}

export interface ITest {
    response: any;
    seg: number;
    download_Size: number;
    speed_Kbps: number;
    speed_Mbps: number;
}


@Injectable()
export class Util {

    private static RADIO_TIERRA_EN_KILOMETROS = 6371;

    private toastMgs: HTMLIonToastElement | undefined;
    public confirmationAlert: HTMLIonAlertElement | undefined;
    private subscribeAlertBackButton: any;

    public timeOutLoader: any;
    public appLoader: IappLoader = { shown: false };
    public loaderInterval: any;
    public timeLoaderInterval = 1000;

    constructor(
        //  private socialSharing: SocialSharing,
        private platform: Platform,
        private alertCtrl: AlertController,
        private loaderCntlr: LoadingController,
        private toastController: ToastController,
        private loadingCtrl: LoadingController,
        private popoverCtrl: PopoverController,
        private actionSheetCtrl: ActionSheetController,
        private modalCtrl: ModalController,
        private audio: NativeAudio,
        //  private userData: UserData
        /*    private device: Device,
         private scannerProvider: ScannerProvider */

    ) { }

    // ************************************************ ELEMENTOS UI ********************************************************

    /**
     * @param msg mensaje del loader
     * @param idFn función desde la que se lanza el loader
     * @param shown flag para controlar si el loader está abierto
     * @param options :
     *  spinner?: SpinnerTypes | null;
     *  message?: string;
     *  cssClass?: string | string[];
     *  translucent?: boolean;
     *  backdropDismiss?: boolean;
     * }
     */
    public async showLoader(msg?: string, idFn?: string, options?: any): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.appLoader.shown) {
                    // console.log('cambiar mensaje a loader ' + (msg || 'sin-mensaje.') + 'Anterior idFn: ' + this.appLoader.idFn);
                    this.appLoader.idFn = idFn || '';
                    this.appLoader.message = msg || 'cargando...';
                    await this.setLoaderTimeout();
                    resolve(true);
                    return;
                }
                // console.log('abrir loader, no hay uno anterior');
                this.appLoader.shown = true;
                this.appLoader.idFn = idFn || '';
                if (options) {
                    options.mensaje = options.mensaje ? options.mensaje : msg || 'cargando...';
                }
                const opt = {
                    spinner: 'circles',
                    translucent: true,
                    cssClass: 'app-loader',
                    message: msg || 'cargando...',
                    backdropDismiss: true
                };
                this.appLoader = await this.loadingCtrl.create(options || opt) || { shown: false };;
                this.appLoader.idFn = idFn || '';
                this.appLoader.shown = true;
                await this.appLoader.present();

                this.setLoaderInterval();
                await this.setLoaderTimeout();
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }


    /**
     * cierra el loader que hay en pantalla.
     */
    public async closeLoader(idFn?: string, exception?: boolean): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                setTimeout(async () => {
                    if (exception && this.appLoader.shown) {
                        //  console.log('cerrar loader por excepción');
                        await clearTimeout(this.timeOutLoader);
                        await this.appLoader.dismiss();
                        this.appLoader.shown = false;
                    }
                    if (!exception && this.appLoader.shown) {
                        if (this.appLoader.idFn === idFn) {
                            //    console.log('cerrar loader con = idFn ' + idFn);
                            this.appLoader.dismiss();
                            if (this.timeOutLoader) {
                                await clearTimeout(this.timeOutLoader);
                            }
                            this.appLoader.shown = false;
                        } else if (!idFn && this.appLoader.shown) {
                            //  console.log('cerrar loader sin idFn');
                            this.appLoader.dismiss();
                            if (this.timeOutLoader) {
                                await clearTimeout(this.timeOutLoader);
                            }
                            this.appLoader.shown = false;
                        } else if (this.appLoader.idFn && this.appLoader.idFn !== idFn) {
                            //   console.log('intentamos cerrar un loader ->' + this.appLoader.idFn + ' proporcionamos -> ' + idFn);
                        }
                    }
                }, idFn ? 500 : 1);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }

    private async setLoaderTimeout() {
        if (this.timeOutLoader) {
            await clearTimeout(this.timeOutLoader);
            this.timeOutLoader = null;
        }
        this.timeOutLoader = setTimeout(async () => {
            this.showException(
                await 'Tiempo de espera agotado');
        }, 1 * 60);
    }


    private setLoaderInterval() {
        if (!this.loaderInterval) {
            this.loaderInterval = setInterval(() => {
                this.chekLoaderIsOpen();
            }, this.timeLoaderInterval);
        }
    }

    private clearLoaderInterval() {
        clearInterval(this.loaderInterval);
        delete this.loaderInterval;
    }

    private async chekLoaderIsOpen() {
        if (!this.appLoader.shown) {
            const loader = await this.loaderCntlr.getTop();
            if (loader) {
                loader.dismiss();
            } else {
                this.clearLoaderInterval();
            }
        }
    }

    public async showMessage(mes: any, toastColor?: string) {
        mes = typeof mes === 'string' ? mes : this.getErrorMsg(mes, '');
        await this.closeLoader();
        if (this.toastMgs && this.toastMgs.isConnected) {
            await this.toastMgs.dismiss();
        }
        const options: any = {
            message: mes,
            cssClass: 'toastMarginTop',
            position: 'top',
            duration: 1000 * 6,
            color: toastColor
        };
        this.toastMgs = await this.toastController.create(options);
        await this.toastMgs.present();
    }

    public async showClosableMessage(mes: any, funcion?: any) {
        await this.closeLoader();
        const loading = await this.loadingCtrl.create({ message: '' });
        loading.dismiss();
        const toast = await this.toastController.create({
            message: mes,
            cssClass: 'toastMarginBottom',
            position: 'bottom',
            keyboardClose: true,
            buttons: [
                {
                    text: 'Cerrar',
                    side: 'start',
                    handler: () => {
                        if (funcion) {
                            funcion();
                        }
                    }
                }
            ]
        });
        await toast.present();
    }

    public async showException(error: any, tag?: string) {
        await this.closeLoader(undefined, true);
        let msg = '';
        if (typeof error.message !== 'undefined') {
            msg = error.message;
        } else if (typeof error.msg !== 'undefined') {
            msg = error.msg;
        } else if (typeof error.error !== 'undefined') {
            msg = error.error;
        } else if (typeof error === 'string') {
            msg = error;
        } else if (typeof error === 'object') {
            msg = this.getErrorMsg(error, msg);
        }
        msg = tag ? tag + ': <br> ' + msg : msg;
        const butons: any = [];
        /*         butons.push({
                    cssClass: 'primary-fonts',
                    text: 'enviar',
                    handler: async () => {
                        this.sendMail(msg + '\n' + error.stack);
                    }
                }); */
        if (error.stack) {
            butons.push({
                cssClass: 'primary-fonts',
                text: 'detalles',
                handler: async () => {
                    this.showException(error.stack);
                }
            });
        }
        butons.push({
            cssClass: 'primary-fonts',
            text: 'aceptar',
            handler: async () => {
                this.alertCtrl.dismiss();
            }
        });
        const alert = await this.alertCtrl.create({
            message: msg,
            keyboardClose: true,
            buttons: butons,
            cssClass: 'alert-exception'
        });
        await alert.present();
        await alert.onDidDismiss();
        console.error(msg);
        console.trace();
    }

    /**
     * recorre las propiedades de un objeto e imprime su contenido, si ulguna propiedades es un objeto
     * realiza la operacion recursivamente
     */
    private getErrorMsg(error: any, msg: any) {
        for (const key in error) {
            if (Object.prototype.hasOwnProperty.call(error, key)) {
                if (typeof error[key] === 'object') {
                    msg += this.getErrorMsg(error[key], msg);
                } else if (typeof error[key] === 'string') {
                    msg += error[key] + '\n';
                }
            }
        }
        return msg ? msg : 'error indefinido';
    }

    /**
     * USO:
     *  const result = await this.helper.showConfirmationAlert(
     *    'titulo del mensaje',
     *    'cuerpo del mensaje'
     *    async () => { await this.functionAccept(); },
     *    () => { this.functionCancel(); });
     *
     *    los botones  cancelar y descartar se hacen visibles al pasarle una funcion por parametro.
     *    Si queremos que este visible pero no haga nada (p.ej boton cancelar para  cerrar el alert unicamente)
     *    le pasaremos una funcion vacía:   ()=>{}
     *
     * @returns  Promise<string> = 'accept'/'discard'/'cancel'/'isConnected' si ya hay un alert en pantalla
     */
    public async showConfirmationAlert(
        headerMsg: string,
        msg: string,
        functionAccept: any,
        functionCancel?: any,
        functionDiscard?: any): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.closeLoader();
                if (this.confirmationAlert && this.confirmationAlert.isConnected) {
                    resolve('isConnected');
                    return;
                }
                if (!this.subscribeAlertBackButton || this.subscribeAlertBackButton.closed) {
                    this.subscribeAlertBackButton = this.platform.backButton.subscribeWithPriority(10000000000, async () => {
                        if (this.confirmationAlert) {
                            const role = functionDiscard ? 'discard' : 'cancel';
                            await this.confirmationAlert.dismiss(null, role);
                        }
                    });
                }
                const options = {
                    header: headerMsg,
                    message: msg,
                    cssClass: 'confirmation-alert',
                    buttons: [{
                        cssClass: 'primary-fonts',
                        text: 'aceptar',
                        role: 'accept'
                    }]
                };
                if (functionDiscard) {
                    options.buttons.unshift({
                        cssClass: 'primary-fonts',
                        text: 'descartar',
                        role: 'discard'
                    });
                }
                if (functionCancel) {
                    options.buttons.unshift({
                        cssClass: 'primary-fonts',
                        text: 'cancelar',
                        role: 'cancel'
                    });
                }
                this.confirmationAlert = await this.alertCtrl.create(options);
                await this.confirmationAlert.present();
                const res = await this.confirmationAlert.onDidDismiss();
                switch (res.role) {
                    case 'accept':
                        await functionAccept();
                        break;
                    case 'discard':
                        await functionDiscard();
                        break;
                    case 'cancel':
                        await functionCancel();
                        break;
                    default:
                        break;
                }
                if (this.subscribeAlertBackButton && !this.subscribeAlertBackButton.closed) {
                    await this.delay(100);
                    this.subscribeAlertBackButton.unsubscribe();
                }
                resolve(res.role || '');
            } catch (err) {
                reject(err);
            }
        });
    }

    public async showModal(
        component: any,
        componentProps: any,
        id?: string,
        functionSuccess?: any,
        functionCancel?: any,): Promise<any> {
        return new Promise(async (rs, rj) => {
            try {
                const window = await this.modalCtrl.create({
                    component: component,
                    componentProps: componentProps,
                    id: id
                });
                await window.present();
                const result = await window.onDidDismiss();
                if (result.data && result.data.result !== 'cancelled') {
                    if (functionSuccess) { await functionSuccess(); }
                    rs(result.data);
                } else if (result.data && result.data.result === 'cancelled') {
                    if (functionCancel) { await functionCancel(); }
                    rs({ result: 'cancelled' });
                } else if (result && result.role === 'backdrop') {
                    rs({ result: 'backdrop' });
                }
            } catch (error) {
                rj(error);
            }
        });
    }


    /**
     * cierra la interface abierta en pantalla
     * utilizado para cerrar los dialogos desplegados de ion-select cuando navegamos atras
     * devuelve true si cerró algun dialogo
     */
    public async closeDialogs() {
        return new Promise(async (resolve, reject) => {
            try {
                let res = false;
                const popRes = await this.popoverCtrl.getTop();
                const actionRes = await this.actionSheetCtrl.getTop();
                const alertRes = await this.alertCtrl.getTop();
                if (popRes) {
                    res = await this.popoverCtrl.dismiss();
                }
                if (actionRes) {
                    res = await this.actionSheetCtrl.dismiss();
                }
                if (alertRes) {
                    res = await this.alertCtrl.dismiss();
                }
                resolve(res);
            } catch (err) {
                reject(err);
            }
        });

    }


    /**
     * comprobamos campos obligatorios (requiredFields) en cada uno de los elementos del array de entrada (data)
     * si falla lanza una excepcion indicando objeto y campo
     */
    public checkRequiredFields(data: any[], requiredFields: string[], object: string) {
        for (const row of data) {
            for (const field of requiredFields) {
                if (!row.hasOwnProperty(field)) {
                    throw new Error('El campo ' + field + ' es obligatorio en la tabla ' + object + '\n');
                } else {
                    for (const key in row) {
                        if (Object.prototype.hasOwnProperty.call(object, key) && key === field && row[key] === '') {
                            throw new Error('El campo ' + field + ' es obligatorio en la tabla ' + object + '\n');
                        }
                    }
                }
            }
        }
    }

    /**
     * comprueba el formato del campo hora y lo adapta a hh:mm, en caso de fallo asigna el valor '00:00'
     */
    public prepareHourFormat(pt_hora: string) {
        if (!pt_hora) {
            return '00:00';
        }
        const arrHora = pt_hora.split(':');
        if (arrHora.length < 2) {
            return '00:00';
        }
        const hh = Number.parseInt(arrHora[0], 10);
        const mm = Number.parseInt(arrHora[1], 10);
        if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
            return '00:00';
        }
        let stHora = (hh < 10 ? '0' + hh : hh.toString()) + ':';
        stHora += mm < 10 ? '0' + mm : mm.toString();
        return stHora;
    }

    // return '2008-01-31T00:00:00.000Z'
    public getDateFromERPDate(data: string): any {
        try {
            const dataText = data.split('/').reverse().join('-');
            return new Date(dataText).toISOString();
        } catch (err) {
            return '';
        }

    }

    // return '2008-01-31'
    public getSdateYMDFromERPData(data: string): any {
        const dataText = data.split('/').reverse().join('-');
        return dataText;
    }

    public getDateFromERP(date: string): any {
        return parse(date, 'dd/MM/yyyy', new Date());
    }

    public formatDateForVehicle(date: Date): any {
        return format(date, 'dd/MM/yyyy', { locale: es });
    }

    public formatDateForERP(date: string, locale: any): string {
        const dateObj = Date.parse(date);
        return format(dateObj, 'dd/MM/yyyy', { [locale]: locale });
    }

    public formatDateForUser(date: any, locale: any): string {
        const result = format(Date.parse(date), 'dd-MM-yyyy HH:mm:ss', { [locale]: locale });
        return result;
    }

    public getTimeFromDate(date: string, locale: any): string {
        return format(Date.parse(date), 'HH:mm:ss', { [locale]: locale });
    }

    public nowIsoDate(): string {
        return new Date().toISOString();
    }

    public toIsoDate(pt_fecp: string): any {
        const date = parse(pt_fecp, 'dd/MM/yyyy', new Date());
        return date.toISOString();
    }

    public formatToIonDatetime(date: Date): string {
        return format(date, 'yyyy-MM-dd', { locale: es });
    }

    // param locale is locale object -> e.g const esLocale = require('date-fns/locale/es');
    formatDate(dateToFormat: string, datePattern: string, locale: any) {
        if (!dateToFormat || dateToFormat.length === 0) {
            return '';
        }
        const parsedDate = parse(dateToFormat, 'yyyy-MM-dd HH:mm:ss', new Date());
        const formattedDate = format(parsedDate, datePattern, { [locale]: locale });
        return formattedDate;
    }

    formatDateToIonicDatetime(dateToFormat: any) {
        const dateIn = typeof dateToFormat === 'string' ? this.getDateFromIsoSt(dateToFormat) : dateToFormat;
        return format(dateIn, 'yyyy-MM-dd\'T\'HH:mm:ssXXX', { locale: es });
    }

    getDateFromIsoSt(dateToFormat: string): Date {
        const parsedDate: Date = parse(dateToFormat, 'yyyy-MM-dd HH:mm:ss', new Date());
        return parsedDate;
    }


    public generateGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            // tslint:disable-next-line: no-bitwise
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


    public isNumber(dato: string) {
        const valoresAceptados = /^(-)?[0-9]*(\.?)[0-9]+$/;
        if (dato.match(valoresAceptados)) {
            return true;
        } else {
            return false;
        }
    }

    // valida un número aun no terminado, ej: 56.
    public canBeNumber(dato: string) {
        const valoresAceptados = /^(-)?[0-9]*(\.?)([0-9]?)+$/;
        if (dato.match(valoresAceptados)) {
            return true;
        } else {
            return false;
        }
    }

    public hasLength(dato: string | any[]) {
        let res = false;
        if (Array.isArray(dato)) {
            res = (dato.length > 0) ? true : false;
        }
        return res;
    }




    // *************************************************  socialSharing ****************************************************
    /**
     * lanza la actividad para compartir por correo
     */
    /*     public async sendMail(msg: string, subject?: string, to?: string[]) {
            const company: ICompany = await this.userData.getCompany();
            const asunto = company.deno + ' - ' + company.user;
            this.socialSharing.canShareViaEmail().then(() => {
                this.socialSharing.shareViaEmail(msg, asunto + ' ' + subject || '', to);
            }).catch((err) => {
                this.showException(err);
            });
        }
        public async share(msg: string, subject: string, files: string[]): Promise<boolean> {
            return new Promise(async (resolve, reject) => {
                try {
                    await this.socialSharing.share(msg, subject, files);
                    resolve(true);
                } catch (err) {
                    reject(err);
                }
            });
        } */

    /******************************************** AUDIO *************************************/



    //-------------------------- time -----------------------------------

    public delay(ms: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, ms);
        });
    }

    /**
     * imprime en ms el tiempo que tarda en realizarse la funcion que se pasa por parametro
     *
     *       USO:
     *
     *       await this.helper.countMillis(async () => {
     *         await this.updateDB();
     *       });
     */
    public async countMillis(funcion: any, msg?: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const startCount = new Date();
                await funcion();
                const endCount = new Date();
                console.log((msg || '') + ' Operation took ' + (endCount.getTime() - startCount.getTime()) + ' msec.');
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }


    async testSpeed(fn: any): Promise<ITest> {
        return new Promise(async (rs, rj) => {
            try {
                const startTime = new Date().getTime();
                const result = await fn;
                const duration = (new Date().getTime() - startTime) / 1000;
                const downloadSize = new TextEncoder().encode(JSON.stringify(result)).length;
                const speedBps = Number.parseFloat((downloadSize / duration).toFixed(2));
                const speedKbps = Number.parseFloat((speedBps / 1024).toFixed(1));
                const speedMbps = Number.parseFloat((speedKbps / 1024).toFixed(1));
                rs({
                    response: result,
                    seg: duration,
                    download_Size: Number.parseFloat((downloadSize / (1024 * 1024)).toFixed(2)),
                    speed_Kbps: speedKbps,
                    speed_Mbps: speedMbps
                });
            } catch (err) {
                rj(err);
            }
        });
    }


    public abs(n: number) {
        return Math.abs(n);
    }

    public copyObject(obj: any) {
        return JSON.parse(JSON.stringify(obj));
    }

    //************************************ callNumber ************************************/

    public async callToNumber(numberToCall: string) {
        try {
            if (numberToCall) {
                const isTlfNumber = numberToCall.match(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/);
                if (isTlfNumber) {
                    window.open('tel:' + numberToCall);
                }
            }
        } catch (err) {
            console.log('callToNumber: ' + err);
        }
    }

    //************************************** DISTANCIAS *************************************/
    public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        // Convertir todas las coordenadas a radianes
        lat1 = this.degToRad(lat1);
        lon1 = this.degToRad(lon1);
        lat2 = this.degToRad(lat2);
        lon2 = this.degToRad(lon2);
        // Aplicar fórmula
        const longsDiff = lon2 - lon1;
        const latsDiff = lat2 - lat1;
        const a = Math.pow(Math.sin(latsDiff / 2.0), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(longsDiff / 2.0), 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * Util.RADIO_TIERRA_EN_KILOMETROS;
        return c;
    };


    private degToRad(grados: number) {
        return grados * Math.PI / 180;
    };

}

