import { Http, Headers } from '@angular/http';
import * as shajs from 'sha.js';
import { Injectable } from '@angular/core';
import { config } from '../config';

@Injectable()

export class PayementGatewayService {
    constructor(private _http: Http) { }
    getPaymentRequest(payload: any) {
        const paymentURL: any = config.PLUGIN_URL + 'payment';
        const headers: Headers = new Headers();
        headers.append('Authorization', shajs('sha256').update(config.AUTH_KEY).digest('hex'));
        headers.append('Content-Type', 'application/json');
        return this._http.post(paymentURL, payload, {headers: headers}).timeout(config.TIME_OUT)
        .toPromise()
        .then(resp => {
            return resp.json();
        })
        .catch(err => Promise.reject(err));
    }
}
