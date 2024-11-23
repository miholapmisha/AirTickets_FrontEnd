const modalHTML = `
            <div id="wallet-topup-modal" style="
                position: fixed; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%); 
                width: 300px; 
                background: white; 
                padding: 20px; 
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
                border-radius: 10px; 
                z-index: 1000;">
                <h3 style="margin-bottom: 15px;">Поповнення балансу</h3>
                <input id="topup-amount" type="number" placeholder="Сума" style="
                    width: 100%; 
                    padding: 10px; 
                    margin-bottom: 15px; 
                    border: 1px solid #ccc; 
                    border-radius: 5px;">
                <button id="save-topup-button" style="
                    width: 100%; 
                    background-color: red; 
                    color: white; 
                    padding: 10px; 
                    border: none; 
                    border-radius: 5px; 
                    cursor: pointer;">Зберегти</button>
            </div>
            <div id="modal-backdrop" style="
                position: fixed; 
                top: 0; 
                left: 0; 
                width: 100%; 
                height: 100%; 
                background: rgba(0, 0, 0, 0.5); 
                z-index: 999;"></div>
            `;

$(document).ready(() => {
    const topUpWalletButton = $('#top-up-wallet-button')
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = '/login';
        return;
    }

    $.ajax({
        url: `${BASE_ENDPOINT}/user/profile-information`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            Authorization: `Bearer ${token}`
        },
        success: (response) => {
            if (response.message === 'User found') {
                const user = response.user;

                $('.u-text-2').text(user.fullName.split(' ')[0]);
                $('.u-text-3').text(user.fullName.split(' ')[0]);
                $('.u-text-5').text(user.fullName.split(' ')[1]);
                $('.u-text-7').text(user.email);
                $('.u-text-9').text(user.phone);
                $('.u-text-11').eq(0).text(user.address);
                $('.u-text-11').eq(1).text(user.balance ? user.balance : 0);
                const flights = user.tickets.map(ticket => ({
                    flightToken: ticket.flightId.token,
                    segments: ticket.flightId.segments,
                    price: {
                        total: ticket.price,
                        currency: "USD",
                        perTraveller: ticket.perTraveller
                    }
                }));
                console.log(flights)
                renderFlights(flights);
            } else {
                console.error('Unexpected response:', response);
                alert('Failed to load user data.');
                window.location.href = `${window.location.origin}/login`
            }
        },
        error: (xhr) => {
            console.error('Error fetching user profile:', xhr.responseText);
            // localStorage.removeItem('authToken')
            // window.location.href = `${window.location.origin}/login`
        }
    });
    topUpWalletButton.on('click', () => { topUpWallet() });

});

const topUpWallet = () => {
    if ($('#wallet-topup-modal').length === 0) {

        $('body').append(modalHTML);
        $('#save-topup-button').on('click', () => {
            const amount = $('#topup-amount').val().trim();

            if (!amount || isNaN(amount) || amount <= 0) {
                alert('Будь ласка, введіть правильну суму.');
                return;
            }

            const token = localStorage.getItem('authToken');
            if (token) {
                $.ajax({
                    url: `${BASE_ENDPOINT}/wallet/top-up`,
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    contentType: 'application/json',
                    data: JSON.stringify({ topUpSum: parseFloat(amount) }),
                    success: (response) => {
                        $('.u-text-11').eq(1).text(response.wallet.balance);
                        $('#wallet-topup-modal, #modal-backdrop').remove();
                    },
                    error: (xhr) => {
                        alert('Помилка поповнення балансу.');
                        console.error(xhr.responseText);
                    }
                });

            } else {
                window.location.href = '/login';
            }
        });

        $('#modal-backdrop').on('click', () => {
            $('#wallet-topup-modal, #modal-backdrop').remove();
        });
    }
}

const renderFlights = (flights) => {
    const container = $('#flights-container');
    container.empty();

    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const durationInMs = end - start;
        const hours = Math.floor(durationInMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationInMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    flights.forEach(flight => {
        const {
            flightToken,
            segments: {
                forward: { from: forwardFrom, to: forwardTo },
                backward
            },
            price: { total, currency }
        } = flight;
        
        let backwardSegmentHTML = '';
        let backwardDuration = '';
        const forwardDuration = calculateDuration(forwardFrom.departueDate, forwardTo.arrivalDate);

        if (backward) {
            const backwardFrom = backward.from;
            const backwardTo = backward.to;

            backwardDuration = calculateDuration(backwardFrom.departueDate, backwardTo.arrivalDate);

            backwardSegmentHTML = `
                <div class="segment">
                    <h4>Назад:</h4>
                    <p>From: <strong>${backwardFrom.cityName}</strong>, <strong>${backwardFrom.countryName}</strong> (<strong>${backwardFrom.airportCode}</strong>)</p>
                    <p>To: <strong>${backwardTo.cityName}</strong>, <strong>${backwardTo.countryName}</strong> (<strong>${backwardTo.airportCode}</strong>)</p>
                    <p>Departure: <strong>${backwardFrom.departueDate ? new Date(backwardFrom.departueDate).toLocaleString() : ''}</strong></p>
                    <p>Arrival: <strong>${new Date(backwardTo.arrivalDate).toLocaleString()}</strong></p>
                    <h5>Duration: <strong>${backwardDuration === 'NaNh NaNm' ? '' : backwardDuration}</strong></h5>
                </div>
            `;
        }

        const flightBlockHTML = `
            <div class="flight-block" data-currency=${currency} data-token="${flightToken}">
                <div class="segment">
                    <h4>Вперед:</h4>
                    <p>From: <strong>${forwardFrom.cityName}</strong>, <strong>${forwardFrom.countryName}</strong> (<strong>${forwardFrom.airportCode}</strong>)</p>
                    <p>To: <strong>${forwardTo.cityName}</strong>, <strong>${forwardTo.countryName}</strong> (<strong>${forwardTo.airportCode}</strong>)</p>
                    <p>Departure: <strong>${new Date(forwardFrom.departueDate).toLocaleString()}</strong></p>
                    <p>Arrival: <strong>${new Date(forwardTo.arrivalDate).toLocaleString()}</strong></p>
                    <h5>Duration: <strong>${forwardDuration}</strong></h5>
                </div>
                ${backwardSegmentHTML}
                <div class="price">
                    <p>Ціна: <strong>${total} ${currency}</strong></p>
                    <button class="track">Відслідкувати</button>
                </div>
            </div>
        `;

        const flightBlock = $($.parseHTML(flightBlockHTML));

        flightBlock.find('.track').on('click', () => {
            console.log(`Tracking flight: ${flightToken}`);
            window.open(`${window.location.origin}/plane-tracking?flightToken=${flightToken}`);
        });
        container.append(flightBlock);
    });
};
