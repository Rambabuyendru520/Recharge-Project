import { Component, Input, OnInit } from '@angular/core';
import { config } from '../../../config';
@Component({
  selector: 'com-bundle-card',
  templateUrl: './bundle-card.component.html',
  styleUrls: ['./bundle-card.component.scss', '../../scss/_bundle-card.scss'],
})
export class BundleCardComponent implements OnInit {
  @Input() size: any;
  @Input() unit: any;
  @Input() rate: any;
  @Input() y_desc: any;
  @Input() w_desc: any;
  @Input() special_check: any;
  @Input() check: any;
  @Input() color: any;
  currency: any = config.CURRENCY;
  special_icon: any = config.ASSETS + '/images/star-white.svg';
  select_icon: any = config.ASSETS + '/images/selected-bundle-desktop.svg';
  unselect_icon: any = config.ASSETS + '/images/unselected-bundle-desktop.svg';
  select_icon_mob: any = config.ASSETS + '/images/selected-bundle-mobile.svg';
  unselect_icon_mob: any = config.ASSETS + '/images/unselected-bundle-mobile.svg';
  ngOnInit() {
    const rid = Math.random().toString(36);
    document.getElementById('bundle-main').id = rid;
    this.rate = parseInt(this.rate, 0);
  }
}
