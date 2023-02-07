import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { Platform } from '@ionic/angular';

@Injectable()
export class HttpManager {

  // chrome.exe --user-data-dir="C://Chrome dev session" --disable-web-security // ejecutar chrome sin cors

  constructor(
    private httpBrowser: HttpClient,
    private http: HTTP,
    private platform: Platform
  ) {
  }

  public post(url: string, body: any): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      this.httpBrowser.post(url, body).subscribe({
        next: (v) => {
          resolve(v);
        },
        error: (e) => reject(e),
        complete: () => console.log('complete')
      });
    });
  }


  public getAsText(url: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      this.httpBrowser.get(url, { responseType: 'text' }).subscribe({
        next: (v) => { resolve(new DOMParser().parseFromString(v, 'text/html')); },
        error: (e) => reject(e),
        complete: () => console.log('complete')
      });
    });
  }

  public get(url: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      if (this.platform.is('cordova')) {
        this.http.get(url, {}, {})
          .then(data => { resolve(data); })
          .catch(error => { reject(error); });
      } else {
        this.httpBrowser.get(url, { responseType: 'json' }).subscribe({
          next: (value) => { resolve(value); },
          error: (error) => reject(error),
          complete: () => console.log('complete')
        });
      }
    });
  }


}
