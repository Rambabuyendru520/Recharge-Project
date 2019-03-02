import { Component, OnInit, AfterViewInit, OnChanges } from '@angular/core';
import { config } from '../../../config/config';
import { Router } from '@angular/router';
import { AngularCDRService } from '../../../plugins/angularCDR';

@Component({
  selector: 'com-feedback-success',
  templateUrl: './feedback-success.component.html',
  styleUrls: ['./feedback-success.component.scss']
})
export class FeedbackSuccessComponent implements OnInit, AfterViewInit, OnChanges {

  ASSETS_PATH: any = config.ASSETS;
  header_text: any = 'Thanks for your feedback.';
  category: any = 'Feedback Success';
  startTime: any;
  constructor(private _router: Router, private _cdr: AngularCDRService) { }
  ngOnInit() {}
  goToHomePage() {
    this._cdr.writeCDR(this.startTime, this.category, 'Go To Home Page');
    window.location.href = config.BRIGHT_SIDE_LINK;
  }
  backEmitter() {
    this._router.navigate(['recharge']);
  }
  logoClick() {
    window.location.href = '/recharge/';
  }
  ngAfterViewInit() {
    this._cdr.writeCDR(this.startTime, this.category, 'Start');
  }
  ngOnChanges() {
    this.startTime = this._cdr.getTransactionTime(0).toString();
  }
}
