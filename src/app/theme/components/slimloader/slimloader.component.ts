import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import * as slimloader from '../../../actions/slimloader';
import * as fromRoot from '../../../reducers';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'com-slimloader',
  templateUrl: './slimloader.component.html',
  styleUrls: ['./slimloader.component.scss'],
})
export class SlimloaderComponent implements OnInit {
  showSlimloader$: Observable<boolean>;
  constructor(private _store: Store<fromRoot.State>) {
    this.showSlimloader$ = this._store.select(fromRoot.getShowSlimloader);
  }

  ngOnInit() {
    this.showSlimloader$ = this._store.select(fromRoot.getShowSlimloader);
  }

}
