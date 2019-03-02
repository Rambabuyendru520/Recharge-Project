import { Injectable } from '@angular/core';
import { config } from '../config';
import { Http, Headers } from '@angular/http';
import * as shajs from 'sha.js';

@Injectable()
export class FeedbackService {
  constructor(private _http: Http) {}
  responsebundlejson: any = {};
  getAPIDetails(hitURL, payload) {
    const headers: Headers = new Headers();
    headers.append('Authorization', shajs('sha256').update(config.AUTH_KEY).digest('hex'));
    headers.append('Content-Type', 'application/json');
    return this._http.post(hitURL, payload, {headers: headers}).timeout(config.TIME_OUT)
    .toPromise()
    .then(resp => {
      return resp.json();
    })
    .catch(function(err) {
    if (err.status === 403 || err.status === '403') {
      this.router.navigate(['recharge', 'error']);
    }
    Promise.reject(err);
  });
 }
  sendFeedback(rating, feedback, e_com_num, vas_code, facing_name) {
        const sendFeedbackURL = config.PLUGIN_URL + 'sendFeedback';
        const payload = {
            order_no : e_com_num,
            rating: rating,
            feedback: feedback,
            vas_code: vas_code,
            facing_name: facing_name
        };
        return this.getAPIDetails(sendFeedbackURL, payload).then( response => {
          if (response.status_code === 0) {
            return Promise.resolve(response);
          } else {
            return Promise.reject(response);
          }
        }).catch(function(err) {
          return Promise.reject(err);
        });
    }
}
