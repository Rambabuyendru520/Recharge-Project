import { Component, Input, OnInit } from '@angular/core';
import { config } from '../../../config';
import { BundleSelectionService } from '../../../theme/services';

@Component({
  selector: 'com-fibre-bundles',
  templateUrl: './fibre-bundles.component.html',
  styleUrls: ['./fibre-bundles.component.scss', '../../../theme/scss/_fibre-bundles.scss'],
})
export class FibreBundlesComponent implements OnInit {
  public ASSETS_PATH: string = config.ASSETS;
  tooltip_path: any = this.ASSETS_PATH + '/images/tooltip.svg';
  tab_state: any = [true, false, false, false, false];
  currentTab: any = 0;
  bundleArray: any = config.bunData;
  fibrebundleArray: any = [];
  lastClicked: any = -1;
  @Input() mobile: any;
  @Input() bundleList: any;
  constructor(private _bundleSelect: BundleSelectionService) {}
  ngOnInit(): void {
    if (this.bundleList && this.bundleList[2] && this.bundleList[2].results.length > 0) {
      if(this.bundleList[2]) {
        this.fibrebundleArray = this.bundleList[2].results;
      }
    }
    this._bundleSelect.globalBundleEvent.subscribe( res => {
      if (res.com_type !== this._bundleSelect.FIBRE) {
        if (this.lastClicked > -1 ) {
          this.fibrebundleArray[this.lastClicked].check = false;
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
    if (this.lastClicked > -1 && idx === this.lastClicked && this.fibrebundleArray[idx].check) {
      this.fibrebundleArray[this.lastClicked].check = false;
      this.lastClicked = -1;
      this._bundleSelect.setBundleFlag(false);
    } else {
      if (this.lastClicked > -1) {
        this.fibrebundleArray[this.lastClicked].check = false;
      }
      this.fibrebundleArray[idx].check = true;
      this.lastClicked = idx;
      const bundleInfo = this.fibrebundleArray[idx];
      bundleInfo.com_type = this._bundleSelect.FIBRE;
      this._bundleSelect.changeBundle(bundleInfo);
    }
  }
}