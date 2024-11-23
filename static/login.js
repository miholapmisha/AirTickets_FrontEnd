
$(document).ready(() => {
    const form = $('#login-form');
    const emailInput = $('#email');
    const passwordInput = $('#password');
    const errorHolder = $('#login-error-holder');
    const submitButton = form.find('input[type="submit"]');
    const loader = $('.loader');

    form.on('submit', (e) => {
        e.preventDefault();
        errorHolder.empty();
        const email = emailInput.val().trim();
        const password = passwordInput.val().trim();

        submitButton.prop('disabled', true);
        loader.show();

        $.ajax({
            url: `${BASE_ENDPOINT}/auth/login`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                email: email,
                password: password
            }),
            success: (response) => {
                if (response.token) {
                    localStorage.setItem('authToken', response.token);
                    window.location.href = `${window.location.origin}/profile`;
                } else {
                    errorHolder.text('Помилка виникла під час входу, спробуйте пізніше.');
                }
            },
            error: (xhr) => {
                if (xhr.status === 401) {
                    errorHolder.text('Невірний логін або пароль.');
                } else {
                    errorHolder.text('Помилка виникла під час входу, спробуйте пізніше.');
                }
                errorHolder.show();
            },
            complete: () => {
                submitButton.prop('disabled', false);
                loader.hide();
            }
        });
    });
});
