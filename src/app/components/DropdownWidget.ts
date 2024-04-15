import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

declare const $: any

@Component({
  selector: '[dropdown-widget]',
  template: `
        <span #elementRef>
            <span #widget class="material-symbols-outlined bold dropdown-widget-widget dropdown-toggle" data-toggle="dropdown">more_vert</span>
            <ul #dropdownMenu class="dropdown-menu widget">
                <li *ngFor="let item of items">
                    <a class="pointer" class={{item.class}} (click)="itemClick(item.key)">{{item.text}}</a>
                </li>                
            </ul>
        </span>
    `,
  styles: ['.dropdown-widget-widget { cursor: pointer; padding: 0px 5px; }']
})
export class DropdownWidget implements OnInit, OnDestroy {
  @Input() items: DropdownWidgetItem[]
  @Output() onItemClick = new EventEmitter<number>()

  @ViewChild('elementRef',{static: true})
  private elementRef: ElementRef

  @ViewChild('widget',{static: true})
  private widget: ElementRef

  @ViewChild('dropdownMenu',{static: true})
  private dropdownMenu: ElementRef

  private $elementRef: any
  private $dropdownMenu: any

  ngOnInit(): void {
    this.$elementRef = $(this.elementRef.nativeElement)
    this.$dropdownMenu = $(this.dropdownMenu.nativeElement)

    const widget = $(this.widget.nativeElement)

    this.$elementRef.on({
      'show.bs.dropdown': () => {
        $('body').append(this.$dropdownMenu.detach())

        const offset = widget.offset()

        let top = offset.top + this.$elementRef.outerHeight() + 3
        let left = offset.left - this.$dropdownMenu.width()

        left += widget.width()

        this.$dropdownMenu.css({
          'display': 'block',
          'top': top,
          'left': left
        })
      },
      'hide.bs.dropdown': () => {
        this.$elementRef.append(this.$dropdownMenu.detach())

        this.$dropdownMenu.hide()
      }
    })

    this.$dropdownMenu.on('click', (e: Event) => {
      e.stopPropagation()
    })
  }

  ngOnDestroy(): void {
    this.$dropdownMenu.off('click')
    this.$elementRef.off('show.bs.dropdown').off('hide.bs.dropdown')
  }

  itemClick(key: number) {
    this.$elementRef.trigger('click')
    this.onItemClick.emit(key)
  }
}

export interface DropdownWidgetItem {
  key: number,
  text: string,
  class?: string
}