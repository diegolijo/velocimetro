import { Component, OnInit } from '@angular/core';
import { AndroidFullScreen } from '@awesome-cordova-plugins/android-full-screen/ngx';
import { Platform } from '@ionic/angular';
import { UserData } from './services/UserData';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    private platform: Platform,
    //  private splashScreen: SplashScreen,
    private androidFullScreen: AndroidFullScreen,
    public userData: UserData,
  ) { }

  async ngOnInit() {
    document.body.setAttribute('color-theme', 'dark');
    await this.platform.ready();
    if (this.platform.is('cordova')) {
      await this.androidFullScreen.immersiveMode();
    }
    await this.userData.init();
    setTimeout(() => {
      //this.splashScreen.hide();
    }, 1000);
  }


}
