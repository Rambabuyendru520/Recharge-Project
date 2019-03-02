import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import * as slimloader from '../../../actions/slimloader';
@Injectable()
export class SlimloaderService {
  private _selector = 'slimloader';
  private _element: HTMLElement;
  constructor(private _store: Store<fromRoot.State>) {
    this._element = document.getElementById(this._selector);
  }

  start() {
    this._store.dispatch(new slimloader.StartSlimloaderAction);
  }

  complete(delay: number = 0) {
    setTimeout(() => {
    this._store.dispatch(new slimloader.StopSlimloaderAction);
    }, delay);
  }
}
