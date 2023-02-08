/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpManager } from './http-provider';

export interface IResponse { arr: string[]; todas: string }

export interface IDayPeriod {
    properties: {
        days: [{
            timePeriod: {
                begin: {
                    timeInstant: Date;
                };
                end: {
                    timeInstant: Date;
                };
            };
            variables: [
                {
                    name: string;
                    sunrise: Date;
                    midday: Date;
                    sunset: Date;
                    duration: string;
                }
            ];
        }
        ];
    };
}


@Injectable()
export class MongerIA {

    private static readonly URL_W_REFERENCE = 'https://www.wordreference.com/definicion/';

    private static readonly URL_WIKI_SUMARY = 'https://es.wikipedia.org/api/rest_v1/page/summary/';
    private static readonly URL_WIKI_SEGMENTS = 'https://es.wikipedia.org/api/rest_v1/page/segments/';
    private static readonly URL_WIKI = 'https://es.wikipedia.org/wiki/';

    private static readonly METEOSIX_KEY = 'yGKXY9ILQkSv4GBo503W4ClWSo2p7pB0lEmcBeh43aOvQ26vqGb3iaYUJ15xk601';
    private static readonly METEOSIX_URL = 'https://servizos.meteogalicia.gal/apiv4/';


    constructor(
        private http: HttpManager
    ) { }

    public async processSpeechResult(texto: any): Promise<IResponse> {
        const textIn: any = { arr: texto.split(' ') };
        textIn.sort = textIn.arr.sort((a: any, b: any) => b.length - a.length);
        // enviamos la palabra mas larga
        const wreference = await this.getWref(textIn.sort[0]);
        return wreference;
    }

    /*********************************  METEO  ***********************************
     * Las variables de predicción numérica que se pueden consultar a través de la API son las siguientes:
        - Estado del cielo
        - Temperatura
        - Vento
        - Precipitaciones
        - Cota de nieve
        - Humedad relativa
        - Cobertura nubosa
        - Presión al nivel del mar
        - Período de ola*
        - Dirección de ola*
        - Temperatura del agua*
        - Salinidad*
        - Altura de ola*
    */
    public async getMeteo(method: string, lat: number, long: number, place: string, modelo: string): Promise<IResponse> {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const places = 'findPlaces?location=' + place;
                const solar = `getSolarInfo?coords=${lat},${long}`;
                const tiles = `getTidesInfo?coords=${lat},${long}`;
                const numeric = `getNumericForecastInfo?coords=${lat},${long}&variables=${modelo}`;
                const res = await this.http.get(
                    MongerIA.METEOSIX_URL + tiles + '&API_KEY=' + MongerIA.METEOSIX_KEY);
                resolve(res.features[0].properties);
            } catch (err) {
                reject(err);
            }
        });
    }
    /*************************************************************************/

    /* TODO ****************************** WIKI ************************************/
    public async getWiki(value: string): Promise<IResponse> {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const res = await this.http.getAsText(MongerIA.URL_WIKI + value);
                const contentText: any = res.getElementById('mw-content-text');
                let elements: any = [];
                if (contentText.children[1].length) {
                    elements = contentText.children.contentText.div[1];
                }
                const deffs: IResponse = { arr: [], todas: value + ', ' };
                for (const iterator of elements) {
                    const pocessed = this.processWordRefText(iterator.innerText);
                    deffs.arr.push(pocessed);
                    deffs.todas += pocessed;
                }
                console.log(deffs);
                resolve(deffs);
            } catch (err) {
                reject(err);
            }
        });
    }

    private async getWref(value: string): Promise<IResponse> {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const res = await this.http.getAsText(MongerIA.URL_W_REFERENCE + value);
                const otherDicts: any = res.getElementById('otherDicts');
                let elements: any = [];
                if (otherDicts.children.length > 2 && otherDicts.children[2].children.length > 1) {
                    elements = otherDicts.children[2].children[1].children;
                }
                const deffs: IResponse = { arr: [], todas: value + ', ' };
                for (const iterator of elements) {
                    const pocessed = this.processWordRefText(iterator.innerText);
                    deffs.arr.push(pocessed);
                    deffs.todas += pocessed;
                }
                console.log(deffs);
                resolve(deffs);
            } catch (err) {
                reject(err);
            }
        });
    }


    private processWordRefText(innerText: string): string {
        // TODO separar simbolos, definiciones y ejemplos
        /*        let result: any = {};
               const arr = innerText.split(':');
               for (const [i, v] of arr.entries()) {
               } */
        const result = innerText.replaceAll('♦', 'cuando ')
            .replaceAll(':', '. ')
            .replaceAll('m.', '')
            .replaceAll('f.', '')
            .replaceAll('pl.', '')
            .replaceAll('Irreg.', '')
            .replaceAll('prnl.', '')
            .replaceAll('loc.', '')
            .replaceAll('adv.', '')
            .replaceAll('col.', '')
            ;
        console.log(result);
        return result;
    }


}
