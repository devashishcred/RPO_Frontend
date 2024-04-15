import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  
  getCustomerLoggedIn() {
    return localStorage.getItem('isCustomerLoggedIn') === 'true';
  }
  
  getCustomerDetails() {
    return JSON.parse(localStorage.getItem("userinfo"));
  }

}
