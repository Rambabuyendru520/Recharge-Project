import { Component, AfterViewInit, OnChanges } from '@angular/core';
import { config } from '../../../config';
import { AngularCDRService } from '../../../plugins/angularCDR';

@Component({
  selector: 'com-fallout-purchase-limit',
  templateUrl: './fallout-purchase-limit.component.html',
  styleUrls: ['./fallout-purchase-limit.component.scss']
})
export class FalloutPurchaseLimitComponent implements AfterViewInit, OnChanges{

  heading = 'Well, this is awkward.';
  introText = 'You can\'t purchase more than R1000 airtime in a day. You can purchase up to R3000 of data in a day, even if you\'ve reached your airtime limit.';
  btnLabel1 = 'Back to the homepage';
  ASSETS_PATH: any = config.ASSETS;
  category: any = 'Fallout Purchase Limit';
  startTime: any;
  constructor(private _cdr: AngularCDRService) {}
  goToHome() {
    this._cdr.writeCDR(this.startTime, this.category, 'Go to HomePage');
    window.location.href = config.BRIGHT_SIDE_LINK;
  }
  ngAfterViewInit() {
    // this._cdr.writeCDR(this.startTime, this.category, 'Start');
  }
  ngOnChanges() {
    this.startTime = this._cdr.getTransactionTime(0).toString();
  }
}
