

import { Injectable } from '@angular/core';
import { HttpManager } from './http-provider';

export interface IResponse { arr: string[], todas: string }

@Injectable()
export class MongerIA {

    private static readonly URL_W_REFERENCE = 'https://www.wordreference.com/definicion/'
    private static readonly URL_WIKI_SUMARY = 'https://es.wikipedia.org/api/rest_v1/page/summary/'
    private static readonly URL_WIKI_SEGMENTS = 'https://es.wikipedia.org/api/rest_v1/page/segments/'
    private static readonly URL_WIKI = 'https://es.wikipedia.org/wiki/'

    constructor(
        private http: HttpManager
    ) { }

    public async processSpeechResult(texto: any): Promise<IResponse> {
        const textIn: any = { arr: texto.split(' ') };
        textIn.sort = textIn.arr.sort((a: any, b: any) => { return b.length - a.length });
        // enviamos la palabra mas larga
        const wreference = await this.getWref(textIn.sort[0]);
        return wreference;
    }

    private async getWref(value: string): Promise<IResponse> {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const res = await this.http.get(MongerIA.URL_W_REFERENCE + value);
                const otherDicts: any = res.getElementById('otherDicts');
                let elements = [];
                if (otherDicts.children.length > 2 && otherDicts.children[2].children.length > 1) {
                    elements = otherDicts.children[2].children[1].children;
                }
                const deffs: IResponse = { arr: [], todas: value + ', ' }
                for (const iterator of elements) {
                    const pocessed = this.processText(iterator.innerText);
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

    // <span class="b">paloma mensajera</span>
    // <span class="ac">paloma mensajera</spa
    processText(innerText: string): string {
        // TODO separar simbolos, definiciones y ejemplos 
        /*        let result: any = {};
               const arr = innerText.split(':');
               for (const [i, v] of arr.entries()) {
       
               } */
        let result = innerText.replaceAll('♦', '.algo así.')
            .replaceAll('Irreg.', 'no va bien,')
            .replaceAll('m.', 'masculino,')
            .replaceAll('prnl.', 'plural,')
            .replaceAll('f.', 'femenino,')
            .replaceAll('pl.', 'hay un monton,')
            .replaceAll(':', '. hey! maiquel. ')
            .replaceAll('loc.', 'que locura,')
            .replaceAll('adv.', 'que movidón,')
            .replaceAll('col.', 'que movida, ')
            ;
        console.log(result);
        return result;
    }


    // TODO
    private async getWiki(value: string): Promise<IResponse> {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const res = await this.http.get(MongerIA.URL_WIKI_SEGMENTS + value);
                debugger;
                console.log(res);
                const otherDicts: any = res.getElementById('otherDicts');
                let elements = [];
                if (otherDicts.children.length > 2 && otherDicts.children[2].children.length > 1) {
                    elements = otherDicts.children[2].children[1].children;
                }
                const deffs: IResponse = { arr: [], todas: value + ',   ' };
                for (const iterator of elements) {
                    deffs.arr.push(iterator.innerText);
                    deffs.todas += iterator.innerText;
                }
                console.log(JSON.stringify(deffs));
                resolve(deffs);
            } catch (err) {
                reject(err);
            }
        });
    }




}
