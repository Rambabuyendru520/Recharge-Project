import { Injectable } from '@angular/core';
import { CanActivate, Router  } from '@angular/router';
import { BundleSelectionService } from '../../theme/services';
@Injectable()

export class CanActivateRouteGuard implements CanActivate {
    constructor(private _router: Router, private _bundleSelect: BundleSelectionService) {}
    canActivate() {
        if (!this._bundleSelect.getFinalBundle()) {
            this._router.navigate(['recharge']);
            return false;
        } else {
            return true;
        }
    }
}

