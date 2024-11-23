$(document).ready(() => {
    const form = $('#registration-form');
    const emailInput = $('#email-input');
    const passwordInput = $('#password-input');
    const confirmPasswordInput = $('#confirm-password-input');
    const errorHolder = $('#registration-error-holder');
    const submitButton = form.find('input[type="submit"]');
    const loader = $('.loader');

    form.on('submit', (e) => {
        e.preventDefault();
        errorHolder.empty();
        const email = emailInput.val().trim();
        const password = passwordInput.val().trim();
        const confirmPassword = confirmPasswordInput.val().trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorHolder.text('Будь ласка введіть правильну електронну пошту');
            errorHolder.show();
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            errorHolder.text('Пароль має містити принаймні 8 символів і включати велику літеру, малу літеру та цифру.');
            errorHolder.show();
            return;
        }

        if (password !== confirmPassword) {
            errorHolder.text('Паролі не співпадають');
            errorHolder.show();
            return;
        }

        errorHolder.hide();
        submitButton.prop('disabled', true);
        loader.show();

        $.ajax({
            url: `${BASE_ENDPOINT}/auth/register`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                email: email,
                password: password,
                confirmPassword: confirmPassword
            }),
            success: (response) => {
                form.trigger('reset');
                window.location.href = `${window.location.origin}/confirmation?email=${email}`
            },
            error: (xhr) => {
                errorHolder.text('Помилка виникла під час реєстрації, спробуйте пізніше');
                errorHolder.show();
            },
            complete: () => {
                submitButton.prop('disabled', false);
                loader.hide();
            }
        });
    });
});
