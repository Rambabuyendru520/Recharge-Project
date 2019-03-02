import { Component, OnInit, OnChanges, AfterViewInit } from '@angular/core';
import { config } from '../../config';
import { CommonService, BundleSelectionService, PreloaderService } from '../../theme/services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HomeService } from '../../plugins/home';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../reducers';
import * as loader from '../../actions/slimloader';
import { format } from '../../utils/formatter';
import { GoogleAnalyticsService } from '../../theme/services/google-tag';
import { AngularCDRService } from '../../plugins/angularCDR';
import {Location} from '@angular/common';
import {HostListener } from '@angular/core';
declare var $: any;
@Component({
  selector: 'com-login',
  templateUrl: './home.component.html',
  styleUrls: ['../../theme/scss/_home.scss', '../../theme/scss/_card.scss', './home.component.scss'],
})
export class HomeComponent implements OnInit, OnChanges, AfterViewInit {
  bundleArray = config.bunCon;
  bundleHelpArray = config.bunHelp;
  lastClick: any = 0;
  mobId: any = 0;
  hide_icons: any = false;
  mobile_screen: any = false;
  bundlelist_details: any;
  help_icon = false;
  header_text: any = 'Recharge';
  msisdnForm: FormGroup;
  tabvalue: any;
  routeValue: any;
  footerDiv = false;
  showBundles = false;
  finalBundleObj: any;
  airtime_value: any = '';
  isBundleSelected: any;
  startTime: any;
  confirmation: any = false;
  category: any = 'Home';
  bundlePopup_text: any = '';
  dataLayer: any;
  public ASSETS_PATH: string = config.ASSETS;
  pageTitles: any = ['MTN Data Recharge - Recharge Online with MTN', 'MTN Airtime Recharge - Recharge Online with MTN',
                    'MTN SMS Recharge - Recharge Online with MTN', 'MTN Fibre Recharge - Recharge Online with MTN'];
  constructor(private location: Location, private _router: Router, private _loader: PreloaderService, private _store: Store<fromRoot.State>,
    private _common: CommonService, private _home: HomeService, private fb: FormBuilder,
    private _bundleSelect: BundleSelectionService, private _googleTag: GoogleAnalyticsService, private _cdr: AngularCDRService) {}
    /* make common */
    @HostListener('window:orientationchange', ['$event'])
    onWindowOrientationchange() {
      this.routeValue = this._router.url.split('/')[2];
    this.mainRouting(this._router.url.split('/')[2]);
        if (this.checkforRoutes('data')) {
          this.bundleArray.results[0].click = true;
          this.lastClick = 0;
          this.footerDiv = true;
          this.mobId = 0;
          this.toggleIcon(0, false);
          document.title = this.pageTitles[0];
        } else if (this.checkforRoutes('airtime')) {
          this.bundleArray.results[1].click = true;
          this.footerDiv = true;
          this.mobId = 1;
          this.toggleIcon(1, false);
          document.title = this.pageTitles[1];
        } else if (this.checkforRoutes('sms')) {
          this.bundleArray.results[2].click = true;
          this.lastClick = 2;
          this.footerDiv = true;
          this.mobId = 2;
          document.title = this.pageTitles[2];
        } else {
          this.bundleArray.results[0].click = true;
          this.lastClick = 0;
          this.footerDiv = true;
          this.mobId = 0;
          this.toggleIcon(0, false);
          document.title = this.pageTitles[0];
        }
         if (this._common.ifOrientationChange() && this.routeValue !== 'welcome') {
          this.mobile_screen = true;
          if (this.mobId >= 0) {
          }
        } else {
          this.mobile_screen = false;
        }
  }
  /* make common */
  ngOnInit() {
    this.resetOrder();
    this.location.subscribe((x) => {
      if (this.lastClick !== -1) {
        this.bundleArray.results[this.lastClick].click = false;
      }
      this.mainRouting(x.url.split('/')[2]);
    });
    this.mobId = 0;
    this.startTime = this._cdr.getTransactionTime(0);
    this._cdr.writeCDR(this.startTime, 'Home', 'Recharge');
    this._loader.show();
    this.dataLayer = this._googleTag.nativeWindow.dataLayer;
    this.routeValue = this._router.url.split('/')[2];
    this.mainRouting(this._router.url.split('/')[2]);
      if (this.checkforRoutes('data')) {
          this.bundleArray.results[0].click = true;
          this.lastClick = 0;
          this.footerDiv = true;
          this.mobId = 0;
          this.toggleIcon(0, false);
          document.title = this.pageTitles[0];
        } else if (this.checkforRoutes('airtime')) {
          this.bundleArray.results[1].click = true;
          this.footerDiv = true;
          this.mobId = 1;
          this.toggleIcon(1, false);
          document.title = this.pageTitles[1];
        } else if (this.checkforRoutes('sms')) {
          this.bundleArray.results[2].click = true;
          this.lastClick = 2;
          this.footerDiv = true;
          this.mobId = 2;
          document.title = this.pageTitles[2];
        } else {
          this.bundleArray.results[0].click = true;
          this.lastClick = 0;
          this.footerDiv = true;
          this.mobId = 0;
          this.toggleIcon(0, false);
          document.title = this.pageTitles[0];
        }
         if (this._common.ifMobile()) {
          this.mobile_screen = true;
        }
    this.msisdnForm = this.fb.group({
      msisdn: ['', [Validators.required, Validators.minLength(config.MIN_MSISDN_LENGTH), Validators.maxLength(config.MSISDN_LENGTH)]]
    });
    // bundle bundleListService
     this._home.getBundleDetails()
    .then(response => {
      this.bundlelist_details = response;
      this.showBundles = true;
      this._loader.hide(1000);
    })
    .catch(err => {
      this._loader.hide(1000);
      this.bundlelist_details = null;
    });
    this._bundleSelect.globalBundleEvent.subscribe( res => {
       this.finalBundleObj = res;
    });
    this._bundleSelect.bundleFlagEvent.subscribe(res => {
      this.isBundleSelected = res;
      const bundleObj = this._bundleSelect.getFinalBundle();
      let delay;
      if (bundleObj.vas_code) {
        delay = 800;
      } else {
        delay = 10;
      }
      if (this.isBundleSelected && this._bundleSelect.getBundleFlag()) {
        setTimeout(() => {
          this._bundleSelect.setInputFocus();
          }, delay);
      } else {
        this._bundleSelect.unSetInputFocus();
      }
    });
  }
  swipeLeft(idx: any) {
    if (++idx <= 2) {
      this.toggleIcon(idx, false);
    }
  }
  swipeRight(idx: any) {
    if (--idx >= 0) {
      this.toggleIcon(idx, false);
    }
  }
  ngAfterViewInit() {
    this._cdr.writeCDR(this.startTime, this.category, 'Start');
    /* const input = document.getElementById('msisdn-input') as HTMLInputElement;
    let order_obj = JSON.parse(sessionStorage.getItem('order'));
    if (order_obj && order_obj.msisdn) {
      input.value = order_obj.msisdn;
    } */
  }
  ngOnChanges() {
    this.startTime = this._cdr.getTransactionTime(0);
    this.startTime = this._cdr.getTransactionTime(0).toString();
    this.routeValue = this._router.url.split('/')[2];
        if (this.checkforRoutes('data')) {
          this.bundleArray.results[0].click = true;
          this.lastClick = 0;
          this.footerDiv = true;
          this.mobId = 0;
          document.title = this.pageTitles[0];
        } else if (this.checkforRoutes('airtime')) {
          this.bundleArray.results[1].click = true;
          this.lastClick = 1;
          this.footerDiv = true;
          this.mobId = 1;
          document.title = this.pageTitles[1];
        } else if (this.checkforRoutes('sms')) {
          this.bundleArray.results[2].click = true;
          this.lastClick = 2;
          this.footerDiv = true;
          this.mobId = 2;
          document.title = this.pageTitles[2];
        } else {
          this.bundleArray.results[0].click = true;
          this.lastClick = 0;
          this.footerDiv = true;
          this.mobId = 0;
          document.title = this.pageTitles[0];
          if (this._common.ifMobile()) {
            this.mobile_screen = true;
          }
        }
        if (this._common.ifMobile()) {
          this.mobile_screen = true;
        }
    if (this._bundleSelect.getBundleFlag() && this.confirmation) {
      setTimeout(() => {
        this._bundleSelect.setInputFocus();
        }, 1000);
    }
  }
  mainRouting(routeURL) {
    this.routeValue = routeURL;
        if (this.checkforRoutes('data')) {
          this.bundleArray.results[0].click = true;
          this.lastClick = 0;
          this.footerDiv = true;
          this.mobId = 0;
          document.title = this.pageTitles[0];
        } else if (this.checkforRoutes('airtime')) {
          this.bundleArray.results[1].click = true;
          this.lastClick = 1;
          this.footerDiv = true;
          this.mobId = 1;
          document.title = this.pageTitles[1];
        } else if (this.checkforRoutes('sms')) {
          this.bundleArray.results[2].click = true;
          this.lastClick = 2;
          this.footerDiv = true;
          this.mobId = 2;
          document.title = this.pageTitles[2];
        } else {
          this.bundleArray.results[0].click = true;
          this.lastClick = 0;
          this.footerDiv = true;
          this.mobId = 0;
          document.title = this.pageTitles[0];
          if (this._common.ifMobile()) {
            this.mobile_screen = true;
          }
        }
        if (this._common.ifMobile()) {
          this.mobile_screen = true;
        }
  }
  toggleIcon(idx: any, disable:  any) {
    if (!disable) {
      this.footerDiv = true;
      if (this.bundlelist_details && this.bundlelist_details.results && this.bundlelist_details.results.length > 0) {
        for (let i = 0; i < this.bundlelist_details.results.length; i++) {
          this.bundlelist_details.results[i].bundleClicked = 'false';
        }
      }
      if (this.lastClick !== -1) {
        this.bundleArray.results[this.lastClick].click = false;
      }
      this.bundleArray.results[idx].click = true;
      this.lastClick = idx;
      this._router.navigate(['recharge', this.bundleArray.results[idx].icon]);
      if (this._common.ifMobile()) {
         this.mobile_screen = true;
      }
      this.dataLayer.push({
        event: 'eventTracker',
        category: 'SEA - Recharge Option',
        action: 'Click',
        label: this.bundleArray.results[idx].name
      });
      this._bundleSelect.toggleIcon(idx);
      if (this.pageTitles[idx]) {
        document.title = this.pageTitles[idx];
      }
    }
  }
  helpIcon() {
    this.help_icon = true;
    this.ngOnChanges();
    this.dataLayer.push({
      event: 'eventTracker',
      category: 'SEA - Not Sure',
      action: 'Click',
      label: 'Click Here'
    });
  }
  helpBackIcon() {
    this.help_icon = false;
  }
  footerEmitter(msisdn) {
    this.confirmation = true;
    msisdn = format.msisdn(msisdn.toString());
    this.finalBundleObj.msisdn = msisdn;
    let vas_code = '';
    let airtime_value = '';
    let trans_type = '';
    if (this.finalBundleObj.com_type !== 'AIRTIME') {
      vas_code = this.finalBundleObj.vas_code;
      trans_type = 'Bundle';
    } else {
      this.finalBundleObj.vas_code = 'Airtime';
      vas_code = 'Airtime';
      trans_type = 'Airtime';
      airtime_value = this.finalBundleObj.cost;
    }
    this._bundleSelect.changeBundle(this.finalBundleObj);
    this.finalBundleObj.cost = parseInt(this.finalBundleObj.cost, 0).toString();
    this.dataLayer.push({
      event: 'eventTracker',
      category: 'SEA - Buy Now',
      action: 'Click',
      label: this.finalBundleObj.period + ' - ' + this.finalBundleObj.customer_facing_name
    });
    this._store.dispatch(new loader.StartSlimloaderAction);
    this._cdr.writeCDR(this.startTime, this.category, 'Buy Now');
    this._home.getValidateBundleDetails(msisdn, vas_code, airtime_value)
    .then(resp => {
        this._store.dispatch(new loader.StopSlimloaderAction);
        this._cdr.writeCDR(this.startTime, this.category, 'Validate Card Success');
        this.finalBundleObj.order_no = resp.ecommerce_reference_num;
        const payload = {
          'order_no': this.finalBundleObj.order_no,
          'msisdn': format.msisdn(this.finalBundleObj.msisdn),
          'amount': this.finalBundleObj.cost,
          'vas_code': this.finalBundleObj.vas_code,
          'facing_name': this.finalBundleObj.customer_facing_name,
          'chargeable': this.finalBundleObj.chargeable,
          'trans_type': trans_type
        };
        sessionStorage.setItem('order', JSON.stringify(payload));
        this._bundleSelect.changeBundle(JSON.stringify(this.finalBundleObj));
        this._router.navigate(['recharge', 'confirmation']).then( () => {
          this._cdr.writeCDR(this.startTime, this.category, 'Confirmation Page Redirection Success');
        }, () => {
          this._cdr.writeCDR(this.startTime, this.category, 'Confirmation Page Redirection Failure');
        });
    })
    .catch(err => {
      this._store.dispatch(new loader.StopSlimloaderAction);
      this._cdr.writeCDR(this.startTime, this.category, 'Validate Card Failure');
      if (err.status_code === 204) {
        // Offnet or Invalid Number
        this._cdr.writeCDR(this.startTime, this.category, 'Offnet Fallout Screen');
        // this._router.navigate(['recharge', 'error', 'offnet']);
        this._bundleSelect.setFallout(3);
      } else if (err.status_code === 205) {
        // Bundle Unavailable Popup
        this.bundlePopup_text = 'Unfortunately that bundle isn’t available right now. Please pick a different one.';
        $('#bundleModal').modal('toggle');
        this._cdr.writeCDR(this.startTime, this.category, 'Show UnAvailable Bundle Popup');
      } else if (err.status_code === 201) {
        // Airtime Limit exceeded
        this._cdr.writeCDR(this.startTime, this.category, 'Airtime Limit Exceeded Screen');
        this._bundleSelect.setFallout(5);
        // this._router.navigate(['recharge', 'error', 'limit']);
      } else if (err.status_code === 202) {
        this.bundlePopup_text = 'Unfortunately the number you entered isn\'t eligible for this bundle. ' +
        'Do you want to choose a different bundle?';
        $('#bundleModal').modal('toggle');
        this._cdr.writeCDR(this.startTime, this.category, 'Show Ineligible Bundle Popup');
      } else {
        // General Error
        this._cdr.writeCDR(this.startTime, this.category, 'General Fallout Screen');
        // this._bundleSelect.setFallout(2);
        this._router.navigate(['recharge', 'error']);
      }
    });
  }
  helpEmitter(navigate_name, button_name) {
    this.help_icon = false;
    this.dataLayer.push({
      event: 'eventTracker',
      category: 'SEA - Choose Bundle More Details',
      action: 'Click',
      label: button_name
    });
    this._router.navigate(['recharge', navigate_name]).then( nav => {
      this.ngOnChanges();
    });
  }
  backEmitter() {
      window.location.href = config.BRIGHT_SIDE_LINK;
   this.dataLayer.push({
    event: 'eventTracker',
    category: 'SEA - Go Back',
    action: 'Click',
    label: 'Back'
  });
  }
  hideModal() {
    $('#bundleModal').modal('toggle');
    document.getElementById('hiddendiv').scrollIntoView({behavior: 'smooth', block: 'end', inline: 'end'});
    this.dataLayer.push({
      event: 'eventTracker',
      category: 'SEA - Bundle Type',
      action: 'Click',
      label: 'Choose Different Bundle'
    });
    this._cdr.writeCDR(this.startTime, this.category, 'Hide Unavailable Bundle Popup');
  }
  mtnLogoRedirect() {
    if (this.lastClick !== -1) {
      this.bundleArray.results[this.lastClick].click = false;
    }
    this.mainRouting('welcome');
  }
  resetOrder() {
    let order_obj: any = sessionStorage.getItem('order');
    if (order_obj) {
      order_obj = JSON.parse(order_obj);
      order_obj.order_no = null;
      order_obj.amount = null;
      order_obj.vas_code = null;
      order_obj.facing_name = null;
      order_obj.chargeable = null;
      order_obj.trans_type = null;
      sessionStorage.setItem('order', JSON.stringify(order_obj));
    }
  }
  checkforRoutes(dataValue) {
    const str = this.routeValue.substring(0, dataValue.length);
    if (str === dataValue) {
      return true;
    } else {
      return false;
    }
  }
}


