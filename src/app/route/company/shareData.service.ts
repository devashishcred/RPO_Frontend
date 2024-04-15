import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SharedCompanyDataService {

  private comDataSource = new BehaviorSubject<string>("default message");
  currentComData = this.comDataSource.asObservable();

  constructor() { }

  changeComData(comData: any) {
    this.comDataSource.next(comData)
  }

}