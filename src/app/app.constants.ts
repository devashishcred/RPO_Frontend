declare const process: any
export const environment = {
  production: false,
  // API_URL:'http://54.163.33.126/'
  //API_URL: 'http://rpo.credencys.net:8091/'
};
// export const API_URL = process.env.ENV === 'production' ? 'http://rpoappbackuat.azurewebsites.net/' : 'http://rpoback.azurewebsites.net/' //OLD Azure
// export const API_URL = process.env.ENV === 'production' ? 'https://snapcor.com:8091/' : 'http://192.168.1.20:8085/' // PROD-DEV
// export const API_URL = 'http://44.193.122.73:801/' // DEV
// export const API_URL = 'https://rpo.snapcor.com:8091/' // PROD-DEV
export const API_URL = 'https://rpo.credencys.net:8091/'
