import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import {  NG_VALUE_ACCESSOR } from '@angular/forms';
import { BundleSelectionService } from '../../services';

@Component({
  selector: 'com-msisdn-input',
  templateUrl: './msisdn-input.component.html',
  styleUrls: ['../../scss/_input.scss', './msisdn-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: MSISDNInputComponent,
    multi: true
  }],
  encapsulation: ViewEncapsulation.None
})
export class MSISDNInputComponent implements OnInit {

  @Input() disabled;
  @Input()
  set inactive(inactive: boolean){
    if (inactive) {
      this.wrapper_class = 'wrapper-disable';
    }
  }
  @Input()
  set error(error: string){
    if (error !== '') {
      this.wrapper_class = 'wrapper-error';
      this.errormsg = error;
    } else {
      this.errormsg = '';
    }
  };

  public hide_clear_box = true;
  public _value: any;
  public wrapper_class = 'wrapper-blur';
  public errormsg = '';
  public onChange: (_: any ) => {};
  public onTouch: () => {};
  twoEnable = false;
  constructor(private _bundleSelect: BundleSelectionService) { }
  ngOnInit() {
    const input = document.getElementById('msisdn-input') as HTMLInputElement;
    // input.disabled = true;
    input.addEventListener('keydown', (event) => {
      if (input.value.length === 0) {
        this.twoEnable = false;
      }
      if (event.which !== 37 && event.which !== 39 && event.which !== 8 && event.which !== 0
        && event.which < 48 || event.which > 57 && event.which < 96 || event.which > 105) {
        event.preventDefault();
      } else {
        if (input.value.length > 9 && input.value[0] === '0') {
            if (event.which >= 48 && event.which <= 57 || event.which >= 96 && event.which <= 105) {
              event.preventDefault();
          }
        } else if (input.value.length > 10 && input.value[0] === '2' && input.value[1] === '7') {
            if (event.which >= 48 && event.which <= 57 || event.which >= 96 && event.which <= 105) {
              event.preventDefault();
          }
        } else {
          if (event.which >= 48 && event.which <= 57 || event.which >= 96 && event.which <= 105) {
            if (input.value.length === 0) {
              if (event.which === 48 || event.which === 96) {
                input.maxLength = 10;
                input.min = '99999999';
              } else if (event.which === 50 || event.which === 98) {
                this.twoEnable = true;
                input.min = '9999999999';
              } else {
                event.preventDefault();
              }
            } else if (input.value.length === 1) {
              if (this.twoEnable) {
                if (event.which === 55 || event.which === 103) {
                  input.maxLength = 11;
                } else {
                  if (event.which >= 48 && event.which <= 57 || event.which >= 96 && event.which <= 105) {
                    event.preventDefault();
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  get value(): any {
    return this._value;
  }
  @Input()
  set value(v: any){
    if (v !== this._value) {
      this._value = v;
      // this.onChange(this._value);
    }
  }
  changeInput() {
    this._bundleSelect.changeInput();
    const input = document.getElementById('msisdn-input') as HTMLInputElement;
    if (input.value.length > 1) {
      if (input.value[0] === '2' || input.value[1] === '7') {
        input.maxLength = 11;
      } else {
        input.maxLength = 10;
      }
    }
  }
}
