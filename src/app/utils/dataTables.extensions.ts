import { HttpClient } from '@angular/common/http';
import { NgZone } from '@angular/core';
import { cloneDeep, defaultsDeep, isDate, isObject, uniqueId } from 'lodash';
import { ToastrService } from 'ngx-toastr';

//import { AppModule } from '../app.module';
import { equals, parseDateFields } from './utils';
import { constantValues } from '../app.constantValues';

declare const $: any
debugger
const castDateFieldsToISOString = (obj: any) => {
  if (!obj)
    return

  for (let p in obj) {
    const v = obj[p]
    if (isDate(v)) {
      obj[p] = obj[p].toISOString()
    } else if (isObject(v)) {
      castDateFieldsToISOString(obj[p])
    } else if ($.isArray(v)) {
      $.forEach(obj[p], (o: any) => {
        castDateFieldsToISOString(o)
      })
    }
  }
}

$.fn.dataTable.pipeline = function (opts: any) {
  var formatData = (data: any) => {
    if (!equals({}, data)) {
      if (data.order) {
        data.orderedColumn = {
          column: data.columns[data.order[0].column].data,
          dir: data.order[0].dir
        }

        delete data.order
      }

      if (data.columns) {
        data.searchableColumns = data.columns.filter(function (c: any) {
          return c.searchable
        }).map(function (c: any) {
          return c.data
        })

        delete data.columns
      }

      data.search = data.search && data.search.value
    }

    if (opts.onData)
      opts.onData(data)

    castDateFieldsToISOString(data)

    return data
  }

  var conf = $.extend({
    pages: 15,
    url: '',
    data: function (data: any) {
      data = formatData(data)
    },
    method: 'GET',
    beforeSend: function (xhr: any) {
      const sAuth = localStorage.getItem('auth')

      if (sAuth) {
        const auth = JSON.parse(sAuth)

        const authHeader = auth.token_type + ' ' + auth.access_token
        xhr.setRequestHeader('Authorization', authHeader)
        debugger
        //xhr.setRequestHeader('currentTimeZone', AppModule.injector.get(constantValues).currentTimeZone)
      } else {
        // ir para login???
      }
    },
    error: function (r: any) {
      this.dataTableSettings.oApi.fnShowProcessing(this.dataTableSettings, false)
    }
  }, opts)

  var cacheLower = -1
  var cacheUpper: any = null
  var cacheLastRequest: any = null
  var cacheLastJson: any = null

  return function (request: any, drawCallback: any, settings: any) {
    var ajax = false
    var requestStart = request.start
    var drawStart = request.start
    var requestLength = request.length
    var requestEnd = requestStart + requestLength
    var changeOrder = cacheLastRequest && JSON.stringify(request.order) !== JSON.stringify(cacheLastRequest.order)

    if (settings.clearCache) {
      ajax = true
      settings.clearCache = false
    } else if (cacheLower < 0 || requestStart < cacheLower || requestEnd > cacheUpper) {
      ajax = true
    } else if (!cacheLastRequest || changeOrder || JSON.stringify(request.columns) !== JSON.stringify(cacheLastRequest.columns) || JSON.stringify(request.search) !== JSON.stringify(cacheLastRequest.search)) {
      if (!(settings.dataCache && settings.dataCache.recordsTotal == settings.dataCache.data.length))
        ajax = true
    }

    cacheLastRequest = $.extend(true, {}, request)

    settings.formatData = formatData

    if (ajax) {
      if (requestStart < cacheLower) {
        requestStart = requestStart - (requestLength * (conf.pages - 1))

        if (requestStart < 0) {
          requestStart = 0
        }
      }

      cacheLower = requestStart
      cacheUpper = requestStart + (requestLength * conf.pages)

      request.start = requestStart
      request.length = requestLength * conf.pages

      if ($.isFunction(conf.data)) {
        var d = conf.data(request)
        if (d) {
          $.extend(request, d)
        }
      } else if ($.isPlainObject(conf.data)) {
        $.extend(request, conf.data)
      }

      settings.jqXHR = $.ajax({
        dataSrc: conf.dataSrc,
        type: conf.method,
        url: conf.url,
        data: request,
        dataType: 'json',
        dataTableSettings: settings,
        cache: false,
        beforeSend: conf.beforeSend,
        error: conf.error,
        success: function (json: any) {
          settings.url = conf.url

          parseDateFields(json)

          if (conf.success)
            conf.success(json)

          settings.dataCache = cacheLastJson = $.extend(true, {}, json)
          settings.dataCache.limit = request.length

          if (cacheLower != drawStart)
            json.data.splice(0, drawStart - cacheLower)

          if (requestLength >= -1)
            json.data.splice(requestLength, json.data.length)

          drawCallback(json)
        }
      })
    } else {
      if (changeOrder) {
        var dir = request.order[0].dir
        var field = request.columns[request.order[0].column].data

        cacheLastJson.data = cacheLastJson.data.sort(function (a: any, b: any) {
          var v1 = a[field] || '0'
          var v2 = b[field] || '0'

          if (v1 < v2)
            return dir == 'asc' ? -1 : 1
          else if (v1 > v2)
            return dir == 'asc' ? 1 : -1
          else return 0
        })
      }

      var json = $.extend(true, {}, cacheLastJson)

      if (request.search && request.search.value) {
        var searchableColumns = request.columns.filter(function (c: any) {
          return c.searchable && c.data
        }).map(function (c: any) {
          return c.data
        })

        if (searchableColumns.length) {
          var words = request.search.value.trim().replace(/ +(?= )/g, '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          if (words) {
            words = words.split(' ')
            json.data = json.data.filter(function (d: any) {
              var and = !0
              for (var w = 0, lw = words.length; w < lw; w++) {
                var or = !1
                for (var c = 0, lc = searchableColumns.length; c < lc; c++) {
                  var column = settings.aoColumns.find((col: any) => {
                    return col.data == searchableColumns[c]
                  })

                  if (column)
                    column = colVal(column, d)

                  if (column) {
                    column = column.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    or = or || (column.indexOf(words[w]) >= 0)
                  }
                }

                and = and && or

                if (!and)
                  return !1
              }

              return and
            })

            json.recordsFiltered = json.data.length
          }
        }
      }

      json.draw = request.draw
      json.data.splice(0, requestStart - cacheLower)
      json.data.splice(requestLength, json.data.length)

      drawCallback(json)
    }
  }
}

$.fn.dataTable.Api.register('clearPipeline()', function () {
  return this.iterator('table', function (settings: any) {
    settings.clearCache = true
  })
})

$.fn.DataTable.Api.register('rows().delete()', function () {
  return this.iterator('row', function (ctx: any, idx: any) {
    if (ctx.dataCache) {
      var dataRow = this.row(idx).data()

      var items = ctx.dataCache.data.filter(function (e: any) {
        return equals(e, dataRow)
      })

      if (items && items.length) {
        idx = ctx.dataCache.data.indexOf(items[0])
        ctx.dataCache.data.splice(idx, 1)

        var dt = this.data()

        items = dt.filter(function (e: any) {
          return equals(e, dataRow)
        })

        if (items && items.length) {
          idx = dt.indexOf(items[0])
          this.row(idx).remove()
        }

        ctx.dataCache.recordsFiltered--
        ctx.dataCache.recordsTotal--

        var page = this.page()

        if (!this.row(0).length && page > 0)
          page--

        setTimeout(() => {
          this.page(page).draw(false)

          this.columns.adjust()
        })
      }
    }
  })
})

$.fn.DataTable.Api.register('rows().update()', function (data: any, draw: any) {
  return this.iterator('row', function (ctx: any, idx: any) {
    if (ctx.dataCache) {
      data = cloneDeep(data)

      var dataRow = this.row(idx).data()

      var items = ctx.dataCache.data.filter(function (e: any) {
        return equals(e, dataRow)
      })

      if (items && items.length) {
        idx = ctx.dataCache.data.indexOf(items[0])

        if (ctx.aoColumns && ctx.aoColumns.length) {
          for (var i = 0, l = ctx.aoColumns.length; i < l; i++) {
            var c = ctx.aoColumns[i]
            if (c.mData && data[c.mData] === void 0)
              data[c.mData] = c.defaultContent
          }
        }

        ctx.dataCache.data.splice(idx, 1, data)

        var dt = this.data()

        items = dt.filter(function (e: any) {
          return equals(e, dataRow)
        })

        if (items && items.length) {
          idx = dt.indexOf(items[0])
          this.row(idx).data(data)

          if (!$.fn.dataTable.defaults.serverSide) { // eXGH
            const row = this.tables().nodes().to$().find(`tbody > tr#${data.id}`)

            if (row.length) {
              const children = row.children()

              this.columns(':visible:not([class*="special-column-"])').every((idx: number) => {
                const val = colVal(ctx.aoColumns[idx], data, true)
                children.eq(idx).html(val)
              })

              draw = false
            }
          }
        }

        if (draw === void 0)
          draw = true

        setTimeout(() => {
          draw && this.page(this.page()).draw(false)

          this.columns.adjust()
        })
      }
    }
  })
})

$.fn.DataTable.Api.register('rows.insert()', function (data: any, atTheEnd: any) {
  data = cloneDeep(data)

  var pageInfo = this.page.info()

  var pageLength = pageInfo.length

  var ctx = this.settings()[0]

  if (ctx.aoColumns && ctx.aoColumns.length) {
    for (var i = 0, l = ctx.aoColumns.length; i < l; i++) {
      var c = ctx.aoColumns[i]
      if (c.mData && data[c.mData] === void 0)
        data[c.mData] = c.defaultContent
    }
  }

  var idx = 0

  var dataCache = ctx.dataCache

  if (!atTheEnd) {
    if (dataCache.data.length < pageLength) {
      dataCache.data.splice(0, 0, data)
    } else {
      idx = (pageInfo.page * pageLength) % (dataCache.limit || 1)
      dataCache.data.splice(idx, 0, data)
    }
  } else {
    if (dataCache.data.length < pageLength) {
      idx = dataCache.data.length
      dataCache.data.push(data)
    } else {
      idx = ((pageInfo.page * pageLength) + (pageInfo.end - pageInfo.start - 1)) % (dataCache.limit || 1)
      dataCache.data.splice(idx, 0, data)
    }
  }

  dataCache.recordsFiltered++
  dataCache.recordsTotal++

  let draw = false

  if (!$.fn.dataTable.defaults.serverSide) { // eXGH
    this.row.add(data)

    const row = this.tables().nodes().to$().find(`tbody > tr:first`)

    if (row.length) {
      const cp = row.clone()

      cp.attr('id', data.id)
      cp.prop('_DT_RowIndex', ctx.aiDisplayMaster[ctx.aiDisplayMaster.length - 1])

      const children = cp.children()

      this.columns(':visible:not([class*="special-column-"])').every((idx: number) => {
        const val = colVal(ctx.aoColumns[idx], data, true)
        children.eq(idx).html(val)
      })

      const tbody = row.parent()

      if (idx == 0)
        tbody.prepend(cp)
      else
        tbody.children().eq(idx - 1).after(cp)

      ctx.aiDisplayMaster.unshift(ctx.aiDisplayMaster.pop())
      ctx.aiDisplay.unshift(ctx.aiDisplay.pop())
    } else
      draw = true
  } else
    draw = true

  setTimeout(() => {
    draw && this.page(pageInfo.page).draw(false)

    this.columns.adjust()
  })
})

$.fn.DataTable.Api.register('rows.idxByDataId()', function (id: any) {
  return this.rows().eq(0).filter(function (idx: any) {
    return this.row(idx).data().id === id
  })[0]
})

$.fn.DataTable.ext.oApi.fnShowProcessing = function (settings: any, show: any) {
  if (show === void 0)
    show = true

  this._fnProcessingDisplay(settings, show)
}

$.fn.dataTable.Api.register('processing()', function (show: any) {
  return this.iterator('table', function (ctx: any) {
    if (show === void 0)
      show = true

    ctx.oApi._fnProcessingDisplay(ctx, show)
  })
})

$.extend(true, $.fn.dataTable.defaults, {
  dom: 'rtip',
  rowId: 'id',
  lengthChange: false,
  pageLength: 100,
  paging: true,
  processing: true,
  scrollX: true,
  lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
  serverSide: false, // eXGH - datatables has been broken after turned off
  language: {loadingRecords: ""},
  oLanguage: {sProcessing: "<div class='lds-css table-loader'><div class='lds-ripple'><div></div><div></div></div> </div>"}
  // oLanguage: { sProcessing: "" }
})

class SpecialColumn {
  private id: string
  private datatable: any
  private wrapper: any
  private dropdownMenu: any

  private columnSelector: boolean

  private zone: NgZone
  private actions: any
  private fnActionPopup: Function
  private fnActionClick: Function

  public title: string
  public orderable: boolean
  public searchable: boolean
  public class: string
  public width: number
  public customClass: string
  public defaultContent: string

  constructor(actions: any, columnSelector: boolean = true, width?) {
    this.id = uniqueId()
    // this.class = `text-right ${columnSelector ? ` special-column-${this.id}` : ''}`
    this.class = `text-right select-column${columnSelector ? ` special-column-${this.id}` : ''}`
    // this.class = `text-right select-column${columnSelector ? ` special-column-${this.id}` : ''}`
    this.orderable = false
    this.searchable = false
    this.width = width || 'auto'

    this.title = (this.columnSelector = columnSelector) ? `
            <span class="special-column-${this.id}" style="font-weight:600;position:relative;margin-right:9px;">
                <span style="padding-right:5px; display:none;">Select Columns</span>
                <i class="fa fa-plus-square pointer dropdown-toggle special-column-${this.id}" data-toggle="dropdown" style="font-size: 1.3em;"></i>
                <ul class="dropdown-menu widget special-column-${this.id}">
                    __columns__
                </ul>
            </span>` : ''

    this.defaultContent = (this.actions = actions) ? `
        <div class="action-icon">
        <span data-toggle="tooltip" title="Edit" class="edit-icon">
            <img src="./assets/images/edit_icon.svg" width="24px">
        </span>
        <span data-toggle="tooltip" title="Revise" class="revise-icon hide">
            <img src="./assets/images/revise.svg" width="20px">
        </span>
        <span class="material-symbols-rounded edit-permission hide">stylus_note</span>
            <span data-toggle="tooltip" title="Progression Notes" class="material-symbols-rounded note-icon hide">text_snippet</span>
            <span data-toggle="tooltip" title="View" class="material-symbols-rounded hide view-icon">visibility</span>            
            <span data-toggle="tooltip" title="Delete" class="material-symbols-rounded delete-icon">delete</span>
            <span class="action-${this.id} more_vert">
                <i class="material-symbols-outlined bold widget pointer dropdown-toggle action-${this.id}" data-toggle="dropdown">more_vert</i>
                <ul class="dropdown-menu widget action-${this.id}" style="z-index: 99999;">
                __actions__
                </ul>
            </span>
        </div>`.replace('__actions__', this.actions.map((a: any) => this.tmpl(a, false)).join('')) : ''
    // <span data-toggle="tooltip" title="Revise" class="material-symbols-outlined revise-icon hide">restart_alt</span>

    this.onShowDropdown = this.onShowDropdown.bind(this)
    this.onHideDropdown = this.onHideDropdown.bind(this)
    this.onDropdownMenuItemClick = this.onDropdownMenuItemClick.bind(this)
    this.destroy = this.destroy.bind(this)
  }

  public destroy() {
    this.dropdownMenu && this.dropdownMenu.off('click')
    this.wrapper && this.wrapper.off({'show.bs.dropdown': this.onShowDropdown, 'hide.bs.dropdown': this.onHideDropdown})
  }

  private tmpl(o: any, t: boolean = true) {
    return t
      ? `<li class="special-column-${this.id}" style="padding-left: 10px; padding-right: 10px;">
            <div class="checkbox form-check"> <label class="form-check-label input-inline special-column-${this.id}"><input type="checkbox" class="form-check-input special-column-${this.id}" data-column="${o.idx}" ${o.visible ? 'checked' : ''}/>${o.title} <i class="input-helper"></i></label></div></li>`
      : `<li class="action-${this.id} ${o.customClass}""><a href="" class="action-${this.id}"" data-action-id="${o.id}">${o.title}</a></li>`
  }

  public ngZone(z: NgZone) {
    this.zone = z
    return this
  }

  public dataTable(datatable: any) {
    this.datatable = datatable

    let evFilter = `span.action-${this.id}`

    if (this.columnSelector) {
      let column: any;
      const selectableColumns: any = []
      const self = this

      datatable.columns().every(function (idx: number) {
        const h = $(this.header())

        if (h.hasClass(`special-column-${self.id}`))
          column = this
        else if (h.hasClass(`selectable`)) {
          selectableColumns.push({idx: idx, title: h.text(), visible: this.visible()})
        }
      })

      const columns = selectableColumns.map((c: any) => this.tmpl(c)).join('')

      $(column.header()).html(this.title.replace('__columns__', columns))

      evFilter = `span.special-column-${this.id}, ${evFilter}`
    }

    if (this.actions)
      this.defaultContent = this.defaultContent.replace('__actions__', this.actions.map((a: any) => this.tmpl(a, false)).join(''))

    this.wrapper = this.datatable.tables().nodes().to$().parents('.dataTables_wrapper')
    this.wrapper.on({'show.bs.dropdown': this.onShowDropdown, 'hide.bs.dropdown': this.onHideDropdown}, evFilter)

    return this
  }

  public onActionClick(fn: Function) {
    this.fnActionClick = fn
    return this
  }

  public onActionPopup(fn: Function) {
    this.fnActionPopup = fn
    return this
  }

  private onShowDropdown(e: any) {
    this.destroy.bind(this);
    const target = $(e.target)

    this.dropdownMenu = target.find('.dropdown-menu')

    $('body').append(this.dropdownMenu.detach())

    const widget = target.is('i') ? target : (this.columnSelector && target.hasClass(`special-column-${this.id}`)) ? target.find(`i.special-column-${this.id}`) : target.find(`i.action-${this.id}`)

    const offset = widget.offset()

    let top = offset.top + target.outerHeight()
    let left = offset.left - this.dropdownMenu.width()

    if (widget.hasClass(`action-${this.id}`)) {
      if (this.fnActionPopup) {
        if (this.zone)
          this.zone.run(() => {
            this.actions.forEach((a: any) => {
              const cp = Object.assign({}, a)
              this.fnActionPopup(this.datatable.row(target.parents('tr')).data(), cp)
              if (a.title !== cp.title)
                this.dropdownMenu.find(`a[data-action-id="${a.id}"]`).text(cp.title)
            })
          })
        else
          this.actions.forEach((a: any) => {
            const cp = Object.assign({}, a)
            this.fnActionPopup(this.datatable.row(target.parents('tr')).data(), cp)
            if (a.title !== cp.title)
              this.dropdownMenu.find(`a[data-action-id="${a.id}"]`).text(cp.title)
          })
      }

      top = offset.top - 5
      left -= 5
    } else {
      top += 11
      left += widget.width()
    }

    this.dropdownMenu.css({
      'display': 'block',
      'top': top,
      'left': left
    })

    this.dropdownMenu.on('click', this.onDropdownMenuItemClick(target))
  }

  private hideOtherDropdown(e: any) {
    $('.select-column').click(function () {
      var index = $(this).parents('tr').index();
      $("body > .dropdown-menu:nth-child(+index+)").remove();
    });
  }

  private onHideDropdown(e: any) {
    this.hideOtherDropdown;
    setTimeout(function () {
      $("body > .dropdown-menu:not(:last-child)").remove();
    }, 200);
    if (this.dropdownMenu) {
      this.dropdownMenu.off('click')
      $(e.target).append(this.dropdownMenu.detach())
      this.dropdownMenu.hide()
      this.dropdownMenu = null;
    }
  }

  private onDropdownMenuItemClick(target: any) {
    return function (e: any) {
      e.preventDefault()
      e.stopPropagation()

      let eTarget = $(e.target)

      if (eTarget.hasClass(`action-${this.id}`)) {
        if (this.fnActionClick) {
          const actionId = eTarget.data('actionId')
          if (actionId) {
            target.trigger('click')

            setTimeout(() => {
              if (this.zone)
                this.zone.run(() => {
                  this.fnActionClick(this.datatable.row(target.parents('tr')), actionId)
                })
              else
                this.fnActionClick(this.datatable.row(target.parents('tr')), actionId)
            })

            return false
          }
        }
      } else {
        let checked = eTarget.prop('checked')

        const chk = eTarget.is('input[type="checkbox"]')

        if (!chk) {
          eTarget = eTarget.find('input[type="checkbox"]')
          checked = !eTarget.prop('checked')
        }

        setTimeout(() => {
          eTarget.prop('checked', checked)
        })

        const column = this.datatable.column(eTarget.data('column'))

        column.visible(checked)

        return false
      }
    }.bind(this)
  }
}

$.fn.dataTable.SpecialColumn = SpecialColumn

function colVal(col: any, data: any, html: boolean = false) {
  let result = col.fnGetData(data, 'display') || ''

  if (!html)
    return result.toString()
      .replace(/<[^>]*>/g, '')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\n/g, ' ')
  else
    return result.toString()

}

function exportData(cfg: any) {
  const ctx = cfg.dt.context[0]

  const data = ctx.dataCache.exportData || ctx.dataCache.data

  return data.map((d: any) => {
    const row: any = []

    cfg.dt.columns(cfg.exportOptions.columns).every((idx: number) => {
      row.push(colVal(ctx.aoColumns[idx], d))
    })

    return row
  })
}

$.fn.dataTable.button = (cfg: any = null) => {
  cfg = cfg || {}
  cfg = defaultsDeep(cfg, {
    filename: 'RPO',
    footer: true,
    orientation: 'landscape',
    title: 'RPO',
    exportOptions: {
      columns: ':visible:not([class*="special-column-"])'
    },
    init: (dt: any, node: any, conf: any) => {
      const extend = cfg.extend
      cfg = conf
      cfg.dt = dt
      cfg.extend = extend
    },
    customizeData: (doc: any) => {
      if (cfg.extend == 'excelHtml5') {
        doc.body = exportData(cfg)
      }
    },
    customize: (doc: any) => {
      if (cfg.extend == 'pdfHtml5') {
        const content = exportData(cfg)

        content.unshift(doc.content[1].table.body[0])

        doc.content[1].table.body = content
      }
    },
    export: () => {
      const ctx = cfg.dt.context[0]

      const dataCache = ctx.dataCache

      const data = dataCache.data

      if (!data.length) {
        //AppModule.injector.get(ToastrService).error(cfg.dt.i18n('sZeroRecords'))
      } else {
        const action = () => {
          $.fn.DataTable.ext.buttons[cfg.extend].action.call(cfg.dt, null, cfg.dt, null, cfg)
        }

        if (dataCache.recordsFiltered <= data.length) {
          dataCache.exportData = dataCache.exportParams = void 0
          action()
        } else {
          const aData = ctx.formatData(cloneDeep(ctx.oAjaxData))
          aData.start = 0
          aData.length = dataCache.recordsTotal

          const fromRemote = () => {
            // AppModule.injector.get(HttpClient).get<any>(ctx.url, {params: $.param(aData)}).subscribe(r => {
            //   dataCache.exportData = r.data
            //   dataCache.exportParams = aData
            //   action()
            // })
          }

          if (dataCache.exportParams && dataCache.exportData && equals(dataCache.exportParams, aData))
            action()
          else
            fromRemote()
        }
      }
    }
  })

  return cfg
}