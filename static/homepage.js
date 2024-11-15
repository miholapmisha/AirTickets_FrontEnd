
const BASE_API = 'http://localhost:8000'

$(document).ready(() => {
    const BASE_URL = `${BASE_API}/flights/airports`;

    function createDropdown(inputElement, data) {
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

    function fetchAirports(query, inputElement) {
        if (!query) {
            $('.dropdown-list').remove();
            return;
        }

        $.ajax({
            url: BASE_URL,
            type: 'POST',
            data: { query: query },
            success: function (response) {
                createDropdown(inputElement, response.data);
            },
            error: function (error) {
                console.log('Error fetching airport data:', error);
            }
        });
    }

    $('#text-08e1').on('input', function () {
        const query = $(this).val();
        fetchAirports(query, $(this));
    });

    $('#text-090d').on('input', function () {
        const query = $(this).val();
        fetchAirports(query, $(this));
    });

    $(document).on('click', function (event) {
        if (!$(event.target).closest('.u-input, .dropdown-list').length) {
            $('.dropdown-list').remove();
        }
    });

    $('#tickets-form').on('submit', (event) => {
        event.preventDefault();

        const departureId = $('#text-08e1').attr('data-id');
        const arrivalId = $('#text-090d').attr('data-id');
        const date = $('#date-241d').val();
        if (departureId && arrivalId && departureId !== '' && arrivalId !== '') {
            window.location.href = window.location.origin + `/tickets?from=${departureId}&to=${arrivalId}&date=${date}`;
        } else {
            window.location.href = window.location.origin + `/tickets`;
        }
    })
});

// $(document).ready(function () {
//     $('#tickets-form').on('submit', (event) => {
//         event.preventDefault();

//         const departure = $('#text-08e1').val();
//         const arrival = $('#text-090d').val();

//         const BASE_URL = `${BASE_API}/flights/airports`;

//         $.ajax({
//             url: BASE_URL,
//             type: 'GET',
//             data: { query: departure },
//             success: (departureData) => {
//                 console.log('Departure airport data:', departureData);

//                 $.ajax({
//                     url: BASE_URL,
//                     type: 'GET',
//                     data: { query: arrival },
//                     success: function (arrivalData) {
//                         console.log('Arrival airport data:', arrivalData)
//                     },
//                     error: function (error) {
//                         console.log('Error fetching arrival airport data:', error);
//                     }
//                 });
//             },
//             error: (error) => {
//                 console.log('Error fetching departure airport data:', error);
//             }
//         });
//     });
// });