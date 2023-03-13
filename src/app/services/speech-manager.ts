/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Injectable } from '@angular/core';
import { SpeechToText } from 'angular-speech-to-text';

export interface IVoice { name: string; locale: string; requiresNetwork: boolean; latency: number; quality: number }

declare const globalSettings: any;
const CHECK_QUESTION_BUSSY = 'Se está esperando por una respuesta en la ejecución! ';
const DEFAULT_LANG = 'es';
@Injectable()
export class SpeechManager {

    public isRecording = false;

    private checkQuestionIsBussy: any;
    private currentLanguage = DEFAULT_LANG;

    private globalSettings = globalSettings;
    constructor(
        private speechToText: SpeechToText,
    ) { }

    public async startRecognizer(lang: string) {
        console.log('***** startRecognizer *****');
        this.globalSettings.lang = this.currentLanguage = lang;
        if (!(await this.speechToText.isEnable())) {
            await this.speechToText.enableRecognizer(lang);
        };
        this.speechToText.startRecognizer();
        this.globalSettings.isRecording = this.isRecording = true;
        // TODO espear a la devolucion de la capa nativa
    }

    public stopRecognizer() {
        this.globalSettings.isRecording = this.isRecording = false;
        return new Promise((resolve, reject) => {
            this.speechToText.subscrbeToRecognizer('stop',
                async (value: any) => {
                    console.log('+++++++++++ stopRecognizer ' + JSON.stringify(value));
                    console.log(JSON.stringify('value stopRecognizer.subscrbeToRecognizer **** ' + value));
                    if (value.action === 'recognize' && value.result === 'stop') {
                        this.speechToText.unsubscribeToRecognizer('stop');
                        resolve(true);
                    }
                },
                (err: any) => {
                    console.log('error stopRecognizer.subscrbeToRecognizer **** ' + JSON.stringify(err));
                    reject(err);
                });
            this.speechToText.stopRecognizer();
        });
    }

    public synthText(msg: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                this.speechToText.synthText(msg, false);
                this.speechToText.subscrbeToSyntesizer(msg,
                    (progress: any) => {
                        console.log(' ***** SpeechManagerSpeech ' + progress.result);
                        switch (progress.result) {
                            case 'speech done':
                                this.sendSynthComplete(msg, resolve, true);
                                break;
                            case 'speech error':
                                this.sendSynthComplete(msg, resolve, progress);
                                break;
                            default:
                                break;
                        }
                    }, (err => {
                        console.log('error subscrbeToSyntesizer ' + err);
                    }));
            } catch (err) {
                reject(err);
            }
        });
    }

    public checkQuestion(id: string, question?: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            try {
                console.log('checkQuestion. checkMultipleQuestions? ??');
                try {
                    await this.checkMultipleQuestions(id);
                } catch (err: any) {
                    console.log(err);
                    return resolve(false);
                }
                console.log('checkQuestion .stopRecognizer');
                await this.stopRecognizer();
                if (question) {
                    console.log('checkQuestion .synthText');
                    await this.synthText(question);// no espera
                }
                console.log('checkQuestion checkRecognizerOn???');

                const on = await this.checkRecognizerOn();
                this.globalSettings.checkRecognizerOn = on;
                console.log('checkQuestion On???? ' + on);
                this.speechToText.subscrbeToRecognizer(id,
                    async (value: any) => {
                        console.log('SpeechManagerQuestion ' + JSON.stringify(value.parcial));
                        switch (value.parcial) {
                            case 'si':
                                this.sendQuestionResponse(id, resolve, true);
                                break;
                            case 'no':
                                this.sendQuestionResponse(id, resolve, false);
                                break;
                            /*
                            default:
                            this.sendQuestionResponse(id, resolve, false);
                            break;
                            */
                        }
                    },
                    (err: any) => {
                        console.log(err);
                        this.sendQuestionResponse(id, resolve, false);
                    });
            } catch (err) {
                this.sendQuestionResponse(id, resolve, false);
            }
        });
    }

    private sendQuestionResponse(id: string, rs: (value: any) => void, val: boolean, delay?: number) {
        setTimeout(() => {
            try {
                console.log('****** speechManager -> senbResponse');
                this.speechToText.unsubscribeToRecognizer(id);
                this.checkQuestionIsBussy && delete this.checkQuestionIsBussy;
                rs(val);
            } catch (err) {
                rs(null);
            }
        }, delay || 0);
    }

    private sendSynthComplete(msg: string, resolve: (reason?: any) => void, status: any) {
        this.speechToText.unsubscribeToSyntesizer(msg);
        resolve(status);
    }

    private checkRecognizerOn() {
        new Promise(async (rs, rj) => {
            /*    try { */
            console.log('checkRecognizer On????');
            if ((await this.speechToText.isPlaying())) {
                rs(true);
                return;
            };
            this.speechToText.startRecognizer();
            this.speechToText.subscrbeToRecognizer('checkRecognizerOn',
                async (value: any) => {
                    console.log('in subscrbeToRecognizer -----------> ' + JSON.stringify(value));
                    if (value.action === 'recognize' && value.result === 'play') {
                        this.speechToText.unsubscribeToRecognizer('checkRecognizerOn');
                        rs(true);
                        console.log('ction === recogni -----------> ' + JSON.stringify(value));
                        return;
                    }
                },
                (err: any) => {
                    this.speechToText.unsubscribeToRecognizer('checkRecognizerOn');
                    rj(err);
                });
            /*             } catch (err) {
                            this.speechToText.unsubscribeToRecognizer('checkRecognizerOn',
                                (error) => {
                                    console.error('unsubscribeToRecognizer ' + err);
                                    rs(true);
                                    console.log('catch -----------> ' + JSON.stringify(error));
                                    return;
                                });
                            rj(err);
                        } */
        });
    }

    private checkMultipleQuestions(id: string) {
        new Promise(async (rs, rj) => {
            try {
                if (this.checkQuestionIsBussy) {
                    console.log('this.checkQuestionIsBussy ' + 'true');
                    rj(CHECK_QUESTION_BUSSY + id);
                    this.globalSettings.checkQuestionIsBussy = this.checkQuestionIsBussy = id;
                    return;
                }
                console.log('this.checkQuestionIsBussy ' + 'false');
                rs(true);
            } catch (err) {
                rj(true);
            }
        });
    }
}
