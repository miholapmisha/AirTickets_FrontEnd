const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const currency = urlParams.get('currency');

$(document).ready(() => {
    $.ajax({
        url: `${BASE_ENDPOINT}/flights/single-flight`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            token: token,
            currencyCode: currency
        }),
        success: (response) => {
            console.log('Flight data received:', response);
        },
        error: (xhr, status, error) => {
            console.error('Error fetching flight data:', error);
            console.error('Response:', xhr.responseText);
        }
    });
})