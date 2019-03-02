import { Component,Input, OnInit } from '@angular/core';
import { config } from '../../../config';

@Component({
  selector: 'com-social-bundles',
  templateUrl: './social-bundles.component.html',
  styleUrls: ['./social-bundles.component.scss', '../../../theme/scss/_social-bundles.scss'],
})
export class SocialBundlesComponent implements OnInit{
  public ASSETS_PATH: string = config.ASSETS;
  tooltip_path: any = this.ASSETS_PATH + '/images/tooltip.svg';
  tab_state: any = [true, false, false, false, false];
  currentTab: any = 0;
  lastClick: any;
  bundleArray: any = config.bunData;
  socialbundleArray: any = config.bunSocial;
  lastClickedbundle: any = -1;
  bundlename: any;
  bundlecolor: any;
  @Input() mobile : any;
  ngOnInit() {
    this.bundlename = this.socialbundleArray.results[0].name;
    this.lastClick = 0;
    this.socialbundleArray.results[0].click = true;
    this.bundlecolor = this.socialbundleArray.results[0].color;
  }
  showTip() {

  }
  changeTab(id: any) {
    this.tab_state[this.currentTab] = false;
    this.tab_state[id] = true;
    this.currentTab = id;
  }
  select_bundle(idx){
    if(this.lastClickedbundle>-1){
      this.bundleArray.results[this.lastClickedbundle].check = false;
    }
    this.bundleArray.results[idx].check = true;
	  this.lastClickedbundle = idx;
  }
  toggleIcon(idx: any, disable:  any) {
    if (!disable) {
      if (this.lastClick !== -1) {
        this.socialbundleArray.results[this.lastClick].click = false;
      }
      this.socialbundleArray.results[idx].click = true;
      this.lastClick = idx;
      this.bundlename = this.socialbundleArray.results[idx].name;
      this.bundlecolor = this.socialbundleArray.results[idx].color;
    }


  }


}


