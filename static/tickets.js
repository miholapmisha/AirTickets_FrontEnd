const BASE_API = "http://localhost:8000";

const urlParams = new URLSearchParams(window.location.search);
const fromId = urlParams.get('from');
const toId = urlParams.get('to');
const date = urlParams.get('date');

$(document).ready(() => {
    if (fromId && toId && date) {

        const [month, day, year] = date.split('/').map(num => parseInt(num, 10));
        const parsedDate = new Date(year, month - 1, day + 1);
        const formattedDate = parsedDate.toISOString().split('T')[0];
        $.ajax({
            url: `${BASE_API}/flights`,
            type: 'POST',
            data: {
                fromId: fromId,
                toId: toId,
                departDate: formattedDate,
                pageNo: 1,
                adults: 1,
                children: '0,17',
                sort: 'BEST',
                cabinClass: 'ECONOMY',
                currencyCode: 'AED'
            },
            success: (response) => {
                // console.log('Success:', renderFlights(response.data.filter((item, index) => index < 2)));
                console.log("Success: ", response.data)
                renderFlights(response.data)
            },
            error: (error) => {
                console.log('Error:', error);
            }
        });

    }
})

const renderFlights = (flights) => {
    const container = $('#flights-container');
    const fromPlaceholder = $('#from-placeholder')
    const toPlaceholder = $('#to-placeholder')
    container.empty();

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

    flights.forEach(flight => {
        const {
            flightToken,
            segments: {
                forward: { from: forwardFrom, to: forwardTo },
                backward: { from: backwardFrom, to: backwardTo }
            },
            price: { total, currency, perTraveller }
        } = flight;

        const forwardDuration = calculateDuration(forwardFrom.departueDate, forwardTo.arrivalDate);
        const backwardDuration = calculateDuration(backwardFrom.departueDate, backwardTo.arrivalDate);

        const flightBlockHTML = `
            <div class="flight-block" data-currency=${currency} data-token="${flightToken}">
                <div class="segment">
                    <h4>Forward</h4>
                    <p><strong>From:</strong> ${forwardFrom.cityName}, ${forwardFrom.countryName} (${forwardFrom.airportCode})</p>
                    <p><strong>To:</strong> ${forwardTo.cityName}, ${forwardTo.countryName} (${forwardTo.airportCode})</p>
                    <p><strong>Departure:</strong> ${new Date(forwardFrom.departueDate).toLocaleString()}</p>
                    <p><strong>Arrival:</strong> ${new Date(forwardTo.arrivalDate).toLocaleString()}</p>
                    <h5><strong>Duration: </strong>${forwardDuration}</h5>
                </div>
                <div class="segment">
                    <h4>Backward</h4>
                    <p><strong>From:</strong> ${backwardFrom.cityName}, ${backwardFrom.countryName} (${backwardFrom.airportCode})</p>
                    <p><strong>To:</strong> ${backwardTo.cityName}, ${backwardTo.countryName} (${backwardTo.airportCode})</p>
                    <p><strong>Departure:</strong> ${new Date(backwardFrom.departueDate).toLocaleString()}</p>
                    <p><strong>Arrival:</strong> ${new Date(backwardTo.arrivalDate).toLocaleString()}</p>
                    <h5><strong>Duration: </strong>${backwardDuration}</h5>
                </div>
                <div class="price-per-traveller">
                        ${perTraveller.map((traveller, index) => `
                            <div class="price-circle">
                                ${traveller.total} ${traveller.currency}
                            </div>
                        `).join('')}
                    </div>
                <div class="price">
                    <button class="price-button">Buy</button>
                </div>
            </div>
            `;

        const flightBlock = $($.parseHTML(flightBlockHTML));

        flightBlock.find('.price-button').on('click', function (event) {
            event.stopPropagation();
            const selectedToken = $(this).closest('.flight-block').data('token');
            const selectedCurrency = $(this).closest('.flight-block').data('currency');
            sendFlightData(selectedToken, selectedCurrency);
        });

        container.append(flightBlock);
    });

};

const sendFlightData = (token, currency) => {
    const requestBody = {
        token: token,
        currencyCode: currency
    };

    $.ajax({
        url: `${BASE_API}/flights/single-flight`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestBody),
        success: function (response) {
            console.log('Success:', response);
        },
        error: function (xhr, status, error) {
            console.error('Error:', xhr.responseText || error);
        }
    });
}
