$(document).ready(() => {
    const BASE_URL = `${BASE_ENDPOINT}/flights/airports`;
    let timeout;

    const token = localStorage.getItem('authToken');
    const profileHref = $('#profile-href');

    if (token) {
        profileHref.attr('href', '/profile');
    } else {
        profileHref.attr('href', '/login');
    }

    const createDropdown = (inputElement, data) => {
        $('.dropdown-list').remove();

        const dropdown = $('<div class="dropdown-list"></div>');

        data.forEach(item => {
            const dropdownItem = $(`<div class="dropdown-item">${item.airportName}</div>`);
            dropdownItem.on('click', function () {
                inputElement.val(item.airportName);
                inputElement.attr('data-id', item.airportId);
                $('.dropdown-list').remove();
            });
            dropdown.append(dropdownItem);
        });

        inputElement.after(dropdown);
    }

    const fetchAirports = (query, inputElement) => {
        if (!query) {
            $('.dropdown-list').remove();
            return;
        }

        $.ajax({
            url: BASE_URL,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ query: query }),
            success: function (response) {
                createDropdown(inputElement, response.data);
            },
            error: function (error) {
                console.log('Error fetching airport data:', error);
            }
        });
    }

    const handleInputChange = (inputElement) => {
        const query = inputElement.val();
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fetchAirports(query, inputElement);
        }, 600);
    }

    $('#departure-airport').on('input', function () {
        handleInputChange($(this));
    });

    $('#arrival-airport').on('input', function () {
        handleInputChange($(this));
    });

    $(document).on('click', function (event) {
        if (!$(event.target).closest('.u-input, .dropdown-list').length) {
            $('.dropdown-list').remove();
        }
    });

    $('#tickets-form').on('submit', (event) => {
        event.preventDefault();

        const departureId = $('#departure-airport').attr('data-id');
        const arrivalId = $('#arrival-airport').attr('data-id');
        const date = $('#travel-date').val();
        const arrivalName = $('#arrival-airport').val();
        const departureName = $('#departure-airport').val();

        if (departureId && arrivalId && departureId !== '' && arrivalId !== '') {
            window.location.href = window.location.origin + `/flights?from=${departureId}&to=${arrivalId}&date=${date}&fromName=${departureName}&toName=${arrivalName}`;
        } else {
            window.location.href = window.location.origin + `/flights`;
        }
    });
});