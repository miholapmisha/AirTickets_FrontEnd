const urlParams = new URLSearchParams(window.location.search);
const fromId = urlParams.get('from');
const toId = urlParams.get('to');
const departDate = urlParams.get('date');
const notFoundHTML = `<div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
                        <h1 style="color: gray">
                            Нічого не знайдено
                        </h1>
                      </div>`

$(document).ready(() => {
    handleProfileHREF()
    requestTicketsWithStops(fromId, toId, departDate)
})

const requestTicketsWithStops = (fromId, toId, departDate) => {
    const data = {
        fromId: fromId.split('.')[0], toId: toId.split('.')[0], departDate
    }
    const token = localStorage.getItem('authToken')
    $.ajax({
        url: `${BASE_ENDPOINT}/tickets/purchaseTEST`,
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (response) => {
            renderFlightBlocks(response)

        },
        error: (xhr) => {
            console.error('Помилка:', xhr.responseText);
        }
    });
}

const handleProfileHREF = () => {
    const token = localStorage.getItem('authToken');
    const profileHref = $('#profile-href');

    if (token) {
        profileHref.attr('href', '/profile');
    } else {
        profileHref.attr('href', '/login');
    }
}

const renderFlightBlocks = (response) => {
    const globalContainer = $('#ticket-stops-data')
    const ticketBlocks = Object.values(response.routes.routes).filter(array => Array.isArray(array) && array.length >= 2)
    if (ticketBlocks?.length <= 0 && response.routes.cheapestConnectingFlight?.length <= 0) {
        globalContainer.append(notFoundHTML)
    } else {
        if (response.routes.cheapestConnectingFlight) {
            globalContainer.append(getTicketsWithStopsWrapper(`Найдешевиший варіант`, flightsBlocks(response.routes.cheapestConnectingFlight)))
        }

        ticketBlocks.forEach((array) => {
            globalContainer.append(getTicketsWithStopsWrapper(`Квитки із ${array.length} пересадками`, flightsBlocks(array)))
        })
    }
}

const flightsBlocks = (flights) => {

    if (!flights?.length) {
        return notFoundHTML;
    }

    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const durationInMs = end - start;
        const hours = Math.floor(durationInMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationInMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return flights.map(flight => {
        const {
            flightToken,
            segments: {
                forward: { from: forwardFrom, to: forwardTo, carrier: forwardCarrier },
                backward
            },
            price: { total, currency, perTraveller }
        } = flight;

        const forwardDuration = calculateDuration(forwardFrom.departureDate, forwardTo.arrivalDate);

        let backwardSegmentHTML = '';
        if (backward) {
            const { from: backwardFrom, to: backwardTo } = backward;
            const backwardDuration = calculateDuration(backwardFrom.departureDate, backwardTo.arrivalDate);

            backwardSegmentHTML = `
                <div class="segment">
                    <h4>Назад:</h4>
                    <p>From: <strong>${backwardFrom.cityName}</strong>, <strong>${backwardFrom.countryName}</strong> (<strong>${backwardFrom.airportCode}</strong>)</p>
                    <p>To: <strong>${backwardTo.cityName}</strong>, <strong>${backwardTo.countryName}</strong> (<strong>${backwardTo.airportCode}</strong>)</p>
                    <p>Departure: <strong>${new Date(backwardFrom.departureDate).toLocaleString()}</strong></p>
                    <p>Arrival: <strong>${new Date(backwardTo.arrivalDate).toLocaleString()}</strong></p>
                    <h4>Duration: <strong>${backwardDuration}</strong></h4>
                </div>
            `;
        }

        return `
            <div class="flight-block" data-currency="${currency}" data-token="${flightToken}">
                <div class="carrier-logo">
                    <img src="${forwardCarrier.airline.logoImg}" alt="${forwardCarrier.airline.name}" title="${forwardCarrier.airline.name}" />
                </div>
                <div class="segment">
                    <h4>Вперед:</h4>
                    <p>From: <strong>${forwardFrom.cityName}</strong>, <strong>${forwardFrom.countryName}</strong> (<strong>${forwardFrom.airportCode}</strong>)</p>
                    <p>To: <strong>${forwardTo.cityName}</strong>, <strong>${forwardTo.countryName}</strong> (<strong>${forwardTo.airportCode}</strong>)</p>
                    <p>Departure: <strong>${new Date(forwardFrom.departureDate).toLocaleString()}</strong></p>
                    <p>Arrival: <strong>${new Date(forwardTo.arrivalDate).toLocaleString()}</strong></p>
                    <h4>Duration: <strong>${forwardDuration}</strong></h4>
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
                    <button class="price-button" onclick="handlePriceButtonClick('${flightToken}')">Купити</button>
                </div>
            </div>
        `;
    }).join('');

};
const getTicketsWithStopsWrapper = (sectionTitle, flightBlockHTML) => {

    return `
        <div class="flight-wrapper">
            <div>
                <h2>${sectionTitle}</h2>
            </div>
            ${flightBlockHTML}
        </div>
    `;;
}