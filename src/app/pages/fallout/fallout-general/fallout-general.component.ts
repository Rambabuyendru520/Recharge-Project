import { Component, OnInit, OnChanges, AfterViewInit } from '@angular/core';
import { config } from '../../../config';
import { AngularCDRService } from '../../../plugins/angularCDR';
@Component({
  selector: 'com-fallout-general',
  templateUrl: './fallout-general.component.html',
  styleUrls: ['./fallout-general.component.scss']
})
export class FalloutGeneralComponent implements OnInit, OnChanges, AfterViewInit {
  heading  = 'It\'s not you, it\'s us.';
  introText = 'Something\'s broken, and we\'re working on it. Sorry about that. Give it a few minutes and try again.';
  btnLabel1 = 'Back to homepage';
  // btnLabel2: string = "Go to homepage";
  ASSETS_PATH: any = config.ASSETS;
  startTime: any;
  category: any = 'General Fallout';
  constructor(private _cdr: AngularCDRService) {}
  ngOnInit() {}
  goToHomePage() {
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
