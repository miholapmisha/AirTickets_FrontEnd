const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email') || '';

$(document).ready(() => {
    const confirmForm = $('#confirm-form')
    const verificationCodeInput = $('#verification-code-input')
    const errorHolder = $('#confirmation-error-holder')

    errorHolder.empty();
    confirmForm.on('submit', (e) => {
        e.preventDefault();
        errorHolder.hide().empty();

        const code = verificationCodeInput.val().trim();

        $.ajax({
            url: `${BASE_ENDPOINT}/auth/verify`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                email: email,
                code: code
            }),
            success: (response) => {
                window.location.href = `${window.location.origin}/complete-registration?email=${email}`
            },
            error: (err) => {
                errorHolder.text('Не вдалось підтвердити пошту, спробуйте пізніше').fadeIn();
            }
        });
    });
})