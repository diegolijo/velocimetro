import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ProStorage } from './services/storage-provider';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    private platform: Platform,
    //  private splashScreen: SplashScreen,
    public storage: ProStorage
  ) { }

  async ngOnInit() {
    document.body.setAttribute('color-theme', 'dark');

    await this.platform.ready()
    await this.storage.init();
    // recuperamos datos guardados
    await this.getData();
    setTimeout(() => {
      //this.splashScreen.hide();
    }, 1000);

  }

  private async getData() {
    /*     this.checkAutorange = await this.storage.getItem(this.storage.AUTORANGE);
        this.rangeHoldTime = await this.storage.getItem(this.storage.RANGE_HOLD_TIME);
        if (!this.rangeHoldTime) {
          this.rangeHoldTime = this.RANGE_HOLD_TIME;
          this.storage.setItem(this.storage.RANGE_HOLD_TIME, this.RANGE_HOLD_TIME);
        } */
  }



}
