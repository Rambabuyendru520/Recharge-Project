import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, CheckboxControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'com-input',
  templateUrl: './input.component.html',
  styleUrls: ['../../scss/_input.scss', './input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: InputComponent,
    multi: true
  }],
  encapsulation: ViewEncapsulation.None
})
export class InputComponent implements ControlValueAccessor, OnInit {

  @Input() type: string;
  @Input() label: string;
  @Input() minLength: number;
  @Input() maxLength: number;
  @Input() placeholder = '';
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

  constructor() { }
  ngOnInit() {
    const input = document.getElementById('email-input-field') as HTMLInputElement;
    // input.pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  }
  get value(): any {
    return this._value;
  }
  set value(v: any){
    if (v !== this._value) {
      this._value = v;
      this.onChange(this._value);
    }
  }
  renderChange(value): void {
    this._value = value;
    this.onChange(this._value);
    this.hide_clear_box = this._value === '' ? true : false;
    const input = document.getElementById('email-input-field') as HTMLInputElement;
    if (input.validity.valid === false) {
      this.errormsg = 'Please enter a valid email address';
    } else {
      this.errormsg = '';
    }
  }
  clearField() {
    this._value = '';
    this.onChange(this._value);
    this.hide_clear_box = true;
  }
  onBlur() {
    this.wrapper_class = this._value === '' ? 'wrapper-blur' : 'wrapper-filled';
    if (this.errormsg !== '') { this.wrapper_class = 'wrapper-error'; };
    this.hide_clear_box = true;
  }
  onFocus() {
    this.wrapper_class = 'wrapper-focus';
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

}
