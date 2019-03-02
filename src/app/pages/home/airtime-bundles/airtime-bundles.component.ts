import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {  config } from '../../../config';
@Component({
  selector: 'com-airtime-bundles',
  templateUrl: './airtime-bundles.component.html',
  styleUrls: ['./airtime-bundles.component.scss', '../../../theme/scss/_airtime-bundles.scss']
})
export class AirtimeBundlesComponent implements OnInit {
  op_curr: any = config.CURRENCY;
  min_input: any = config.MIN_AIRTIME_INPUT;
  @Input() value = '';
  @Input() mobile: any;
  constructor() {}
  ngOnInit() {
    // document.getElementById('airtimeInput').focus();
    const input = document.getElementById('airtime-input-field') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  }
}
