import { Component, AfterViewInit, OnChanges } from '@angular/core';
import { config } from '../../../config';
import { Router } from '@angular/router';
import { AngularCDRService } from '../../../plugins/angularCDR';

@Component({
  selector: 'com-fallout-feedback-error',
  templateUrl: './fallout-feedback-error.component.html',
  styleUrls: ['./fallout-feedback-error.component.scss']
})
export class FalloutFeedbackErrorComponent implements AfterViewInit, OnChanges {

  heading: string = 'We\'re not ignoring your feedback, we\'re just having trouble processing it.';
  introText: string = 'Your feedback didn\'t go through, would you mind submitting it again?';
  btnLabel1: string = 'Submit again';
  btnLabel2: string = 'Go to homepage';
  ASSETS_PATH: any = config.ASSETS;
  startTime: any;
  category: any = 'Feedback Fallout';
  constructor(private _router: Router, private _cdr: AngularCDRService) { }
  goToHomePage() {
    this._cdr.writeCDR(this.startTime, this.category, 'Go to HomePage');
    window.location.href = config.BRIGHT_SIDE_LINK;
  }
  submitAgain() {
    this._cdr.writeCDR(this.startTime, this.category, 'Submit Feedback Again');
    this._router.navigate(['recharge', 'feedback']);
  }
  ngAfterViewInit() {
    // this._cdr.writeCDR(this.startTime, this.category, 'Start');
  }
  ngOnChanges() {
    this.startTime = this._cdr.getTransactionTime(0).toString();
  }
}
