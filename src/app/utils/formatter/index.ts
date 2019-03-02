import { config } from '../../config';
export const format = {
  msisdn: (msisdn: string) => {
    if (msisdn[0] === '0') {
      return config.COUNTRY_CODE + msisdn.trim().slice(1);
    } else if (msisdn[0] === '2' && msisdn[1] === '7') {
      return config.COUNTRY_CODE + msisdn.trim().slice(2);
    } else {
      return config.COUNTRY_CODE + msisdn;
    }
  }
};

