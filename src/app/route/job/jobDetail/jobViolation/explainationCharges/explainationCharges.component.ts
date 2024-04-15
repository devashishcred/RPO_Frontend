import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { cloneDeep, identity, pickBy, intersectionBy } from 'lodash';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Message } from "../../../../../app.messages";
import { isIE } from '../../../../../utils/utils';
import { JobViolationServices } from '../jobViolation.service';
import { Violation, ExplanationOfCharges } from '../violation';
import * as moment from 'moment';
import { constantValues } from '../../../../../app.constantValues';
declare const $: any

/**
* This component contains all function that are used in Form Explaination Charges
* @class FormExplainationCharges
*/
@Component({
  selector: 'add-charges',
  templateUrl: './explainationCharges.component.html',
})
export class FormExplainationCharges {

  @Input() violation: any
  @Input() modalRef: BsModalRef
  @Input() isFromDetail: any
  @Input() deleteCharges: Function
  constructor() { }

  /**
  * This method will be called once only when module is call for first time
  * @method ngOnInit
  */
  ngOnInit() {

  }

  /**
   * This method check given data is decimal or not
   * @method isDecimal
   * @param {any} evt event object
   */
  isDecimal(evt: any) {
    //getting key code of pressed key
    var keycode = (evt.which) ? evt.which : evt.keyCode;
    //comparing pressed keycodes
    if (!(keycode == 8 || keycode == 46) && (keycode < 48 || keycode > 57)) {
      return false;
    }
    else {
      var parts = evt.srcElement.value.split('.');
      if (parts.length > 1 && keycode == 46)
        return false;
      return true;
    }
  }
}