/* import { Injectable } from '@angular/core';

function _window() {
    // return the global native browser window object
    return window;
}

@Injectable()
export class GoogleAnalyticsService {
    dataLayer = this.nativeWindow.dataLayer;
    get nativeWindow(): any{
        return _window();
    }
    sendData(category, action, label) {
        this.dataLayer.push({
            category: category,
            action: action,
            label: label
        });
    }
}
 */

import { Injectable } from '@angular/core';

function _window() {
    // return the global native browser window object
    return window;
}
@Injectable()

export class GoogleAnalyticsService {
    get nativeWindow(): any{
        return _window();
    }
}
