import { Component, OnInit, ViewEncapsulation, OnChanges, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmailForm } from '../../utils/interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { config } from '../../config';
import { format } from '../../utils/formatter';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PayementGatewayService } from '../../plugins/paymentGateway';
import { BundleSelectionService } from '../../theme/services';
import * as fromRoot from '../../reducers';
import * as loader from '../../actions/slimloader';
import { Store } from '@ngrx/store';
import { AngularCDRService } from '../../plugins/angularCDR';
declare var $: any;
@Component({
  selector: 'com-recharge-confirmation',
  templateUrl: './recharge-confirmation.component.html',
  styleUrls: ['./recharge-confirmation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RechargeConfirmationComponent implements OnInit, OnChanges, AfterViewInit {
  modalReference: NgbModalRef;
  mobile_screen: any = false;
  public ASSETS_PATH: string = config.ASSETS;
  emailForm: FormGroup;
  public checked_readTnC = false;
  public disabledCheckBox_readTnc = false;
  closeResult: string;
  paygateURL: any;
  header_text: any;
  popover_placement = 'bottom-left';
  public memberMSISDN = 0;
  public bundleID = '';
  public printableArea = 'printableArea';
  public total = 0;
  public Total_Value = '0.00';
  public vat = '0.00';
  spaces_msisdn: any;
  finalBundle: any;
  startTime: any;
  category: any = 'Confirmation Page';
  email_cache: any;
  public VAT_Value = '(VAT incl. R' + this.vat + ' )';
  public Individual_Items = [
    {Individual_ItemName: '', Individual_Value: ''}
  ];
  public TnC = config.TNC;
  constructor(private _router: Router, private modalService: NgbModal,
    private _bundleSelect: BundleSelectionService, private fb: FormBuilder, private _store: Store<fromRoot.State>,
    private _cdr: AngularCDRService) {
  }
  ngOnInit() {
    if (screen.width <= 767) {
      this.popover_placement = 'bottom-right';
    }
    this.startTime = this._cdr.getTransactionTime(0);
    this.finalBundle = this._bundleSelect.getFinalBundle();
    this.finalBundle = JSON.parse(this.finalBundle);
    this.Individual_Items[0].Individual_ItemName = '' + this.getBundleDesc(this.finalBundle) + '';
    this.Individual_Items[0].Individual_Value = parseFloat(this.finalBundle.cost).toString();
    this.header_text = 'Confirm your recharge for ' + this.spaces_msisdn;
    this.paygateURL = config.PLUGIN_URL + 'paygateRedirect';
   /*  this.email_cache = sessionStorage.getItem('email');
      if (!this.email_cache) {
        this.email_cache = '';
      } */
    this.emailForm = this.fb.group({
      email: [this.email_cache, [Validators.required, Validators.email,
      // tslint:disable-next-line:max-line-length
      Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]]
    });
    this.Individual_Items.forEach((elem) => {
      this.total = parseFloat(elem.Individual_Value);
    });
    this.Total_Value = this.total.toFixed(2).toString();
    this.vat = parseFloat(this.finalBundle.vatCost).toFixed(2).toString();
/*    if (this.vat !== 'NaN') {
      this.VAT_Value = '(VAT incl. R' + this.vat + ' )';
    } else { */
      this.VAT_Value = '(VAT ' + 'included ' + ' )';
    // }
  }
  ngOnChanges() {
    this.startTime = this._cdr.getTransactionTime(0);
  }
  ngAfterViewInit() {
    this._cdr.writeCDR(this.startTime, this.category, 'Start');
  }
  agreeTnC({value, valid}: {value: EmailForm, valid: boolean}) {
    if (valid) {
      this._store.dispatch(new loader.StartSlimloaderAction);
      this._cdr.writeCDR(this.startTime, this.category, 'Agree TnC');
      let trans_type;
      if (this.finalBundle.vas_code === 'Airtime') {
        trans_type = 'Airtime';
      } else {
        trans_type = 'Bundle';
      }
      const payload = {
        'order_no': this.finalBundle.order_no,
        'msisdn': format.msisdn(this.finalBundle.msisdn),
        'amount': this.finalBundle.cost,
        'vas_code': this.finalBundle.vas_code,
        'facing_name': this.finalBundle.customer_facing_name,
        'chargeable': this.finalBundle.chargeable,
        'email': value.email,
        'trans_type': trans_type
      };
      this._cdr.writeCDR(this.startTime, this.category, 'Setting Up Payload for Redirecting to Payment Gateway');
      const input1 = <HTMLInputElement>document.getElementById('order_no');
      input1.value = payload.order_no;
      const input2 = <HTMLInputElement>document.getElementById('msisdn');
      input2.value = payload.msisdn;
      const input3 = <HTMLInputElement>document.getElementById('amount');
      input3.value = payload.amount;
      const input4 = <HTMLInputElement>document.getElementById('vas_code');
      input4.value = payload.vas_code;
      const input5 = <HTMLInputElement>document.getElementById('facing_name');
      input5.value = payload.facing_name;
      const input6 = <HTMLInputElement>document.getElementById('chargeable');
      input6.value = payload.chargeable;
      const input7 = <HTMLInputElement>document.getElementById('email');
      input7.value = payload.email;
      const input8 = <HTMLInputElement>document.getElementById('trans_type');
      input8.value = payload.trans_type;
      sessionStorage.setItem('email', payload.email) ;
      sessionStorage.setItem('mnbvcxzlkjhgfdsa', this.finalBundle.order_no);
      this._cdr.writeCDR(this.startTime, this.category, 'Payment Gateway Redirection');
	    $('#payForm').trigger('submit');
  } else {
      this.emailForm.reset();
    }
  }
  openVerticallyCentered(content) {
    this.modalReference = this.modalService.open(content, { centered: true });
    this._cdr.writeCDR(this.startTime, this.category, 'Open TnC Popup');
  }
  PrintPage(divName) {
    const data = document.getElementById(divName).innerHTML;
    const params = [ 'height=' + screen.height, 'width=' + screen.width, 'fullscreen=yes'].join(','); 
    // only works in IE, but here for completeness
    const myWindow = window.open('', 'my div', params);
    myWindow.document.write('<html><head><title>Recharge SEA</title>');
    // myWindow.document.write('<link rel="stylesheet" href="./print.css" type="text/css" />');
    myWindow.document.write('</head><body>');
    myWindow.document.write(data);
    myWindow.document.write('</body></html>');
    myWindow.document.close();
    myWindow.print();
    myWindow.onload = function(){
      myWindow.print();
      myWindow.close();
    };
    this._cdr.writeCDR(this.startTime, this.category, 'Print TnC');
  }
  savePDF() {
    window.location.href = '/recharge/api/savePDF';
    this._cdr.writeCDR(this.startTime, this.category, 'Save PDF');
  }
  getBundleDesc(finalBundle): string {
    let msisdn_spl = finalBundle.msisdn.toString();
    let desc = '';
    if(msisdn_spl[0] === '2' && msisdn_spl[1] === '7') {
      msisdn_spl = '0' + msisdn_spl.substr(2);
    }
    this.spaces_msisdn = msisdn_spl[0] + msisdn_spl[1] + msisdn_spl[2] + ' ' + msisdn_spl[3] + msisdn_spl[4] + msisdn_spl[5]
                 + ' ' + msisdn_spl[6] + msisdn_spl[7] + msisdn_spl[8] + msisdn_spl[9];
    // this.spaces_msisdn = msisdn_spl[0] + msisdn_spl[1] + msisdn_spl[2] + ' ' + msisdn_spl[3] + msisdn_spl[4] + msisdn_spl[5] + ' ' + msisdn_spl[6] + msisdn_spl[7] + msisdn_spl[8] + msisdn_spl[9];
    if (finalBundle.vas_code === 'Airtime') {
      desc = config.CURRENCY + parseFloat(finalBundle.cost).toString() + ' Airtime for ' + this.spaces_msisdn;
    } else {
      desc = finalBundle.customer_facing_name + ' (valid for ' + finalBundle.period + ') for ' + this.spaces_msisdn;
    }
    return desc;
  }
  backButtonRedirection() {
    let back_type = this.finalBundle.com_type;
    back_type = back_type.toLowerCase();
    this._router.navigate(['recharge', back_type]);
    this._cdr.writeCDR(this.startTime, this.category, 'Back to Home Page');
  }
  checkReadTnC(eve) {
    this.checked_readTnC = eve;
  }
}
