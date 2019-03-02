import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { config } from '../../../config';
import { EventEmitter } from 'events';
import { BundleSelectionService } from '../../../theme/services';
import { GoogleAnalyticsService } from '../../../theme/services/google-tag';

@Component({
  selector: 'com-data-bundles',
  templateUrl: './data-bundles.component.html',
  styleUrls: ['./data-bundles.component.scss', '../../../theme/scss/_data-bundles.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DataBundlesComponent implements OnInit {
  public ASSETS_PATH: string = config.ASSETS;
  firstTab: any = 3;
  tooltip_path: any = this.ASSETS_PATH + '/images/tooltip.svg';
  tab_state: any = [false, false, false, true, false];
  currentTab: any = this.firstTab;
  lastClickedTab: any = this.firstTab;
  bundleArray: any = config.bunData;
  databundleArray: any = [];
  databundleTab: any = [];
  lastClicked: any = -1;
  bundleSelectEve = new EventEmitter();
  @Input() mobile: any;
  @Input() bundleList: any;
  dataLayer: any;
  constructor(private _bundleSelect: BundleSelectionService, private _googleTag: GoogleAnalyticsService) {}
  ngOnInit() {
    this.dataLayer = this._googleTag.nativeWindow.dataLayer;
    if (this.bundleList && this.bundleList[0] && this.bundleList[0].results.length > 0) {
      this.databundleTab = this.bundleList[0].results;
      this.databundleArray = this.bundleList[0].results[this.firstTab];
    }
    this._bundleSelect.globalBundleEvent.subscribe( res => {
      if (res.com_type !== this._bundleSelect.DATA) {
        if (this.currentTab === this.lastClickedTab && this.lastClicked > -1) {
          this.databundleArray.subresults[this.lastClicked].check = false;
          this.lastClicked = -1;
          this.lastClickedTab = 0;
        }
      }
    });
  }
  changeTab(id: any) {
    this.tab_state[this.currentTab] = false;
    this.tab_state[id] = true;
    this.currentTab = id;
    this.lastClickedTab = id;
    if (this.lastClicked > -1) {
      if (this.databundleArray.subresults[this.lastClicked].check) {
        this.databundleArray.subresults[this.lastClicked].check = false;
      }
    }
    this._bundleSelect.setBundleFlag(false);
    this.lastClicked = -1;
    this.databundleArray = this.bundleList[0].results[id];
    this.dataLayer.push({
      event: 'eventTracker',
      category: 'SEA - Choose Bundle Period',
      action: 'Click',
      label: this.databundleTab[id].bundleSubType
    });
  }
  select_bundle(idx) {
    // one bundle selected at one time
     if (this.lastClicked > -1 && idx === this.lastClicked && this.databundleArray.subresults[idx].check) {
        this.databundleArray.subresults[this.lastClicked].check = false;
        this.lastClicked = -1;
        this._bundleSelect.setBundleFlag(false);
     } else {
      if (this.currentTab === this.lastClickedTab && this.lastClicked > -1 && this.databundleArray.subresults[this.lastClicked].check) {
        this.databundleArray.subresults[this.lastClicked].check = false;
      }
      this.databundleArray.subresults[idx].check = true;
      this.lastClicked = idx;
      const bundleInfo = this.databundleArray.subresults[idx];
      bundleInfo.com_type = this._bundleSelect.DATA;
      this._bundleSelect.changeBundle(bundleInfo);
     }
     this.dataLayer.push({
      event: 'eventTracker',
      category: 'SEA - Choose Bundle',
      action: 'Click',
      label: this.databundleTab[this.lastClickedTab].bundleSubType + ' - ' + this.databundleArray.subresults[idx].name
    });
  }
}


