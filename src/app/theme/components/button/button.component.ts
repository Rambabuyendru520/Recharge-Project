import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { icons, type } from '../config';
@Component({
  selector: 'com-button',
  templateUrl: './button.component.html',
  styleUrls: ['../../scss/_button.scss'],
})
export class ButtonComponent implements OnInit {
  @Input() type: string;
  @Input() label: string;
  @Input() icon: string;
  @Input() disabled: boolean;

  @Output() onClick: EventEmitter<any> = new EventEmitter();
  public fa_icon: string;
  public btn_class: string;
  constructor() { }

  ngOnInit() {
    this.fa_icon = icons[this.icon];
    this.btn_class = this.type;
  }
  onClickFunc() {
    if (!this.disabled) {
      this.onClick.emit();
    }
  }
}
