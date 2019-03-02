import { Component,Input, OnInit } from '@angular/core';
import { config } from '../../../config';
import { BundleSelectionService } from '../../../theme/services';

@Component({
  selector: 'com-sms-bundles',
  templateUrl: './sms-bundles.component.html',
  styleUrls: ['./sms-bundles.component.scss', '../../../theme/scss/_sms-bundles.scss'],
})
export class SMSBundlesComponent implements OnInit{
  public ASSETS_PATH: string = config.ASSETS;
  tooltip_path: any = this.ASSETS_PATH + '/images/tooltip.svg';
  tab_state: any = [true, false, false, false, false];
  currentTab: any = 0;
  bundleArray: any = config.bunData;
  smsbundleArray: any = [];
  lastClicked: any = -1;
  @Input() mobile : any;
  @Input() bundleList: any;
  constructor(private _bundleSelect: BundleSelectionService) {}
  ngOnInit(): void {
    if (this.bundleList && this.bundleList[1].results.length > 0) {
      if (this.bundleList && this.bundleList[1]) {
         this.smsbundleArray = this.bundleList[1].results;
      }
    }
    this._bundleSelect.globalBundleEvent.subscribe( res => {
      if (res.com_type !== this._bundleSelect.SMS) {
        if (this.lastClicked > -1 ) {
          this.smsbundleArray[this.lastClicked].check = false;
          this.lastClicked = -1;
        }
      }
    });
  }
  showTip() {

  }
  changeTab(id: any) {
    this.tab_state[this.currentTab] = false;
    this.tab_state[id] = true;
    this.currentTab = id;
  }
  select_bundle(idx) {
    if (this.lastClicked > -1 && idx === this.lastClicked && this.smsbundleArray[idx].check) {
      this.smsbundleArray[this.lastClicked].check = false;
      this.lastClicked = -1;
      this._bundleSelect.setBundleFlag(false);
    } else {
      if (this.lastClicked > -1) {
        this.smsbundleArray[this.lastClicked].check = false;
      }
      this.smsbundleArray[idx].check = true;
      this.lastClicked = idx;
      const bundleInfo = this.smsbundleArray[idx];
      bundleInfo.com_type = this._bundleSelect.SMS;
      this._bundleSelect.changeBundle(bundleInfo);
    }
  }

}


