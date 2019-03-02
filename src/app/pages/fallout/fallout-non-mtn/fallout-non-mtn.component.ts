import { Component, OnInit, OnChanges, AfterViewInit } from '@angular/core';
import { config } from '../../../config';
import { Router } from '@angular/router';
import { BundleSelectionService } from '../../../theme/services';
import { AngularCDRService } from '../../../plugins/angularCDR';

@Component({
  selector: 'com-fallout-non-mtn',
  templateUrl: './fallout-non-mtn.component.html',
  styleUrls: ['./fallout-non-mtn.component.scss']
})
export class FalloutNonMTNComponent implements OnInit, OnChanges, AfterViewInit {

  heading = 'Oh no!';
  introText = 'It looks like this isn\'t an MTN number, but it could be?';
  btnLabel1 = 'Join MTN';
  btnLabel2 = 'Enter different number';
  ASSETS_PATH: any = config.ASSETS;
  joinMTN_url  = 'https://www.mtn.co.za/madeforme/';
  startTime: any;
  category: any = 'Offnet Fallout';
  constructor(private _cdr: AngularCDRService, private _bundleSelect: BundleSelectionService) { }
  ngOnInit() {
  }
  diffNum() {
    this._cdr.writeCDR(this.startTime, this.category, 'Enter Different Number');
    this._bundleSelect.setFallout(0);
  }
  joinMTN() {
    this._cdr.writeCDR(this.startTime, this.category, 'Join MTN');
    window.open(this.joinMTN_url);
  }
  ngOnChanges() {
    this.startTime = this._cdr.getTransactionTime(0).toString();
  }
  ngAfterViewInit() {
    // this._cdr.writeCDR(this.startTime, this.category, 'Start');
  }
}
