import { Menu } from "./menu";

export interface ICustomer {
  firstName: string;
  lastName: string;
  companyName: string;
  // street: string;
  address1: string;
  // floor: string;
  address2: string;
  city: string;
  idState: string;
  zipCode: number;
  workPhone: number;
  mobilePhone: number;
  email: string;
  id: number;
  contactImagePath?: string;
  contactImageThumbPath?: any;
}

export interface IChangePassword {
  id: string;
  oldPassword: string;
  newPassword: string;
}

export interface IResetPassword {
  id: number;
  strId: string;
  oldPassword: null;
  newPassword: string;
}

export interface ISignUp {
  email: string;
  loginPassword: string;
  IsActive: boolean;
  IdGroup: number;
  IdContact: number;
  // countinueAgree: boolean;
}


export interface IRequestNewProject {
  ProposalnName: string;
  ProposalAddress: string;
  ProposalDescription: string;
}

export interface Customer {
  name: string,
  menu?: Menu[],
  grants?: any,
  employeeId?: any,
  notificationCount?: string
}