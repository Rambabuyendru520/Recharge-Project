import { Component, Input, OnInit, OnChanges} from '@angular/core';
import {config } from '../../../config/config';

@Component({
  selector: 'com-bundle-icon',
  templateUrl: './bundle-icon.component.html',
  styleUrls: ['./bundle-icon.component.scss', '../../scss/_bundle-icon.scss'],
})
export class BundleIconComponent implements OnInit, OnChanges{
  @Input() name: any;
  @Input() icon: any;
  @Input() disabled: boolean;
  @Input() soon_text: any = 'Coming online soon';
  @Input() clicked: boolean;
  @Input() color: string;
  icon_path: any;
  icon_path_selected: any;
  @Input() icon_selected: any;
  ngOnInit() {
    if (screen.width < config.MOBILE_SCREEN_WIDTH) {
      this.icon_path = config.ASSETS + '/images/' + this.icon + '_sm.svg';
      this.icon_path_selected = config.ASSETS + '/images/' + this.icon + '_selected_sm.svg';
    } else {
      this.icon_path = config.ASSETS + '/images/' + this.icon + '_lg.svg';
      this.icon_path_selected = config.ASSETS + '/images/' + this.icon + '_selected_lg.svg';
    }
  }
  ngOnChanges() {
  }
}
