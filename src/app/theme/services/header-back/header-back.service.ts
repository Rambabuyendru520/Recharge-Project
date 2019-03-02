import { Injectable, EventEmitter, Output } from '@angular/core';

@Injectable()
export class HeaderBackService {
  @Output() setlink = new EventEmitter();
  setLink() {
    this.setlink.emit();
  }
}
