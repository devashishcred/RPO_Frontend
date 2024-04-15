import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, Input, ViewChild } from '@angular/core';

declare const $: any

@Component({
    selector: 'export-xls-pdf-widget',
    template: `
        <span #export tooltip="Download" class="pull-left mt-12 material-icon {{customClass}} {{disabled ? 'disabled' : ''}}">
        <span class="material-symbols-rounded export-widget dropdown-toggle" data-toggle="dropdown">download</span>    
            <ul #dropdownMenu class="dropdown-menu widget export-dropdown">
                <li>
                    <a class="pointer" (click)="exportClick('xls')">
                        <i class="fa fa-file-excel-o export-icon export-icon-excel"></i>
                        &nbsp;&nbsp;&nbsp;XLS
                    </a>
                </li>
                <li>
                    <a class="pointer" (click)="exportClick('pdf')">
                        <i class="fa fa-file-pdf-o export-icon export-icon-pdf"></i>
                        &nbsp;&nbsp;&nbsp;PDF
                    </a>
                </li>
                <li *ngIf='showEmailOptions'>
                    <a class="pointer" (click)="exportClick('xlsEmail')">
                    <i class="fa fa-file-excel-o export-icon export-icon-excel"></i>
                        &nbsp;&nbsp;&nbsp;Email XLS
                    </a>
                </li>
                <li *ngIf='showEmailOptions'>
                    <a class="pointer" (click)="exportClick('pdfEmail')">
                    <i class="fa fa-file-pdf-o export-icon export-icon-pdf"></i>
                        &nbsp;&nbsp;&nbsp;Email PDF
                    </a>
                </li>
            </ul>
        </span>
    `,
    styles: [`
        .export { margin-top: 24px; margin-left: 0px; }
        .export-widget { cursor: pointer; color:#00B1D4; }
        .export-icon { font-size: 1.3em; }
        .export-icon-pdf { color:#EB2B21; }
        .export-icon-excel { color:#35A807; }
        .disabled{
            pointer-events: none;
            opacity: 0.5;
        }
    `]
})
export class ExporXLSAndPDFtWidget implements OnInit, OnDestroy {
    @Input() customClassApply: string;
    @Input() showEmailOptions: boolean;
    @Input() disabled: boolean;
    @Output() onExportClick = new EventEmitter<string>();


    @ViewChild('export',{static: true})
    private export: ElementRef

    @ViewChild('dropdownMenu',{static: true})
    private dropdownMenu: ElementRef

    customClass: string = 'show'
    ngOnInit(): void {
        this.customClass = this.customClassApply
        $(this.export.nativeElement).on({
            'show.bs.dropdown': (e: any) => {
                const target = $(this.export.nativeElement)
                const dropdownMenu = $(this.dropdownMenu.nativeElement)

                const widget = target.children(":first")

                $('body').append(dropdownMenu.detach())

                const offset = widget.offset()

                let top = offset.top + target.outerHeight() + 3
                let left = offset.left - dropdownMenu.width()

                left += widget.width()

                dropdownMenu.css({
                    'display': 'block',
                    'top': top,
                    'left': left
                })
            },
            'hide.bs.dropdown': (e: any) => {
                const target = $(this.export.nativeElement)
                const dropdownMenu = $(this.dropdownMenu.nativeElement)

                target.append(dropdownMenu.detach())

                dropdownMenu.hide()
            }
        })
    }

    ngOnDestroy(): void {
        $(this.export.nativeElement).off('show.bs.dropdown').off('hide.bs.dropdown')
    }

    exportClick(str: string) {
        this.onExportClick.emit(str);
    }
}