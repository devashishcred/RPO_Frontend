export interface Notification {
  id: number,
  notificationMessage: string,
  notificationDate: Date,
  idUserNotified: number,
  isRead: Boolean,
  userNotified: string,
  isView: boolean,
  redirectionUrl:string
}