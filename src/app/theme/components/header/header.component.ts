import { Component, OnInit, OnChanges, Input, EventEmitter, Output } from '@angular/core';
import { config } from '../../../config';
import { AngularCDRService } from '../../../plugins/angularCDR';
import { HeaderBackService } from '../../services';
import { GoogleAnalyticsService } from '../../services/google-tag';
import { Router } from '@angular/router';

@Component({
  selector: 'com-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.scss', '../../scss/_header.scss']
})

export class HeaderComponent implements OnInit, OnChanges {
  @Input() header_text: string;
  public ASSETS_PATH: string = config.ASSETS;
  showBackToProduct = false;
  startTime: any;
  @Output() setLink = new EventEmitter();
  @Output() logoRedirection = new EventEmitter();
  dataLayer: any;
  constructor(private _router: Router,private _cdr: AngularCDRService, private _googleTag: GoogleAnalyticsService) {}
  ngOnInit() {
    this.dataLayer = this._googleTag.nativeWindow.dataLayer;
  }
  ngOnChanges() {
    this.startTime = this._cdr.getTransactionTime(0).toString();
  }
  goBack() {
    this.setLink.emit();
  }
  logoClick() {
    const routerPath1 = this._router.url.split('/')[1];
    const routerPath2 = this._router.url.split('/')[2];
    if (routerPath2 === 'welcome') {
      window.location.href = 'https://brightside.mtn.co.za';
    } else if (routerPath1 === 'pagenotfound' || routerPath2 === 'confirmation'
    || routerPath2 === 'feedback' || routerPath2 === 'forbidden' || routerPath2 === 'error') {
      this._router.navigate(['recharge', 'welcome']);
    } else {
      this._router.navigate(['recharge', 'welcome']);
      this.logoRedirection.emit();
    }
    this.dataLayer.push({
      event: 'eventTracker',
      category: 'SEA - MTN Logo',
      action: 'Click',
      label: 'Logo'
    });
  }
}

