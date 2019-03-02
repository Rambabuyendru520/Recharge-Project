import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class BundleSelectionService {
  public DATA = 'DATA';
  public SMS = 'SMS';
  public SPECIAL = 'SPEICAL';
  public VOICE = 'VOICE';
  public SOCIAL = 'SOCIAL';
  public AIRTIME = 'AIRTIME';
  public FIBRE = 'FIBRE';
  bundleType = ['DATA', 'AIRTIME', 'SMS', 'FIBRE'];
  private finalBundle: any;
  private isBundleSelected: any = false;
  globalBundleEvent = new EventEmitter();
  bundleFlagEvent = new EventEmitter();
  inputChangeEvent = new EventEmitter();
  falloutEvent = new EventEmitter();
  toggleIconEvent = new EventEmitter();
  public changeBundle(bundleInfo: any) {
      this.isBundleSelected = true;
      this.finalBundle = bundleInfo;
      this.globalBundleEvent.emit(this.finalBundle);
      this.bundleFlagEvent.emit(true);
      this.toggleIcon(this.bundleType.indexOf(bundleInfo['com_type']));
      if (bundleInfo['com_type'] !== 'AIRTIME') {
        document.getElementById('footerscroll').scrollIntoView({behavior: 'smooth', block: 'start', inline: 'start'});
      }
  }
  public setBundleFlag(flag) {
    this.isBundleSelected = flag;
    this.finalBundle = null;
    this.bundleFlagEvent.emit(flag);
    this.unSetInputFocus();
  }
  public getBundleFlag() {
    return this.isBundleSelected;
  }
  public getFinalBundle() {
    if (!this.isBundleSelected) {
      return false;
    } else {
      return this.finalBundle;
    }
  }
  public setInputFocus() {
    const input = document.getElementById('msisdn-input') as HTMLInputElement;
    if (input) {
      input.disabled = false;
      if (this.finalBundle.vas_code) {
        input.focus();
        input.select();
      }
    }
  }
  public unSetInputFocus() {
    const input = document.getElementById('msisdn-input') as HTMLInputElement;
    input.disabled = true;
  }
  public changeInput() {
    const input = document.getElementById('msisdn-input') as HTMLInputElement;
    this.inputChangeEvent.emit({ value: input.value, valid: input.checkValidity()});
  }
  public setFallout(idx) {
    this.falloutEvent.emit(idx);
  }
  public toggleIcon(idx) {
    this.toggleIconEvent.emit(idx);
  }
}
