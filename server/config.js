const IP = 'www.mtn.co.za';
const CONNECTION = 'https';
const PORT = 8443;
const MONGODB_HOST = 'localhost';
const DIR_PATH  = '/home/dasari_s_sa/Recharges_Logs/';

module.exports = {
    ROOT_PATH: '/recharge',
    PLUGIN_URL: '/recharge/api',
    CONNECTION: CONNECTION,
    IP: IP,
    PORT: PORT,
    RECHARGES_PATH: DIR_PATH,
    WHITELISTED_HOSTS: ['10.206.3.39:4232', 'localhost:4200'],
    MSISDN_LEGNTH: 9,
    COUNTRY_CODE: 27,
    CERT_NAME: '71545687_mtn.co.za',
    SOA_URL: 'https://soadigesf.mtn.co.za:20260/',
    ATG_REST_URL: 'https://atgcom.mtn.co.za/rest/bean/za/co/mtn/store/service/v1/MTNVasService/',
    ATG_REST_URL_V2: 'https://atgcom.mtn.co.za/rest/bean/za/co/mtn/store/service/v2/MTNVasService/',
    ATG_REST_AUTH: 'Y29tdml2YXBvcnRhbDpjb212aXZhcG9ydGFsMTIz',
    ATG_SOURCE_SYS: 'Online Store',
    REST_AUTH_SOA: 'U1ZDX01ZTVROUE9SVEFMX1NPQV9JTlZPS0U6U1ZDX01ZTVROUE9SVEFMX1NPQV9JTlZPS0U=',
    ATG_REST_CLASS_TYPE : 'za.co.mtn.store.service.v1.bean.MTNVasDataRequestBean',
    REST_ENV_SOA: 'SIT1',
    AUTH_KEY: 'SEA_Recharges',
    AUTH_RULE: '_MTN is the Best',
    MONGODB_URL : 'mongodb://'+ MONGODB_HOST +':27017/',
    API_TIMEOUT: 10000,
    PAYMENT : {
        SOA_SYSTEM_ID: 'ATG',
        SOA_FUNCTION_ID: 'Prov',
        PAYGATE_ID: 28741013574,
        OPCO_CURR: 'ZAR',
        OPCO_LOCALE: 'en-za',
        PAYGATE_KEY : 'bq5mmPXsGtoX',
        COUNTRY: 'ZAF',
        PAYMENT_RETRIES: 3,
        PAYMENT_RETRY_PERIOD: 15,
        EPPIX_RETRIES: 3,
        EPPIX_RETRY_PERIOD: 15,
        DB_NAME: 'paymentgateway',
        PAYMENT_OPEN_TABLE: 'payment_open',
        PAYMENT_CLOSE_TABLE: 'payment_close',
        PROMISE_OPEN_TABLE: 'promise_open',
        PROMISE_CLOSE_TABLE: 'promise_close',
        MAIL_USERNAME: '',
        MAIL_PASSWORD: '',
        APP_NAME: 'RECHARGES',
        APP_GROUP: '',
        MAIL_CC: 'sai.rohit@mahindracomviva.com',
        NOTIFY_URL: 'https://soadigesfweb.mtn.co.za:5443/PayGateRecievePaymentCallbackService/v1/PayGateReceivePaymentResponse',
        NOTIFY_URL1: 'https://esfweb.mtn.co.za:9443/esf_connectorv1/application/payGate/v1/PayGateReceivePaymentResponseV1',
        CALLBACK_URL: CONNECTION + '://' + IP  + '/recharge/api/paymentCallback',
        RETURN_URL : CONNECTION + '://' + IP  + '/recharge/api/paymentReturn',
        WEBAXN_URL: 'https://' + '1app.mtn.co.za'+'/webaxn/plugin?plugin=',
        PAYGATE_URL: 'https://fipp.paygate.co.za/payweb3/process.trans',
        MAIL_SUCCESS_MESSAGE : 'Your payment with Paygate was successful.<br/>Please refer to the e-mail sent to you.',
        MAIL_FAILURE_MESSAGE : 'Your payment with Paygate was unsuccessful.<br/>Please refer to the e-mail sent to you or contact us at customercare@mtn.com'
    }
};

