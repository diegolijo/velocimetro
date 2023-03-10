import { Injectable } from '@angular/core';
import { createWorker, Worker } from 'tesseract.js';
import { Util } from './util';

const optns = { imageColor: true, imageGrey: true, imageBinary: true, rotateAuto: true };
@Injectable()
export class OcrService {

  private worker!: Worker;

  constructor(
    private util: Util
  ) {
  }
  async initialize() {
    return new Promise(async (rs, rj) => {
      try {
        console.log('OCR init');
        this.worker = await createWorker({
          logger: m => console.log(m),
          langPath: 'assets/lib',

        });
        await this.worker.loadLanguage('spa');
        await this.worker.initialize('spa');
        rs(true);
      } catch (err) {
        console.log(err);
        //   delete this.tesseract;
      }
    });
  }

  async recognize(b64Image: string): Promise<string> {
    return new Promise(async (rs, rj) => {
      try {
        this.util.showLoader('leyendo imagen...');
        if (!this.worker) {
          await this.initialize();
        }
        const { data: { text } } = await this.worker.recognize(b64Image, optns);
        console.log(text);
        rs(text);
      } catch (err) {
        console.log(err);
        this.util.closeLoader();
        //   delete this.tesseract;
      }
    });

  }



}
