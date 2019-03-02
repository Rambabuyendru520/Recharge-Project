import * as utils from './utils';

export const config = {
    ASSETS: '/recharge/appassets',
    TIME_OUT : 9000,
    AUTH_KEY: 'SEA_Recharges',
    // PLUGIN_URL : 'https://10.245.17.170:8443/recharge/api/',
    PLUGIN_URL : 'https://www.mtn.co.za/recharge/api/',
    BRIGHT_SIDE_LINK: 'https://www.mtn.co.za',
    MIN_MSISDN_LENGTH: 9,
    MSISDN_LENGTH: 11,
    COUNTRY_CODE: 27,
    CURRENCY: 'R',
    MIN_AIRTIME_INPUT: 5,
    MAX_AIRTIME_INPUT: 1000,
    MOBILE_SCREEN_HEIGHT: 900,
    MOBILE_SCREEN_WIDTH: 767,
    bunCon: utils.bunArr,
    bunData: utils.bundleArray,
    bunSocial: utils.socialbunArr,
    bunHelp: utils.helpbunArr,
    TNC: utils.TnC
};
