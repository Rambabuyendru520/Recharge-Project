import { Injectable } from '@angular/core';
import { Http, Headers  } from '@angular/http';
import * as shajs from 'sha.js';
import { config } from '../config';
import { BundleSelectionService } from '../../theme/services';
@Injectable()

export class AngularCDRService {
  constructor(private http: Http, private _bundleSelect: BundleSelectionService) {}
  private sendTowriteCDR(transStartTime, order_no, activityCategory, subCategory,
    browserVersion, transEndTime) {
      const cdrLoggerURL = config.PLUGIN_URL + 'angularCDR';
      const payload = {
      'transStartTime': transStartTime,
      'transEndTime': transEndTime,
      'msisdn': order_no,
      'edrType': 'Recharges',
      'activityCategory': activityCategory,
      'subCategory': subCategory,
      'component': 'FrontEnd',
      'browserVersion': browserVersion
    };
    const headers: Headers = new Headers();
    headers.append('Authorization', shajs('sha256').update(config.AUTH_KEY).digest('hex'));
    headers.append('Content-Type', 'application/json');
    this.http.post(cdrLoggerURL, payload, {headers: headers}).timeout(config.TIME_OUT)
    .toPromise()
      .then(resp => {
        return resp.json();
      })
      .catch(err => {
        if (err.status === 403 || err.status === '403') {
          window.location.href = '/recharge/forbidden';
        }
        Promise.reject(err);
      });
  }
  writeCDR(startTime, category, subCategory) {
    const browserVersion = this.getBrowserType();
    const endTime = this.getTransactionTime(0);
    let order_obj: any = sessionStorage.getItem('order');
    let order_no: any;
    if (order_obj) {
      order_obj = JSON.parse(order_obj);
      order_no = order_obj.order_no;
    }
    this.sendTowriteCDR(startTime, order_no, category, subCategory, browserVersion, endTime);
  }
   getTransactionTime(offset) {
    if (!offset) {
      offset = 0;
    }
    const today = new Date();
    const date = new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
    let dd = date.getDate();
    const mm = date.getMonth() + 1;
    const yyyy = date.getFullYear();
    if (dd < 10) {
      dd = Number('0' + dd);
    }
    let hh = date.getHours();
    let MM = date.getMinutes();
    let ss = date.getSeconds();
    if (hh < 10) {
      hh = this.addZero(hh);
    }
    if (MM < 10) {
      MM = this.addZero(MM);
    }
    if (ss < 10) {
      ss = this.addZero(ss);
    }
    const finalDate = dd + '-' + mm + '-' + yyyy + ' ' + hh + ':' + MM + ':' + ss + '.' + date.getMilliseconds();
    return finalDate.toString();
  }
  private addZero(i) {
    i = (i < 10) ? '0' + i : i;
    return i;
  }
  public getBrowserType() {
    let browserType = '';
    if ((navigator.userAgent.indexOf('Opera') || navigator.userAgent.indexOf('OPR')) !== -1 ) {
        browserType = 'Opera';
    } else if (navigator.userAgent.indexOf('Chrome') !== -1 ) {
      browserType = 'Chrome';
    } else if (navigator.userAgent.indexOf('Safari') !== -1) {
      browserType = 'Safari';
    } else if (navigator.userAgent.indexOf('Firefox') !== -1 ) {
      browserType = 'Firefox';
    } else if ((navigator.userAgent.indexOf('MSIE') !== -1 )) {
      browserType = 'IE';
    } else {
      browserType = 'unknown';
    }
    return browserType;
  }

}
