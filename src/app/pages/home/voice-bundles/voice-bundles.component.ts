import { Component, Input } from '@angular/core';
import { config } from '../../../config';

@Component({
  selector: 'com-voice-bundles',
  templateUrl: './voice-bundles.component.html',
  styleUrls: ['./voice-bundles.component.scss', '../../../theme/scss/_voice-bundles.scss'],
})
export class VoiceBundlesComponent {
  public ASSETS_PATH: string = config.ASSETS;
  tooltip_path: any = this.ASSETS_PATH + '/images/tooltip.svg';
  tab_state: any = [true, false, false, false, false];
  currentTab: any = 0;
  bundleArray: any = config.bunData;
  lastClicked: any = -1;
  @Input() mobile : any;
  showTip() {

  }
  changeTab(id: any) {
    this.tab_state[this.currentTab] = false;
    this.tab_state[id] = true;
    this.currentTab = id;
  }
  select_bundle(idx){
    if (this.lastClicked > -1) {
      this.bundleArray.results[this.lastClicked].check = false;
    }
    this.bundleArray.results[idx].check = true;
	  this.lastClicked = idx;
  }
}


