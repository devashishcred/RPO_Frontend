import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  constructor(private _sanitizer: DomSanitizer) { }

  // transform(list: any, searchText: string): any {
  //   console.log(searchText)

  //   if (!list) { return []; }
  //   if (!searchText) { return list; }

  //   const value = list.replace(
  //     searchText, `<span style='background-color:yellow'>${searchText}</span>` );
  //   console.log('value', value);

  //   return this._sanitizer.bypassSecurityTrustHtml(value);
  // }
  transform(value: any, args: any): any {
    // console.log(value)
    // console.log(args)
    if(value == null) {
      return
    }
    if (!args) {
      return value;
    }
    // Match in a case insensitive maneer
    const re = new RegExp(args, 'gi');
    const match = value.match(re);

    // If there's no match, just return the original value.
    if (!match) {
      return value;
    }

    const replacedValue = value.replace(re, "<span style='background-color:yellow'>" + match[0] + "</span>")
    return this._sanitizer.bypassSecurityTrustHtml(replacedValue)
  }
}
