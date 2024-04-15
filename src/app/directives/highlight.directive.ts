import { Directive, HostBinding, Input, SimpleChanges } from "@angular/core";

@Directive({selector: '[appHighlight]'})
export class HighlightDirective {
@Input() search:any;
@Input('elemValue') elemValue: any;
@HostBinding('style.backgroundColor') bgColor: string = '';
constructor() {}
setBackgroundColor(search){
if(search){
let value = this.elemValue;
let newValue=
isNaN(value)?value.toString().toUpperCase():value.toString();
let newSearch=
isNaN(search) ? search.toString().toUpperCase():search.toString();
this.bgColor = newValue.indexOf(newSearch) > -1 ? 'yellow' : 'transparent';
}
else{
this.bgColor = 'transparent';
}
}
ngOnChanges(change:SimpleChanges){
if(change.search){
this.setBackgroundColor(change.search?.currentValue);
}}
}