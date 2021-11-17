function App(data) {
    this.html = $('#app')
    this.table = null
    this.thead = null
    this.tbody = null
    this.panel = null
    this.showPanelButton = null
    this.modalBack = null
    this.state = 'add'

    this.setup = function() {
        this.table = this.createTable(data)
        this.panel = this.createPanel([...(Object.keys(data[0]))])
        this.showPanelButton = this.createShowPanelButton()
        this.modalBack = this.createModalBack()

        $(this.html).append(this.table)
        $(this.html).append(this.showPanelButton)
        $(this.html).append(this.modalBack)
        $(this.html).append(this.panel)
    }
    
    this.createTable = function(data) {
        let table = $('<table></table>')
        let titles = ['row', ...(Object.keys(data[0]))]
        this.thead = this.createTableHead(titles, data)
        this.tbody = this.createTableBody(data)
        $(table).append(this.thead)
        $(table).append(this.tbody)
        return table
    }

    this.createTableHead = function(titles, data) {
        let thead = $('<thead></thead>')
        let tr    = $('<tr></tr>')
        for (let title of titles) {
            let th = $('<th></th>')
            $(th).attr('key', title)
            $(th).text(title)

            $(th).click((e) => {
                let key = $(e.target).attr('key')
                data.sort((a, b) => {
                    if (b[key] > a[key]) return 1
                    return -1
                })
                $(this.tbody).html(null)
                this.tbody = this.createTableBody(data)
                $(this.table).append(this.tbody)
            })
            $(tr).append(th)
        }
        $(thead).append(tr)
        return thead
    }

    this.createTableBody = function(data) {
        let tbody = $('<tbody></tbody>')
        for (let [index, person] of data.entries()) {
            let tr = $('<tr></tr>')
            let rowTd = $('<td></td>')
            $(rowTd).text(index + 1)
            $(tr).append(rowTd)
            
            $(tr).click(() => {
                this.state = 'edit'
                this.managePanelButtons(this.panel)
                this.loadPersonOnPanel(person)
                this.showModalBack()
            })

            for (prop in person) {
                let td = $('<td></td>')
                $(td).text(person[prop])
                $(tr).append(td)
            }
            $(tbody).append(tr)
        }
        return tbody
    }

    this.createShowPanelButton = function() {
        let button = $('<button></button>')
        $(button).attr('type', 'button')
        $(button).addClass('add-button')
        $(button).text('Show Panel')
        $(button).click(() => {
            this.state = 'add'
            this.managePanelButtons(this.panel)
            this.emptyPanelInputs()
            this.addNewUidToPanelInput(data)
            this.showPanel()
            this.showModalBack()
        })
        return button
    }

    this.addNewUidToPanelInput = function(data) {
        let uid = Math.max(...data.map(d => d.uid)) + 1
        let uidInput = $(this.panel).find('#uid')
        $(uidInput).val(uid)
    }

    this.createModalBack = function() {
        let div = $('<div></div>')
        $(div).addClass('modal-background')
        
        $(div).click(() => {
            this.emptyPanelInputs()
            this.hidePanel()
            this.hideModalBack()
        })

        return div
    }

    this.showModalBack = function() {
        $(this.modalBack).css('display', 'block')
    }

    this.hideModalBack = function() {
        $(this.modalBack).css('display', 'none')
    }

    this.createPanel = function(inputs) {
        let panel = $('<div></div>')
        $(panel).addClass('panel')
        this.createPanelTitle(panel)
        for (let input of inputs) {
            let inputHtml = $('<input></input>')
            $(inputHtml).attr('type', 'text')
            $(inputHtml).attr('id', input)
            $(inputHtml).attr('placeholder', input)
            if (input === 'uid') {
                $(inputHtml).attr('disabled', true)
                $(inputHtml).attr('type', 'number')
            }
            $(panel).append(inputHtml)
        }
        this.createPanelButtons(panel)
        return panel
    }

    this.createPanelTitle = function(panel) {
        let panelTitle = $('<h3></h3>')
        $(panelTitle).text('Panel:')
        $(panelTitle).addClass('panel-title')
        $(panel).append(panelTitle)
    }

    this.createPanelButtons = function(panel) {
        let addButton = $('<button></button>')
        let editButton = $('<button></button>')
        let removeButton = $('<button></button>')

        $(addButton).addClass('panel-add-button')
        $(editButton).addClass('panel-edit-button')
        $(removeButton).addClass('panel-remove-button')

        $(addButton).attr('id', 'add')
        $(editButton).attr('id', 'edit')
        $(removeButton).attr('id', 'remove')

        $(addButton).attr('type', 'button')
        $(editButton).attr('type', 'button')
        $(removeButton).attr('type', 'button')

        $(addButton).text('Add')
        $(editButton).text('Edit')
        $(removeButton).text('Remove')

        $(addButton).click(() => {
            if (!this.checkPanelInputs()) {
                alert('All input required.')
                return
            }
            
            data = this.addPerson(data)
            $(this.tbody).html(null)
            this.tbody = this.createTableBody(data)
            $(this.table).append(this.tbody)
            this.emptyPanelInputs()
            this.hidePanel()
            this.hideModalBack()
        })

        $(editButton).click(() => {
            if (!this.checkPanelInputs()) {
                alert('All input required.')
                return
            }
            data = this.editPerson(data)
            $(this.tbody).html(null)
            this.tbody = this.createTableBody(data)
            $(this.table).append(this.tbody)
            this.hidePanel()
            this.hideModalBack()
        })

        $(removeButton).click(() => {
            this.removePerson(data)
            $(this.tbody).html(null)
            this.tbody = this.createTableBody(data)
            $(this.table).append(this.tbody)
            this.emptyPanelInputs()
            this.hidePanel()
            this.hideModalBack()
        })

        $(panel).append(addButton)
        $(panel).append(editButton)
        $(panel).append(removeButton)
    }

    this.managePanelButtons = function(panel) {
        let addButton = $(panel).find('#add')
        let editButton = $(panel).find('#edit')
        let removeButton = $(panel).find('#remove')
        if (this.state === 'add') {
            $(addButton).css('display', 'block')
            $(editButton).css('display', 'none')
            $(removeButton).css('display', 'none')
        }

        if (this.state === 'edit') {
            $(addButton).css('display', 'none')
            $(editButton).css('display', 'block')
            $(removeButton).css('display', 'block')
        }
    }

    this.loadPersonOnPanel  = function(person) {
        for (let prop in person) {
            let input = $(this.panel).find(`#${prop}`)
            $(input).val(person[prop])
        }
        this.showPanel()
    }

    this.showPanel = function() {
        $(this.panel).css('opacity', 1)
        $(this.panel).css('visibility', 'visible')
    }

    this.hidePanel = function() {
        $(this.panel).css('opacity', 0)
        $(this.panel).css('visibility', 'hidden')
    }

    this.checkPanelInputs = function() {
        return [...$(this.panel).find('input')]
                .every(input => $(input).val())
    }

    this.editPerson = function(data) {
        let panelChildren = $(this.panel).find('input')
        let uid = Number($(this.panel).find('#uid').val())
        let person = data.find(d => d.uid === uid)
        for (let input of panelChildren) {
            if ($(input).attr("id") !== 'uid') person[$(input).attr("id")] = $(input).val()
        }
        return data
    }

    this.removePerson = function(data) {
        let panelChildren = $(this.panel).find('input')
        let uid = Number($(this.panel).find('#uid').val())
        let findIndex = null
        for (const index in data) {
            if (data[index].uid === uid) findIndex = index
        }
        data.splice(findIndex, 1)
        return data
    }

    this.emptyPanelInputs = function() {
        return [...$(this.panel).find('input')]
                .map(input => $(input).val(null))
    }

    this.addPerson = function(data) {
        let panelChildren = $(this.panel).find('input')
        let person = {}        
        for (let input of panelChildren) {
            if ($(input).attr('id') === 'uid') {
                person[$(input).attr('id')] = Number($(input).val())
            } else {
                person[$(input).attr('id')] = $(input).val()
            }
        }
        data.push(person)

        return data
    }
}