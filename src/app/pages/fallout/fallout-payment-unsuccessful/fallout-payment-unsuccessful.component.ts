import { Component, OnInit, AfterViewInit, OnChanges } from '@angular/core';
import { config } from '../../../config';
import { Router } from '@angular/router';
import { AngularCDRService } from '../../../plugins/angularCDR';

@Component({
  selector: 'com-fallout-payment-unsuccessful',
  templateUrl: './fallout-payment-unsuccessful.component.html',
  styleUrls: ['./fallout-payment-unsuccessful.component.scss']
})
export class FalloutPaymentUnsuccessfulComponent implements OnInit, AfterViewInit, OnChanges {

  heading = 'Hmmm,';
  heading1 = 'something went wrong.';
  introText = 'The payment was unsuccessful. Please try again, or contact your bank to see what the problem is. What would you like to do?';
  btnLabel1 = 'Use a different bank card';
  btnLabel2 = 'Choose a different bundle';
  ASSETS_PATH: any = config.ASSETS;
  paygateURL = config.PLUGIN_URL + 'paygateRedirect';
  category: any = 'Payment Fallout';
  startTime: any;
  constructor(private _router: Router, private _cdr: AngularCDRService) { }
  ngOnInit() {
  }
  diffBundle() {
    this._cdr.writeCDR(this.startTime, this.category, 'Choose Different Bundle');
    this._router.navigate(['recharge']);
  }
  diffCard() {
    this._cdr.writeCDR(this.startTime, this.category, 'Choose Different Bank Card');
    const input = <HTMLInputElement>document.getElementById('reference');
    let reference = sessionStorage.getItem('reference');
    if (reference) {
      input.value = reference;
    } else {
      this._router.navigate(['recharge', 'error']);
    }
    document.forms['payForm'].submit();
  }
  ngOnChanges() {
    this.startTime = this._cdr.getTransactionTime(0).toString();
  }
  ngAfterViewInit() {
    // this._cdr.writeCDR(this.startTime, this.category, 'Start');
  }
}
