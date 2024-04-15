import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[c1]'
})
export class ClickOutsideDirective {
  @Output() public clickOutside = new EventEmitter();
  constructor(private _elementRef : ElementRef) { }

  @HostListener('document:click', ['$event'])
  public onClick(event:any) {
    event.stopPropagation();     
    const isClickedInside = this._elementRef.nativeElement.contains(event.target);
    if (!isClickedInside) {
        this.clickOutside.emit(event.target);
    }
  }
}