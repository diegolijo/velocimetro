/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Injectable } from '@angular/core';
import { SpeechToText } from 'angular-speech-to-text';

export interface IVoice { name: string; locale: string; requiresNetwork: boolean; latency: number; quality: number }

declare const glPrpts: any;
const CHECK_QUESTION_BUSSY = 'Se está esperando por una respuesta en punto de la ejecución! ';
const DEFAULT_LANG = 'es';
@Injectable()
export class SpeechManager {

    public isRecording = false;

    private checkQuestionIsBussy: any;
    private currentLanguage = DEFAULT_LANG;

    private globalSttgs = glPrpts;
    constructor(
        private speechToText: SpeechToText,
    ) { }

    public async startRecognizer(lang: string) {
        console.log('***** startRecognizer *****');
        this.globalSttgs.lang = this.currentLanguage = lang;
        if (!(await this.speechToText.isEnable())) {
            await this.speechToText.enableRecognizer(lang);
        };
        this.speechToText.startRecognizer();
        this.globalSttgs.isRecording = this.isRecording = true;

        // TODO espear a la devolucion de la capa nativa
    }

    public stopRecognizer() {
        this.globalSttgs.isRecording = this.isRecording = false;
        this.speechToText.stopy();
        this.speechToText.synthText('', true);
        // TODO espear a la devolucion de la capa nativa
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

                    }));
            } catch (err) {
                reject(err);
            }
        });
    }

    public checkQuestion(id: string, question?: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            try {
                try {
                    await this.checkMultipleQuestions(id);
                } catch (err: any) {
                    console.log(err);
                    return resolve(false);
                }
                await this.stopRecognizer();


                if (question) {
                    console.log('speechManager.synthText');
                    await this.synthText(question);// no espera
                }
                console.log('llefa aqui miestras aquiiiiiiiii???');

                const on = await this.checkRecognizerOn();
                this.globalSttgs.checkRecognizerOn = on;
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
            console.log('****** speechManager -> senbResponse');
            this.speechToText.unsubscribeToRecognizer(id,
                (err => { console.log(err); }));
            this.checkQuestionIsBussy && delete this.checkQuestionIsBussy;
            rs(val);
        }, delay || 0);
    }

    private sendSynthComplete(msg: string, resolve: (reason?: any) => void, status: any) {
     /*    this.speechToText.unsubscribeToSyntesizer(msg,
            err => { console.log(err); }); */
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
                        this.speechToText.unsubscribeToRecognizer('checkRecognizerOn',
                            (err) => {
                                console.error('unsubscribeToRecognizer ' + err);
                            });
                        rs(true);
                        console.log('ction === recogni -----------> ' + JSON.stringify(value));
                        return;
                    }
                },
                (err: any) => {
                    this.speechToText.unsubscribeToRecognizer('checkRecognizerOn',
                        (error) => {
                            console.error('unsubscribeToRecognizer ' + JSON.stringify(err) + JSON.stringify(error));
                            rs(true);
                            console.log(' err subscrbeToRecognizer -----------> ' + JSON.stringify(error));
                            return;
                        });
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
                console.log('this.checkQuestionIsBussy ' + this.checkQuestionIsBussy);
                if (this.checkQuestionIsBussy) {
                    rj(CHECK_QUESTION_BUSSY + id);
                }
                this.globalSttgs.checkQuestionIsBussy = this.checkQuestionIsBussy = id;
                rs(true);
                // TODO
            } catch (err) {
                rs(true);
            }
        });


    }
}
