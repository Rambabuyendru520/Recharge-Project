import { Injectable } from '@angular/core';
import {config } from '../../../config';

@Injectable()
export class CommonService {
    ifMobile() {
        const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        // if (width < config.MOBILE_SCREEN_WIDTH && (window.matchMedia("(orientation: landscape)").matches)) {
        if (width < config.MOBILE_SCREEN_WIDTH && height < config.MOBILE_SCREEN_HEIGHT && width < height) { //Portrait
            return true;
        } else if (height < config.MOBILE_SCREEN_WIDTH  && width < config.MOBILE_SCREEN_HEIGHT && width > height) { //Landscape
            return true;
        } else {
            return false;
        }
    }
    ifOrientationChange() {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    if (width < config.MOBILE_SCREEN_WIDTH && height < config.MOBILE_SCREEN_HEIGHT && width < height) { //Portrait
        return true;
    } else if (height < config.MOBILE_SCREEN_WIDTH  && width < config.MOBILE_SCREEN_HEIGHT && width > height) { //Landscape
        return true;
    } else {
        return false;
    }
}
}
