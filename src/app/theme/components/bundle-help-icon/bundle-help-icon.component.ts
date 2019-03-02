import { Component, Input, Output, OnInit, OnChanges, EventEmitter} from '@angular/core';
import {config } from '../../../config/config';
import { Router } from '@angular/router';
@Component({
  selector: 'com-help-bundle-icon',
  templateUrl: './bundle-help-icon.component.html',
  styleUrls: ['./bundle-help-icon.component.scss', '../../scss/_bundle-help-icon.scss'],
})
export class BundleHelpIconComponent implements OnInit, OnChanges {
  @Input() name: any;
  @Input() icon: any;
  @Input() disabled: boolean;
  @Input() soon_text: any = 'Coming online soon';
  @Input() clicked: boolean;
  @Input() color: string;
  @Input() desc: any;
  @Input() buttonname: any;
  @Output() navigate_name = new EventEmitter();
  cor = 'green';
  icon_path: any;
  constructor(private _router: Router) {}
  ngOnInit() {
    this.icon_path = config.ASSETS + '/images/' + this.icon + '.svg';
  }
  ngOnChanges() {
    // if (!this.disabled && this.clicked) {
    //   this.icon_path = config.ASSETS + '/images/' + this.icon + '_selected.svg';
    // } else if (!this.disabled && !this.clicked) {
    //   this.icon_path = config.ASSETS + '/images/' + this.icon + '.svg';
    // }
  }
  navigateHelp(icon: string) {
    this.navigate_name.emit(icon);
  }
}
