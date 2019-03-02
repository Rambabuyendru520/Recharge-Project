import { Component, OnInit } from '@angular/core';
import { BundleSelectionService } from '../theme/services';
@Component({
  selector: 'com-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {
  fallout: any = 0;
  constructor(private _bundleSelect: BundleSelectionService) {}
  ngOnInit() {
    this._bundleSelect.falloutEvent.subscribe(res => {
      this.fallout = res;
    });
  }
}
