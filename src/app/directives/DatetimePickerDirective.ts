import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { constantValues } from '../app.constantValues';
declare const $: any
@Directive({
  selector: '[datetime-picker]'
})
export class DatetimePickerDirective implements OnInit, OnDestroy {
  @Input() pastOrFuture: string
  @Input() rangeStartDate: string
  @Input() rangeEndDate: string
  @Input() isDateTime: boolean = false
  @Input() isTime: boolean = false
  @Input() customFormat: boolean = false
  @Input() isTimeWithMeridian: boolean = false
  @Input() keepOpen: boolean = false
  @Input() customMinDate: string
  @Input() idForRangeDate: string
  // @Input() isRequired: boolean = false

  private datetimepicker: any
  private change: boolean = false
  private mask: string
  private format: string
  constructor(
    private el: ElementRef,
    private constantValues: constantValues
  ) {
    this.datetimepicker = $(el.nativeElement)
    this.nodeRemoved = this.nodeRemoved.bind(this)
    this.hide = this.hide.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  ngOnInit() {
    if (this.isDateTime) {
      this.format = this.constantValues.DATETIMEFORMAT
      this.mask = "00/00/0000 00:00 AM"
    } else {
      if (this.isTime) {
        if (this.isTimeWithMeridian) {
          this.format = this.constantValues.TIMEFORMATWITHMERIDIAN
          this.mask = "00:00 AM"
        } else {
          this.format = this.constantValues.TIMEFORMAT
          this.mask = "00:00"
        }

      } else {
        if (this.customFormat) {
          this.format = 'MM/DD/YY'
          this.mask = "00/00/00"
        } else {
          this.format = this.constantValues.DATEFORMAT
          this.mask = "00/00/0000"
        }

      }
    }
    const cfg = {
      format: this.format,
      focusOnShow: false,
      showTodayButton: this.isTime ? false : !!!this.pastOrFuture,
      showClear: this.isTime ? true : false,
      showClose: true,
      useCurrent: this.isTime ? 'day' : false,
      sideBySide: this.isDateTime ? true : false,
      stepping: this.isTime ? (this.isTimeWithMeridian ? 1 : 10) : 1,
      keepInvalid: true,
      ignoreReadonly: this.isTimeWithMeridian ? true : false,
      keepOpen: this.keepOpen ? true : false,
      widgetPositioning:{
        horizontal: 'auto',
        vertical: 'bottom'
    }
      // icons: {
      //   close: 'closeText',
      //   next: '<span class="material-symbols-rounded">arrow_forward_ios</span>',
      //   previousprevious: '<span class="material-symbols-rounded">arrow_back_ios</span>'
      // },
    } as any
    if (this.pastOrFuture == "past")
      cfg.maxDate = moment(0, "HH").subtract(1, 'milliseconds').toDate()
    else if (this.pastOrFuture == "future")
      cfg.minDate = moment(0, "HH").add(1, 'days').toDate()
    else if (this.pastOrFuture == "2daysaftertoday") {
      cfg.minDate = moment(0, "HH").add(2, 'days').toDate()
      cfg.maxDate = moment(cfg.minDate, "HH").add(20, 'days').toDate()
    }
    else if (this.pastOrFuture == "setEndDateForRangePicker") {
      if (typeof this.customMinDate != 'undefined' && this.customMinDate != 'undefined' && this.customMinDate != null && this.customMinDate != '') {
        cfg.minDate = moment(this.customMinDate, "MM/DD/YYYY").add(0, 'days').toDate()
      }
    }


    this.datetimepicker.datetimepicker(cfg).on('dp.change', this.onChange)

    this.datetimepicker.find('input').each((i: number, e: any) => {
      const el = $(e)
      el
        .focus(() => {
        })
        .keydown((ev: Event) => {
          if ((el[0].value.length == 1 || el[0].value == '') && el.hasClass('errorInDate')) {
            el.removeClass('errorInDate')
            el.next('p').remove();
          } else if ((el[0].value.length == 1 || el[0].value == '') && el.hasClass('errorInTime')) {
            el.removeClass('errorInTime')
            el.next('p').remove();
          }
        })
        .blur((ev: any) => {
          if (!this.isDateTime && !this.isTime) {
            const regex = /^((0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](12|13|14|15|16|17|18|19|20)?[0-9]{2})*$/;
            if (el[0].value != '' && !regex.test(el[0].value)) {
              if (!el.hasClass('errorInDate')) {
                el.addClass('errorInDate')
                el.after('<p style="color:red">Date is invalid</p>')
                $('#calenderTable').hide() //PW517 Document Custom Calender
              }
            } else {
              if (regex.test(el[0].value) && el.hasClass('errorInDate')) {
                el.removeClass('errorInDate')
                el.next('p').remove();
              }
            }
          } else {
            if (this.isTime) {
              let timeRegex = /^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/
              if (this.isTimeWithMeridian) {
                timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])\s*([AaPp][Mm])?$/
              }
              if (el[0].value != '' && !timeRegex.test(el[0].value)) {
                if (!el.hasClass('errorInTime')) {
                  el.addClass('errorInTime')
                  el.after('<p style="color:red">Duration is invalid</p>')
                  // if (this.isRequired) {
                  //   el.parents('form').find('.modal-footer.modify-footer').find('.btn.btn-blue').attr("disabled", "disabled")
                  // }
                }
              } else {
                if (timeRegex.test(el[0].value) && el.hasClass('errorInTime')) {
                  el.removeClass('errorInTime')
                  el.next('p').remove();
                  // if (this.isRequired) {
                  //   el.parents('form').find('.modal-footer.modify-footer').find('.btn.btn-blue').removeAttr("disabled", "disabled")
                  // }
                }
              }
            }
          }
        })
        .mask(this.mask, el.attr('placeholder') ? {} : !this.isDateTime ? !this.isTime ? { placeholder: 'MM/DD/YYYY' } : { placeholder: 'HH:MM' } : { placeholder: 'MM/DD/YYYY hh:mm' })
    })

    const $document = $(document)
    $document.on('click', this.hide)
    if (this.datetimepicker.closest('modal-container').length)
      $document.on("DOMNodeRemoved", this.nodeRemoved)
  }
  ngOnDestroy() {
    this.destroy()
  }
  destroy() {
    //$._data(document, 'events')
    $(document)
      .off("DOMNodeRemoved", this.nodeRemoved)
      .off('click', this.hide)

    this.datetimepicker
      .off('dp.change')
      .data('DateTimePicker')
    //.destroy() comment this line because getting  error after updating Angular 8 to 9
    const res = this.datetimepicker.data('DateTimePicker');
    if (res) {
      res.destroy();
    } else {
      $('DateTimePicker').datetimepicker('remove');
    }
  }

  nodeRemoved(e: Event) {
    const modal = this.datetimepicker.closest('modal-container')
    if (modal.length && e.target == modal[0])
      this.destroy()
  }

  hide(e: Event) {
    if (!$(this.datetimepicker).find(e.target).length)
      this.datetimepicker.data('DateTimePicker').hide()
  }

  adjustRange(id: string, dt: Date, op: string) {
    const d = $(id)
    if (d.length) {
      const el = d.find('input')
      const dp = d.data('DateTimePicker')
      const toDate = (dp && dp.date && dp.date() || moment(el.val())).toDate()
      if (op == 'add' ? toDate <= dt : toDate >= dt) {
        const val = moment(dt)[op](1, 'day')

        val.toString = () => {
          return moment(val).format(this.format)
        }

        el.val(val)

        el[0].dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
  }

  onChange(e: any) {
    if ((e.date.toDate && e.oldDate != null) || this.keepOpen) {
      const input = this.datetimepicker.find('input')
      const dt = e.date.startOf('day').toDate()
      if (this.pastOrFuture == "setRangePicker") {
        $('#' + this.idForRangeDate).data('DateTimePicker').minDate(dt)
      }
      if (this.change) {
        if (this.rangeStartDate)
          this.adjustRange(this.rangeStartDate, dt, 'subtract')
        if (this.rangeEndDate)
          this.adjustRange(this.rangeEndDate, dt, 'add')
      }
      this.change = true
      dt.toString = () => {
        return $(e.target).data('date')
      }
      input.val(dt)
      input[0].dispatchEvent(new Event('input', { bubbles: false }))
    }
  }
}