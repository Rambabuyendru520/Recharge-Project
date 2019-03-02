import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { config } from '../../../config';
import { BundleForm } from '../../../utils/interface/bundle';
import { format } from '../../../utils/formatter';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import * as loader from '../../../actions/slimloader';
import { HomeService } from '../../../plugins/home';
import { Router, ActivatedRoute } from '@angular/router';
import { BundleSelectionService } from '../../services';

@Component({
  selector: 'com-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['../../scss/_footer.scss', './footer.component.scss'],
})
export class FooterComponent implements OnInit {
  bundleArray = config.bunCon;
  lastClick: any = -1;
  hide_icons: any = false;
  mobile_screen: any = false;
  msisdnForm: FormGroup;
  @Input() bundleSelected;
  @Output() msisdn_val = new EventEmitter();
  input_value: any;
  input_valid: any;
  which_bundle: any = true;
  routeValue: any;
  currentIcon: any;
  finalBundleObj: any;
  msisdn_cache: any;
  public ASSETS_PATH: string = config.ASSETS;
  bundleType = ['DATA', 'AIRTIME', 'SMS', 'FIBRE'];
  constructor(private _bundleSelect: BundleSelectionService) {}
  ngOnInit() {
    const input = <HTMLInputElement>document.getElementById('msisdn-input');
    this._bundleSelect.inputChangeEvent.subscribe(res => {
      this.input_valid = res.valid;
      this.input_value = res.value;
    });
    this._bundleSelect.toggleIconEvent.subscribe(res => {
      this.currentIcon = res;
      let temp = '';
      if (this.finalBundleObj) {
        temp = this.finalBundleObj.com_type;
      }
      if (this.bundleSelected && this.bundleType[res] !== temp) {
        this.which_bundle = false;
      } else {
        this.which_bundle = true;
      }
    });
    this._bundleSelect.globalBundleEvent.subscribe(res => {
      this.finalBundleObj = res;
      const temp = this.finalBundleObj.com_type;
      if (this.bundleSelected && this.bundleType[this.currentIcon] !== temp) {
        this.which_bundle = false;
      } else {
        this.which_bundle = true;
      }
   });
   /* this.msisdn_cache = sessionStorage.getItem('order');
   if (this.msisdn_cache) {
     this.msisdn_cache = JSON.parse(this.msisdn_cache);
     this.msisdn_cache = this.msisdn_cache.msisdn;
     if (this.msisdn_cache) {
      input.value = this.msisdn_cache;
      this.input_value = this.msisdn_cache;
      this.input_valid = true;
    }
   } */
  }
  validateBundle() {
    if (this.input_valid && this.bundleSelected) {
      this.msisdn_val.emit(this.input_value);
    }
  }
}


