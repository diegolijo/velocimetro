import { Injectable } from '@angular/core';
import { createWorker } from 'tesseract.js';
import { ProPhoto } from './photo-provider';

@Injectable()
export class OcrService {

  private tesseract: any;

  constructor() {
  }
  async initialize() {
    return new Promise(async (rs, rj) => {
      try {
        console.log('OCR init');
        this.tesseract = await createWorker({
          /*       workerPath: 'https://unpkg.com/tesseract.js@v4.0.1/dist/worker.min.js',
                langPath: 'https://tessdata.projectnaptha.com/4.0.0_best/eng.traineddata.gz',
                corePath: 'https://unpkg.com/tesseract.js-core@v4.0.1/tesseract-core.wasm.js', */
        });
        await this.tesseract.loadLanguage('spa');
        await this.tesseract.initialize('spa');
        rs(true);
      } catch (err) {
        console.log(err);
        delete this.tesseract;
      }
    });
  }

  async recognize(b64Image: string): Promise<string> {
    return new Promise(async (rs, rj) => {
      try {
        if (!this.tesseract) {
          await this.initialize();
        }

        const { data: { text } } = await this.tesseract.recognize(b64Image);
        console.log(text);
        rs(text);
      } catch (err) {
        console.log(err);
        delete this.tesseract;
      } finally {
        this.tesseract.terminate();
      }
    });



  }



}
