const urlParams = new URLSearchParams(window.location.search);
const fromId = urlParams.get('from');
const toId = urlParams.get('to');
const date = urlParams.get('date');
const fromName = urlParams.get('fromName');
const toName = urlParams.get('toName');
const arrivalAirportInput = $('#arrival-airport');
const departureAirportInput = $('#departure-airport');
const travelDateInput = $('#travel-date');

const notFoundHTML = `<div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
                        <h1 style="color: gray">
                            Нічого не знайдено
                        </h1>
                      </div>`

let walletInfo = null;

$(document).ready(() => {
    const token = localStorage.getItem('authToken');
    const profileHref = $('#profile-href');

    if (token) {
        profileHref.attr('href', '/profile');
    } else {
        profileHref.attr('href', '/login');
    }

    initialFlightLoadData()
})

const initialFlightLoadData = () => {
    if (fromId && toId && date) {
        const [month, day, year] = date.split('/').map(num => parseInt(num, 10));
        const parsedDate = new Date(year, month - 1, day + 1);
        const formattedDate = parsedDate.toISOString().split('T')[0];
        const requestBody = {
            fromId: fromId,
            toId: toId,
            departDate: formattedDate,
            pageNo: 1,
            adults: 1,
            children: '',
            sort: '',
            cabinClass: '',
            currencyCode: 'USD'
        }
        requestFlights(requestBody, renderFlights)
    } else {
        $('#flights-container').append(notFoundHTML)
    }

    const applyFilterButton = $('#apply-filter-submit-button')
    applyFilterButton.on('click', () => {
        applyFilters()
    })
}

const requestFlights = (requestBody, callback) => {
    $.ajax({
        url: `${BASE_ENDPOINT}/flights`,
        type: 'POST',
        data: JSON.stringify(requestBody),
        contentType: 'application/json',
        success: (response) => {
            console.log("Success: ", response.data)
            callback(response.data)
        },
        error: (error) => {

            console.log('Error:', error);
        }
    });
}

const applyFilters = () => {
    const adults = $('#adults')
    const children = $('#children')
    const travelClass = $('#class')
    const sortOption = $('#sort')
    const filterObject = {
        fromId: departureAirportInput.attr('data-id'),
        toId: arrivalAirportInput.attr('data-id'),
        departDate: travelDateInput.val(),
        adults: Number(adults.val()),
        children: '17,'.repeat(Number(children.val())).slice(0, -1),
        sort: sortOption.val(),
        cabinClass: travelClass.val(),
        currenyCode: 'USD'
    }
    console.log(filterObject)
    requestFlights(filterObject, renderFlights)
}

const renderFlights = (flights) => {
    const container = $('#flights-container');
    const fromPlaceholder = $('#from-placeholder')
    const toPlaceholder = $('#to-placeholder')
    container.empty();

    if (!flights?.length) {
        container.append(notFoundHTML);
        return
    }

    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const durationInMs = end - start;
        const hours = Math.floor(durationInMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationInMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    if (flights[0] && flights[0].segments.forward.from.cityName && flights[0].segments.forward.to.cityName) {
        fromPlaceholder.text(flights[0].segments.forward.from.cityName);
        toPlaceholder.text(flights[0].segments.forward.to.cityName);
    }

    if (fromName && toName && date) {
        const adjustedDate = new Date(date);
        adjustedDate.setDate(adjustedDate.getDate() + 1);
        const formattedDate = adjustedDate.toISOString().split('T')[0];

        travelDateInput.attr('data-id', adjustedDate.toISOString());
        travelDateInput.val(formattedDate);

        arrivalAirportInput.attr('data-id', toId)
        arrivalAirportInput.val(toName)

        departureAirportInput.attr('data-id', fromId)
        departureAirportInput.val(fromName)
    }

    flights.forEach(flight => {
        const {
            flightToken,
            segments: {
                forward: { from: forwardFrom, to: forwardTo, carrier: forwardCarrier },
                backward
            },
            price: { total, currency, perTraveller }
        } = flight;

        let backwardSegmentHTML = '';
        let backwardDuration = '';
        const forwardDuration = calculateDuration(forwardFrom.departureDate, forwardTo.arrivalDate);

        if (backward) {
            const backwardFrom = backward.from;
            const backwardTo = backward.to;

            backwardDuration = calculateDuration(backwardFrom.departureDate, backwardTo.arrivalDate);

            backwardSegmentHTML = `
            <div class="segment">
                <h4>Назад:</h4>
                <p>From: <strong>${backwardFrom.cityName}</strong>, <strong>${backwardFrom.countryName}</strong> (<strong>${backwardFrom.airportCode}</strong>)</p>
                <p>To: <strong>${backwardTo.cityName}</strong>, <strong>${backwardTo.countryName}</strong> (<strong>${backwardTo.airportCode}</strong>)</p>
                <p>Departure: <strong>${new Date(backwardFrom.departureDate).toLocaleString()}</strong></p>
                <p>Arrival: <strong>${new Date(backwardTo.arrivalDate).toLocaleString()}</strong></p>
                <h5>Duration: <strong>${backwardDuration}</strong></h5>
            </div>
        `;
        }

        const flightBlockHTML = `
        <div class="flight-block" data-currency=${currency} data-token="${flightToken}">
            <div class="carrier-logo">
                <img src="${forwardCarrier.airline.logoImg}" alt="${forwardCarrier.airline.name}" title="${forwardCarrier.airline.name}" />
            </div>
            <div class="segment">
                <h4>Вперед:</h4>
                <p>From: <strong>${forwardFrom.cityName}</strong>, <strong>${forwardFrom.countryName}</strong> (<strong>${forwardFrom.airportCode}</strong>)</p>
                <p>To: <strong>${forwardTo.cityName}</strong>, <strong>${forwardTo.countryName}</strong> (<strong>${forwardTo.airportCode}</strong>)</p>
                <p>Departure: <strong>${new Date(forwardFrom.departureDate).toLocaleString()}</strong></p>
                <p>Arrival: <strong>${new Date(forwardTo.arrivalDate).toLocaleString()}</strong></p>
                <h5>Duration: <strong>${forwardDuration}</strong></h5>
            </div>
            ${backwardSegmentHTML}
            <div class="price-per-traveller">
                ${perTraveller.map((traveller, index) => `
                    <div class="price-circle">
                        ${traveller.total} ${traveller.currency}
                    </div>
                `).join('')}
            </div>
            <div class="price">
                <button class="price-button">Купити</button>
            </div>
        </div>
    `;

        const flightBlock = $($.parseHTML(flightBlockHTML));

        flightBlock.find('.price-button').on('click', async (event) => {
            event.stopPropagation();

            try {
                const response = await fetchWalletBalance();
                if (!localStorage.getItem('authToken') || !response.wallet.balance) {
                    window.location.href = `${window.location.origin}/login`;
                    return;
                }

                const userBalance = parseFloat(response.wallet.balance || 0);
                const ticketPrice = total;

                $('#user-balance').text(userBalance.toFixed(2));
                $('#ticket-price').text(ticketPrice.toFixed(2));
                $('#confirmation-modal').fadeIn();

                $('#confirm-purchase').off('click').on('click', () => {
                    if (userBalance >= ticketPrice) {
                        purchaseTicket(ticketPrice, flightToken, (response) => { $('#confirmation-modal').fadeOut(); });
                    } else {
                        alert('Недостатньо коштів!');
                    }
                });
            } catch (error) {
                window.location.href = `${window.location.origin}/login`
            }
        });

        $('#cancel-purchase, #close-modal').on('click', () => {
            $('#confirmation-modal').fadeOut();
        });

        container.append(flightBlock);
    });


};

const fetchWalletBalance = () => {
    const token = localStorage.getItem('authToken') || '';
    return $.ajax({
        url: `${BASE_ENDPOINT}/wallet`,
        type: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    });
};

const purchaseTicket = async (ticketPrice, flightId, callback) => {
    const token = localStorage.getItem('authToken')
    $.ajax({
        url: `${BASE_ENDPOINT}/tickets/purchase`,
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        contentType: 'application/json',
        data: JSON.stringify({
            price: ticketPrice,
            flightId: flightId
        }),
        success: (response) => {
            alert('Квиток успішно придбано!');
            callback(response)
        },
        error: (xhr) => {
            console.error('Помилка покупки квитка:', xhr.responseText);
            alert('Не вдалося придбати квиток. Спробуйте ще раз.');
        }
    });
}

const sendFlightData = (token, currency) => {
    const requestBody = {
        token: token,
        currencyCode: currency
    };

    $.ajax({
        url: `${BASE_ENDPOINT}/flights/single-flight`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestBody),
        success: (response) => {
            console.log('Success:', response);
        },
        error: (xhr, status, error) => {
            console.error('Error:', xhr.responseText || error);
        }
    });
}