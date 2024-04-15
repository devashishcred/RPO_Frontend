import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'FilterPipe',
})
export class FilterPipe implements PipeTransform {
    transform(value: any, input: string) {
        if (input) {
            input = input.toLowerCase();
            return value.filter(function (el: any) {
                return (typeof el.firstName != 'undefined' && el.firstName != null && el.firstName.toLowerCase().indexOf(input) > -1) || (typeof el.lastName != 'undefined' && el.lastName != null && el.lastName != null && el.lastName.toLowerCase().indexOf(input) > -1) || typeof el.firstName != 'undefined' && el.firstName != null && typeof el.lastName != 'undefined' && el.lastName != null && (el.firstName.toLowerCase() + " " + el.lastName.toLowerCase()).indexOf(input) > -1;
            })
        }
        return value;
    }
}

import { DomSanitizer } from '@angular/platform-browser';

@Pipe({name: 'safeHtml'})
export class SafeHtml implements PipeTransform {
  constructor(private sanitizer:DomSanitizer){}

  transform(html:any) {
    //return this.sanitizer.bypassSecurityTrustStyle(html);
     return this.sanitizer.bypassSecurityTrustHtml(html);
    // return this.sanitizer.bypassSecurityTrustScript(html);
    // return this.sanitizer.bypassSecurityTrustUrl(html);
    // return this.sanitizer.bypassSecurityTrustResourceUrl(html);
  }
}
