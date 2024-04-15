import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../app.constants';
import { User } from '../types/user';
import * as _ from 'underscore';


declare var $: any;
/**
* This component contains all function that are used in UserRightServices
* @class UserRightServices
*/
@Injectable()
export class UserRightServices {

    private userAccess: any
    private rights: any = {}
    private allrights: any = []


    /**
    * This method is used to check whether user has rights of given module or not
    * @method checkUserRights
    * @param {any} moduleName moduleName is the name of the module like employee,company,contact etc. 
    */
    checkUserRights(moduleName: any) {
        return moduleName;
    }

    /**
    * This method is used to check whether user has right of specific action based on that action will be shown
    * action like add/edit/view/delete/export
    * @method checkAllowButton
    * @param {any} permissionId permissionId is the id for which the permission is to be checked
    */
    checkAllowButton(permissionId: any) {
        if (localStorage.getItem('allPermissions') && this.allrights && this.allrights.length == 0) {
            let userRights = localStorage.getItem('userRights')
            this.rights = JSON.parse(userRights)
        }


        let result = _.filter(this.rights, function (item: any) {
            return item.id == permissionId;
        });
        if (result && result.length > 0) {
            return 'show'
        } else{
            return 'hide'    
        }
        
    }


}