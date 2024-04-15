import { Menu } from "./menu";

export interface User {
  name: string,
  menu?: Menu[],
  grants?: any,
  employeeId?:any,
  notificationCount?:string
}