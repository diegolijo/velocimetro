import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpManager {

  constructor(
    private httpBrowser: HttpClient
  ) {
  }

  public post(url: string, body: any): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      this.httpBrowser.post(url, body).subscribe({
        next: (v) => {
          resolve(v);
        },
        error: (e) => reject(e),
        complete: () => console.info('complete')
      });
    });
  }


  public get(url: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      this.httpBrowser.get(url, { responseType: 'text' }).subscribe({
        next: (v) => { resolve(new DOMParser().parseFromString(v, "text/html")) },
        error: (e) => reject(e),
        complete: () => console.info('complete')
      });
    });
  }



}
