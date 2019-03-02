import { Component, ViewEncapsulation, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { config } from '../../../config';
import { BundleSelectionService } from '../../services';
@Component({
  selector: 'com-airtime-input',
  templateUrl: './airtime-input.component.html',
  styleUrls: ['../../scss/_airtime-input.scss', './airtime-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: AirtimeInputComponent,
    multi: true
  }],
  encapsulation: ViewEncapsulation.None
})
export class AirtimeInputComponent implements ControlValueAccessor, OnInit {

  @Input() type: string;
  @Input() label: string;
  @Input() placeholder = '';
  @Input()  _value: any;
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
  public min_input: any = config.MIN_AIRTIME_INPUT;
  public max_input: any = config.MAX_AIRTIME_INPUT;
  public hide_clear_box = true;
  public wrapper_class = '';
  public errormsg = '';
  public onChange: (_: any ) => {};
  public onTouch: () => {};
  totalDigits: any = -1;
  decimalPlaces: any = 0;
  decimalEnable = false;
  primary_color: any = '#ffcb05';
  error_color: any = '#ee4a00';
  constructor(private _bundleSelect: BundleSelectionService) { }
  get value(): any {
    return this._value;
  }
  set value(v: any){
    if (v !== this._value) {
      this._value = v;
      this.onChange(this._value);
    }
  }
  ngOnInit() {
    document.getElementById('r-text-div').style.backgroundColor = this.primary_color;
    const input = document.getElementById('airtime-input-field') as HTMLInputElement;
    input.focus();
    input.addEventListener('keydown', (event) => {
      if (event.which !== 9 && event.which !== 8 && event.which !== 0 && event.which < 48
        || event.which > 57 && event.which !== 190 && event.which < 96 || event.which > 105) {
            event.preventDefault();
      } else {
        if (input.value.length >= 7 && event.which !== 8) {
          event.preventDefault();
        }
        if (input.value.length === 0) {
          if (event.which === 48) {
            event.preventDefault();
          }
        }
        this.replaceTextRecharge('airtime-input-field', event);
      }
    });
  }
  replaceTextRecharge(id, event) {
    const input_id = document.getElementById(id) as HTMLInputElement;
    const value = input_id.value;
    let valueReplace: any = value.replace(',', '.');
    const str = this.isNumeric(valueReplace);
    if (str === true) {
      const replaceValue = valueReplace;
      valueReplace = parseFloat(valueReplace);
      let valueFixed = valueReplace;
      if ((replaceValue.charAt(replaceValue.length - 2) === '.')) {
        valueFixed = valueFixed.toFixed(1);
        input_id.value = valueFixed;
      } else if ((replaceValue.includes('.')) && (replaceValue.charAt(replaceValue.length - 3) === '.')) {
        valueFixed = valueFixed.toFixed(1);
        input_id.value = valueFixed;
      } else if ((replaceValue.includes('.')) && (replaceValue.charAt(replaceValue.length - 4) === '.')) {
        valueFixed = valueFixed.toFixed(1);
        input_id.value = valueFixed;
      } else if (replaceValue.includes('.')) {
        valueFixed = valueFixed.toFixed(1);
        input_id.value = valueFixed;
      } else {
        if (!input_id.value.includes('.') && input_id.value.length < 7 || event.which === 8 || event.which === 190) {
          const dec = this.truncateTwoPointDec(valueFixed);
          input_id.value = dec.toString();
        } else {
          event.preventDefault();
        }
      }
    } else {
      input_id.value = valueReplace;
    }
    // changedQuantity(id.charAt((id.length - 1)));
  }
  truncateTwoPointDec(num) {
    const truncated = this.truncateDecimals(num * 100) / 100;
    return truncated;
  }
  truncateDecimals(number) {
    return Math[number < 0 ? 'ceil' : 'floor'](number);
  }
  isNumeric(input) {
    const number = /^\-{0,1}(?:[0-9]+){0,1}(?:\.[0-9]+){0,1}$/i;
    const regex = RegExp(number);
    return regex.test(input) && input.length > 0;
  }
  renderChange(value): void {
    this._value = value;
    this.errormsg = '';
    this.wrapper_class = '';
    document.getElementById('r-text-div').style.backgroundColor = this.primary_color;
    if (this._value < this.min_input) {
      this._bundleSelect.setBundleFlag(false);
      this.errormsg = 'Please enter a minimum value of ' + config.CURRENCY + config.MIN_AIRTIME_INPUT;
      this.wrapper_class = 'wrapper-error';
      document.getElementById('r-text-div').style.backgroundColor = this.error_color;
    } else if (this._value > this.max_input) {
      this._bundleSelect.setBundleFlag(false);
      this.errormsg = 'The amount you enter cannot be more than ' + config.CURRENCY + config.MAX_AIRTIME_INPUT;
      this.wrapper_class = 'wrapper-error';
      document.getElementById('r-text-div').style.backgroundColor = this.error_color;
    } else {
      this._bundleSelect.changeBundle({cost: value, com_type: this._bundleSelect.AIRTIME});
    }
    this.hide_clear_box = this._value === '' ? true : false;
  }
  clearField() {
    this._value = '';
    this.hide_clear_box = true;
  }
  onBlur() {
    this.wrapper_class = this._value === '' ? '' : '';
    if (this.errormsg !== '') {
    this.wrapper_class = 'wrapper-error';
   };
    this.hide_clear_box = true;
  }
  onFocus() {
    // this.wrapper_class = 'wrapper-focus';
    this.hide_clear_box = this._value === '' ? true : false;
  }
  writeValue(value: any): void {
    this._value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  isInt(n) {
    return Number(n) === n && n % 1 === 0;
  }
  isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
  }
}
