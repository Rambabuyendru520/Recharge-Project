import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'com-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit {
  @Input() label;
  @Input() labelHighlight;
  @Input() checked;
  @Input() disabled = false;
  indeterminate = false;
  labelPosition = 'after';
  @Output() primLabelclickEmit = new EventEmitter();
  @Output() secLabelclickEmit = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }
  secLabelClick() {
    this.secLabelclickEmit.emit();
  }
  primLabelClick(event) {
    this.primLabelclickEmit.emit(event.checked);
  }
}
