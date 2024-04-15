import { forwardRef, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, Component } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

const DATE_PICKER_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatePickerComponent),
  multi: true
};

declare var jQuery: any;

@Component({
  selector: 'my-datepicker',
  template: `<input #input type="text">`,
  providers: [DATE_PICKER_VALUE_ACCESSOR]
})
export class DatePickerComponent implements AfterViewInit, ControlValueAccessor {
  private onTouched = () => { };
  private onChange: (value: string) => void = () => { };

  @Input() value = '';

  writeValue(date: string) {
    this.value = date;

    jQuery(this.input.nativeElement).datepicker('setDate', date);
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  @Output() dateChange = new EventEmitter();

  @ViewChild('input') input: ElementRef;

  ngAfterViewInit() {
    jQuery(this.input.nativeElement).datepicker({
      onSelect: (value) => {
        this.value = value;

        this.onChange(value);

        this.onTouched();

        this.dateChange.next(value);
      }
    })
    .datepicker( 'option', 'minDate', new Date(2018, 1 - 1, 4))
    .datepicker('option','maxDate', new Date(2018, 1 - 1, 24))
    .datepicker('setDate', this.value)
  }
}