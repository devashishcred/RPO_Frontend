/**
* This class is used as a UserGroup model
* @class UserGroup
* @constructor 
*/
export interface UserGroup {
    id: number,
    name: string,
    description: string,
    employeePermission: ModuleName
    otherPermission: ModuleName
    jobPermission: ModuleName

}

/**
* This class is used as a ModuleName model
* @class ModuleName
* @constructor 
*/
export interface ModuleName {
    moduleName: string,
    groups: Groups[]
}

/**
* This class is used as a Groups model
* @class Groups
* @constructor 
*/
export interface Groups {
    groupName: string
    permissions: Permissions[]
}

/**
* This class is used as a Permissions model
* @class Permissions
* @constructor 
*/
export interface Permissions {
    id: number,
    name: string,
    displayName: string,
    permissionClass:string
    groupName: string,
    createdBy: number,
    createdByEmployeeName: string,
    createdDate: Date,
    lastModifiedBy: number,
    lastModifiedByEmployeeName: string,
    lastModifiedDate: Date,
    isChecked: Boolean
}



