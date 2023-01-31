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
        next: (v) => {
          const xmlDoc = new DOMParser().parseFromString(v, "text/html");
          const otherDicts: any = xmlDoc.getElementById('otherDicts');
          let elements = [];
          if(otherDicts.children.length>2 && otherDicts.children[2].children.length > 1){
            elements = otherDicts.children[2].children[1].children;
          }
          const deffs = []
          for (const iterator of elements) {
            deffs.push(iterator.innerText);
          }
          console.log(deffs);
          debugger;
          resolve(deffs)
        },
        error: (e) => reject(e),
        complete: () => console.info('complete')
      });
    });
  }



}
