$(document).ready(function() {
    // Variables
    let usersData = []
    let totalPages = 1
    let currentPage = 1

    // Ajax requests and load data
    for (let i = 1; i <= totalPages; i++) {
        $.ajax({
            type: 'GET',
            url: `https://reqres.in/api/users?page=${i}`,
            dataType: 'json',
            success: function (result, status, xhr) {
                totalPages = result.total_pages
                if (status === 'success') {
                    usersData.push(...result.data)
                }
            },
            async: false
        })
    }

    // CRUD
    function create(persons, object) {
        if (!Array.isArray(persons)) return { success: false, message: `You must insert an array as first input` }
        if (typeof object !== 'object') return { success: false, message: `You must insert an object as second input` }
        if (!object.hasOwnProperty('id')) return { success: false, message: `Your second input must has id property` }
        let checkPersons = persons.find(person => {
            return person.id === object.id
        })
        if (checkPersons) return { success: false, message: `This ID is already exists` }
        
        persons.push(object)
        return { success: true, data: persons }
    }
    function update(persons, object) {
        if (!Array.isArray(persons)) return { success: false, message: `You must insert an array as first input` }
        if (typeof object !== 'object') return { success: false, message: `You must insert an object as second input` }
        if (!object.hasOwnProperty('id')) return { success: false, message: `Your second input must has uid property` }
        
        let findPerson = persons.find(person => {
            return person.id === object.id
        })
        if (!findPerson) return { success: false, message: `This person isn't exists` }
    
        for (let prop in object) {
            findPerson[prop] = object[prop]
        }
    
        return { success: true, data: persons }
    }
    function remove(persons, id) {
        if (!Array.isArray(persons)) return { success: false, message: `You must insert an array as first input` }
        let findIndex = null
        for (const index in persons) {
            if (persons[index].id === id) findIndex = index
        }
        if (!findIndex) return { success: false, message: `This person isn't exists` }
        
        persons.splice(findIndex, 1)
        return { success: true, id }
    }

    // UI
    const insertDataInHTML = function(data = []) {
        let usersListHTML = $('#users-list')
        usersListHTML.empty()
        for (let user of data) {
            $(usersListHTML).append(createUserCard(user))
        }
    }
    const createUserCard = function(user) {
        let card = `
            <div class="col-12 col-sm-6 col-md-4 mt-3">
                <div class="card">
                    <img src="${user.avatar}" class="card-img-top" alt="${user.first_name}">
                    <div class="card-body">
                        <h5 class="card-title">id: ${user.id}</h5>
                        <p class="card-text">email: ${user.email}</p>
                        <a class="btn btn-primary show-modal" data-bs-toggle="modal" data-bs-target="#modal-users-detail" data-id="${user.id}">user profile</a>
                    </div>
                </div>
            </div>
        `
        return card
    }
    const updateUsersModal = function(user) {
        $('#modal-update-alert').hide()
        let modal = $('#modal-users-detail')
        $(modal).find('#modal-user-id').html(user.id)
        $(modal).find('#modal-update-firstname').val(user.first_name)
        $(modal).find('#modal-update-lastname').val(user.last_name)
        $(modal).find('#modal-update-email').val(user.email)
        $(modal).find('#modal-update-avatar').attr('src', user.avatar)
        $(modal).find('#modal-delete').attr('data-id', user.id)
        $(modal).find('#modal-update').attr('data-id', user.id)
        return modal
    }
    const paginationHTML = function(pages, current) {
        let pagination = $('#pagination')
        pagination.empty()
        let prevButton = `
            <li class="page-item" data-page="prev">
                <a class="page-link" href="#">Previous</a>
            </li>
        `
        let nextButton = `
            <li class="page-item" data-page="next">
                <a class="page-link" href="#">Next</a>
            </li>
        `
        $(pagination).append(prevButton)
        for (let page = 1; page <= pages; page++) {
            let pageHTML = `
                <li class="page-item ${ current === page ? 'active':''}" data-page="${page}">
                    <a class="page-link" href="#">${page}</a>
                </li>
            `
            $(pagination).append(pageHTML)
        }
        $(pagination).append(nextButton)
    }
    const paginator = function(data, current, perPage = 6) {
        let temp = data.slice((current - 1) * perPage, current * perPage)
        let pages = (data.length % perPage) === 0 ? data.length / 6 : Math.floor(data.length / 6) + 1
        totalPages = pages
        insertDataInHTML(temp)
        paginationHTML(pages, current)
    }
    paginator(usersData, currentPage)

    // Helpers
    const getUpdateModalInputs = function() {
        let modal = $('#modal-users-detail')
        let userId = Number($('#modal-update').attr('data-id'))
        let firstname = $(modal).find('#modal-update-firstname').val()
        let lastname = $(modal).find('#modal-update-lastname').val()
        let email = $(modal).find('#modal-update-email').val()
        let avatar = $(modal).find('#modal-update-avatar-file').prop('files')
        avatar = avatar.length ? `img/${avatar[0].name}` : $('#modal-update-avatar').attr('src')
        return {
            "id": userId,
            "first_name": firstname,
            "last_name": lastname,
            "email": email,
            "avatar": avatar
        }
    }
    const getCreateModalInputs = function() {
        let modal = $('#modal-create-user')
        let userId = Number($('#modal-create-id').val())
        let firstname = $(modal).find('#modal-create-firstname').val()
        let lastname = $(modal).find('#modal-create-lastname').val()
        let email = $(modal).find('#modal-create-email').val()
        let avatar = $(modal).find('#modal-create-avatar-file').prop('files')
        avatar = avatar.length ? `img/${avatar[0].name}` : 'img/default.png'
        return {
            "id": userId,
            "first_name": firstname,
            "last_name": lastname,
            "email": email,
            "avatar": avatar
        }
    }
    const emptyCreateModalInputs = function() {
        $('#modal-create-id').val(null)
        $('#modal-create-firstname').val(null)
        $('#modal-create-lastname').val(null)
        $('#modal-create-email').val(null)
        $('#modal-create-avatar-file').val(null)
    }
    const checkObjectValues = function(obj) {
        // check all inputs have value
        let checkAll = Object.values(obj).every(value => value !== null && value !== undefined && value !== '')
        if (!checkAll) return { pass: false, message: 'All inputs are required!' }

        // check ID
        if (isNaN(obj.id)) return { pass: false, message: 'The ID is not a number!' }

        // check firstname
        const regexString = /[a-zA-Z]{3,}/
        if (!regexString.test(obj.first_name)) return { pass: false, message: 'The firstname must be a real name and more than 3 character!' }
        if (!regexString.test(obj.last_name)) return { pass: false, message: 'The lastname must be a real name and more than 3 character!' }

        // check email
        const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!regexEmail.test(String(obj.email).toLowerCase())) return { pass: false, message: 'The email is not correct!' }
        
        return { pass: true }
    }

    // Events
    $('#pagination').on('click', '.page-item', function(e) {
        e.preventDefault()
        if ($(this).attr('data-page') === 'prev') {
            if (currentPage > 1) currentPage--
        } else if ($(this).attr('data-page') === 'next') {
            if (currentPage < totalPages) currentPage++
        } else {
            currentPage = Number($(this).attr('data-page'))
        }
        paginator(usersData, currentPage)
    })
    $('#users-list').on('click', '.show-modal', function() {
        let userId = Number($(this).attr('data-id'))
        let user = usersData.find(u => u.id === userId)
        updateUsersModal(user)
    })
    $('#modal-update').click(function() {
        let alert = $('#modal-update-alert')

        // get inputs value
        let newValues = getUpdateModalInputs()
        
        // check all inputs have value
        let checkedValues = checkObjectValues(newValues)
        if (!checkedValues.pass) {
            $(alert).text(checkedValues.message).show()
            return
        }

        // update user
        let updated = update(usersData, newValues)
        if (!updated.success) {
            $(alert).text(updated.message).show()
            return
        }

        // hide alert
        $(alert).hide()

        // hide modal
        let modalInstance = bootstrap.Modal.getInstance($('#modal-users-detail'))
        modalInstance.hide()

        // update HTML
        paginator(usersData, currentPage)
    })
    $('#modal-delete').click(function() {
        let alert = $('#modal-update-alert')

        // get user's id
        let userId = Number($(this).attr('data-id'))
        if (isNaN(userId)) {
            $(alert).text('The ID is not correct!').show()
            return
        }

        // remove user
        let removed = remove(usersData, userId)
        if (!removed.success) {
            $(alert).text(removed.message).show()
            return
        }

        // hide alert
        $(alert).hide()

        // hide modal
        let modalInstance = bootstrap.Modal.getInstance($('#modal-users-detail'))
        modalInstance.hide()

        // update HTML
        paginator(usersData, currentPage)
    })
    $('#modal-create').click(function() {
        let alert = $('#modal-create-alert')

        // get inputs value
        let newValues = getCreateModalInputs()

        // check all inputs have value
        let checkedValues = checkObjectValues(newValues)
        if (!checkedValues.pass) {
            $(alert).text(checkedValues.message).show()
            return
        }

        // create user
        let created = create(usersData, newValues)
        if (!created.success) {
            $(alert).text(created.message).show()
            return
        }
        
        console.log(usersData)

        // hide alert
        $(alert).hide()

        // hide modal
        let modalInstance = bootstrap.Modal.getInstance($('#modal-create-user'))
        modalInstance.hide()

        // update HTML
        paginator(usersData, currentPage)
    })
    $('#create-user').click(function() {
        $('#modal-create-alert').hide()
        emptyCreateModalInputs()
    })
})