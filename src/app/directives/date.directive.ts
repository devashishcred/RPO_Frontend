import {
    Directive,
    AfterViewInit,
    ElementRef,
    NgZone,
    EventEmitter,
    Output,
    OnDestroy,
  } from '@angular/core';
import { Console } from 'console';
  
  declare var $: any;
  
  @Directive({
    selector: '[appDatepicker]',
    exportAs: 'datepicker',
  })
  export class DatepickerDirective implements AfterViewInit, OnDestroy {
    mydate: any;
    @Output() dateEventEmitter = new EventEmitter();
  
    constructor(private el: ElementRef, private ngZone: NgZone) {}
  
    ngAfterViewInit(): void {
      this.ngZone.runOutsideAngular(() => {
        var currentDate = new Date();

        $(this.el.nativeElement).datepicker({
          onSelect: (date,inst) => {
            console.log(inst)
            this.ngZone.run(() => {
              this.setDate(date);
            });
          },
        });
        $(this.el.nativeElement).datepicker("setDate", currentDate);
      });
    }
  
    setDate(date) {
      this.mydate = date;
      this.dateEventEmitter.emit(this.mydate);
    }

    ngOnDestroy(){
  console.log('check');
  $(this.el.nativeElement).datepicker('destroy');
    }
  }