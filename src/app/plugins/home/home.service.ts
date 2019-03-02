import { Injectable } from '@angular/core';
import { config } from '../config';
import { Http, Headers } from '@angular/http';
import * as shajs from 'sha.js';
import { validity } from './config';

@Injectable()
export class HomeService {
  public validateCard: any = {};
  constructor(private _http: Http) { }
  responsebundlejson: any = {};
  getAPIDetails(hitUrl, payload) {
      const headers: Headers = new Headers();
      headers.append('Authorization', shajs('sha256').update(config.AUTH_KEY).digest('hex'));
      headers.append('Content-Type', 'application/json');
      return this._http.post(hitUrl, payload, {headers: headers}).timeout(config.TIME_OUT)
      .toPromise()
      .then(resp => {
      return resp.json();
    }).catch(function(err) {
      if (err.status === 403 || err.status === '403') {
        // window.location.href = '/recharge/forbidden';
      }
      Promise.reject(err);
    });
 }
  getBundleObjInit() {
   const responsebundlejson = [
    {
      'bundleType': 'Data',
      'bundleClicked': 'false',
      'results': []
    },
    {
      'bundleType': 'SMS',
      'bundleClicked': 'false',
      'results': []
    },
    {
      'bundleType': 'Fibre',
      'bundleClicked': 'false',
      'results': []
    }
   ];
   return responsebundlejson;
  }
  getBundleDetails() {
    const getBundlesListURL = config.PLUGIN_URL + 'getBundlesList';
    const payload = {};
    return this.getAPIDetails(getBundlesListURL, payload).then( response => {
      if (response.status_code === 0 || response.statusCode === 0) {
        if (response.vas) {
          this.responsebundlejson = this.getBundleObjInit();
          for (let i = 0; i < response.vas.length; i++) {
            if (response.vas[i].bundletype === 'Data') {
              const databundleresponse = response.vas[i].vasServices;
              for (let j = 0; j < databundleresponse.length; j++) {
                if(databundleresponse[j].shareable === 'N') {
                  let desc = '';
                let subdesc = '';
                let value = databundleresponse[j].value;
                let unit = '';
                let vas_code = '';
                let special = false;
                const customer_facing_name = databundleresponse[j].customerFacingName;
                const chargeable = databundleresponse[j].chargeable;
                if (databundleresponse[j].onceOffVasCode) {
                  vas_code = databundleresponse[j].onceOffVasCode;
                } else if (vas_code = databundleresponse[j].recurringVasCode) {
                  vas_code = databundleresponse[j].recurringVasCode;
                }
                if (databundleresponse[j].value !== 'Unlimited') {
                  value = databundleresponse[j].value;
                  unit = databundleresponse[j].uom;
                }
                if (validity[databundleresponse[j].period] !== '6 Months') {
                  desc = 'Valid for ' + databundleresponse[j].period;
                  subdesc = '';
                } else {
                  desc = 'once-off payment';
                  subdesc = 'pm x ' + databundleresponse[j].period;
                }
                if (databundleresponse[j].promotionalBundle === 'Yes') {
                  special = true;
                }
                const newdatabundle = {
                  'period': databundleresponse[j].period,
                  'name': unit,
                  'desc': desc,
                  'subdesc': subdesc,
                  'value': value,
                  'cost': databundleresponse[j].cost,
                  'color': 'yellow',
                  'special': special,
                  'check': false,
                  'lastclick': false,
                  'vas_code': vas_code,
                  'customer_facing_name': customer_facing_name,
                  'chargeable': chargeable,
                  'vatCost': databundleresponse[j].vatCost
                };
                if (this.responsebundlejson[0].results.length <= 0) {
                  const newdata = [{
                    'bundleSubType': '1 Hour',
                    'subresults': []
                  }, {
                    'bundleSubType': '1 Day',
                    'subresults': []
                  }, {
                    'bundleSubType': '1 Week',
                    'subresults': []
                  }, {
                    'bundleSubType': '1 Month',
                    'subresults': []
                  }, {
                    'bundleSubType': '6 Months',
                    'subresults': []
                  }];
                  this.responsebundlejson[0].results = newdata;
                }
                for (let k = 0; k < this.responsebundlejson[0].results.length; k++) {
                  if (this.responsebundlejson[0].results[k].bundleSubType === databundleresponse[j].period) {
                    this.responsebundlejson[0].results[k].subresults.push(newdatabundle);
                    break;
                  }
                }
                }
                
              }
            } else if (response.vas[i].bundletype === 'SMS') {
              if (response.vas[i].vasServices) {
                const smsbundleresponse = response.vas[i].vasServices;
                let desc = '';
                let subdesc = '';
                let vas_code = '';
                let special = false;
                for (let j = 0; j < smsbundleresponse.length; j++) {
                  if (smsbundleresponse[j].shareable === 'N') {
                    const customer_facing_name = smsbundleresponse[j].customerFacingName;
                  const chargeable = smsbundleresponse[j].chargeable;
                  if (smsbundleresponse[j].onceOffVasCode) {
                    vas_code = smsbundleresponse[j].onceOffVasCode;
                  } else if (vas_code = smsbundleresponse[j].recurringVasCode) {
                    vas_code = smsbundleresponse[j].recurringVasCode;
                  }
                  if (validity[smsbundleresponse[j].period] !== '6 Months') {
                    desc = 'Valid for ' + smsbundleresponse[j].period;
                    subdesc = '';
                  } else {
                    desc = 'once-off payment';
                    subdesc = 'pm x ' + smsbundleresponse[j].period;
                  }
                  if (smsbundleresponse[j].promotionalBundle === 'Yes') {
                    special = true;
                  }
                  const newsmsbundle = {
                    'period': smsbundleresponse[j].period,
                    'name': 'SMS\'s',
                    'desc': desc,
                    'subdesc': subdesc,
                    'value': smsbundleresponse[j].value,
                    'cost': smsbundleresponse[j].cost,
                    'color': 'yellow',
                    'special': special,
                    'check': false,
                    'lastclick': false,
                    'vas_code': vas_code,
                    'customer_facing_name': customer_facing_name,
                    'chargeable': chargeable,
                    'vatCost': smsbundleresponse[j].vatCost
                  };
                  this.responsebundlejson[1].results.push(newsmsbundle);
                }
                  }
                  
              }
            } else if (response.vas[i].bundletype === 'Fibre') {
              const fibrebundleresponse = response.vas[i].vasServices;
              for (let j = 0; j < fibrebundleresponse.length; j++) {
                if (fibrebundleresponse[j].shareable === 'N') {
                  
                let desc = '';
                let subdesc = '';
                let value = fibrebundleresponse[j].value;
                let unit = '';
                let vas_code = '';
                let special = false;
                const customer_facing_name = fibrebundleresponse[j].customerFacingName;
                const chargeable = fibrebundleresponse[j].chargeable;
                if (fibrebundleresponse[j].onceOffVasCode) {
                  vas_code = fibrebundleresponse[j].onceOffVasCode;
                } else if (vas_code = fibrebundleresponse[j].recurringVasCode) {
                  vas_code = fibrebundleresponse[j].recurringVasCode;
                }
                if (fibrebundleresponse[j].value !== 'Unlimited') {
                  value = fibrebundleresponse[j].value;
                  unit = fibrebundleresponse[j].uom;
                }
                if (validity[fibrebundleresponse[j].period] !== '6 Months') {
                  desc = 'Valid for ' + fibrebundleresponse[j].period;
                  subdesc = '';
                } else {
                  desc = 'once-off payment';
                  subdesc = 'pm x ' + fibrebundleresponse[j].period;
                }
                if (fibrebundleresponse[j].promotionalBundle === 'Yes') {
                  special = true;
                }
                const newfibrebundle = {
                  'period': fibrebundleresponse[j].period,
                  'name': unit,
                  'desc': desc,
                  'subdesc': subdesc,
                  'value': value,
                  'cost': fibrebundleresponse[j].cost,
                  'color': 'yellow',
                  'special': special,
                  'check': false,
                  'lastclick': false,
                  'vas_code': vas_code,
                  'customer_facing_name': customer_facing_name,
                  'chargeable': chargeable,
                  'vatCost': fibrebundleresponse[j].vatCost
                };
                this.responsebundlejson[2].results.push(newfibrebundle);
                }
              }
            }
          }
          return Promise.resolve(this.responsebundlejson);
        }
      } else {
        return Promise.reject(response);
      }
    }).catch(error => {
      Promise.reject(error);
    });
  }
  getValidateBundleDetails(msisdn: string, vas_code: string, airtime_value: any) {
    const getValidateURL = config.PLUGIN_URL + 'getValidateCard';
    const payload = {
      msisdn: msisdn,
      vas_code: vas_code,
      airtime_value: airtime_value
    };
    return this.getAPIDetails(getValidateURL, payload).then(response => {
      if (response.status_code === 0 || response.statusCode === 0) {
        return Promise.resolve(response);
      } else {
        return Promise.reject(response);
      }
    }).catch(function (err) {
      return Promise.reject(err);
    });
  }
}
