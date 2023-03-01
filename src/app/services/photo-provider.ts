/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';

export interface IFileFotos {
  name: string;
  url: string;
  path: string;
  isSelected: boolean;
  descripcion: string;
}

@Injectable()
export class ProPhoto {

  public static CAM_QUALITY = 75;
  public static CAM_HEIGHT = 1024;
  public static CAM_WIDTH = 1024;

  public photos: IFileFotos[] = [];
  public base64Image!: string;
  public imageData: any;

  constructor(
    private camera: Camera
  ) { }

  /**
   * llama a la aplicacion nativa de la camara
   * devuelve una foto en base64,
   * guarda una copia en la galeria del dispositivo
   */
  public async takePhotoB64(): Promise<string> {
    return new Promise((rs, rj) => {
      const options: CameraOptions = {
        encodingType: this.camera.EncodingType.PNG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true,
        sourceType: this.camera.PictureSourceType.CAMERA,
        quality: ProPhoto.CAM_QUALITY,
        destinationType: this.camera.DestinationType.DATA_URL,
        saveToPhotoAlbum: false,
        /*         targetWidth: ProPhoto.CAM_WIDTH,
                targetHeight: ProPhoto.CAM_HEIGHT */
      };
      this.camera.getPicture(options).then(value => {
        rs('data:image/png;base64, ' + value);
      }).catch(err => {
        rj(err);
      });
    });
  }

}
