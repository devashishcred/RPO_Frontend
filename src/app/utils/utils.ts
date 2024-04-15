import { chain, identity, isEqual } from 'lodash';
import * as moment from 'moment';
export const equals = (o1: any, o2: any): boolean => {
  return isEqual(o1, o2) || isEqual(JSON.parse(JSON.stringify(o1)), JSON.parse(JSON.stringify(o2)))
}

export const onlyThisProperty = (obj: any, prop: string): boolean => {
  const keys = chain(obj).pickBy(identity).keys().value()
  return keys.length == 1 && keys[0] == prop
}

function _parseDateFields(obj: any, req?: any, scope?: boolean) {
  let notificationUrl: boolean = false  
  let contactsUrl: boolean = false  
  let HistoryUrl: boolean = false  
  if (!obj)
    return

  for (let p in obj) {
    const v = obj[p]
    // console.log('v',v)
    if (typeof v === 'string' && v.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      if (req || req == 'req.url') {
        return v;
      } else {
        let date = obj[p].split('T');
        let formateddate = moment(date[0]).format('MM/DD/YYYY');
        obj[p] = formateddate;
      }

    } else if (Array.isArray(v)) {
      obj[p].forEach((o: any) => {
        if(o.notificationDate){
          notificationUrl = true;
          let res = 'userNotifications'
          _parseDateFields(o, res);
        }else if(notificationUrl){
          notificationUrl = false;
        }
        if (!notificationUrl && req!= undefined && req.includes('/JobFeeSchedules')) {
          _parseDateFields(o, req);
        } else if(!notificationUrl) {
          _parseDateFields(o);
        }

      })
    } else if (typeof v === 'object') {
      if(req!= undefined && req.includes('/JobHistory')){
        _parseDateFields(obj[p], req);
      }
      if(req!= undefined && req == 'req.url'){
        contactsUrl = true;
        _parseDateFields(obj[p], req);
      } else if(contactsUrl){
        contactsUrl = false;
      }
      if (!contactsUrl && req!= undefined && req.includes('/badgelist')) {
        _parseDateFields(obj[p], req);
      } else if(!contactsUrl) {
        if(req == undefined){
          _parseDateFields(obj[p])
        }else{
          _parseDateFields(obj[p], req);
        }
        
      }
      
    }
  }
}

export const parseDateFields = _parseDateFields

export function arrayBufferToBase64(buffer: any) {
  let binary = ''

  const bytes = new Uint8Array(buffer)

  for (let i = 0, l = bytes.byteLength; i < l; i++)
    binary += String.fromCharCode(bytes[i])

  return window.btoa(binary)
}

const _isIE = navigator.appVersion.toString().indexOf('.NET') > 0 || navigator.appVersion.toString().indexOf('Edge') > 0

export const isIE = _isIE

export const downloadFile = (function () {
  let a: any

  if (!_isIE) {
    a = window.document.createElement('a')
    window.document.body.appendChild(a)
    a.style = 'display: none'
  }

  return function (data: any, type: any, fileName: any) {
    const blob = new Blob([data], {
      type: type
    })

    if (_isIE)
      return window.navigator.msSaveBlob(blob, fileName)

    const url = window.URL.createObjectURL(blob)

    a.href = url
    a.download = fileName
    a.click()

    window.URL.revokeObjectURL(url)
  }
}())

export function convertUTCDateToLocalDate(date: any) {
  var newDate = new Date(date);
  newDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return newDate;
}