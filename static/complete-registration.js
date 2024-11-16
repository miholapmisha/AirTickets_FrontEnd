const BASE_ENDPOINT = 'http://localhost:8000';

const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email') || '';

$(document).ready(() => {
    const form = $('#complete-registration-form');
    const nameInput = $('#name-input');
    const surnameInput = $('#surname-input');
    const phoneInput = $('#phone-input');
    const addressInput = $('#address-input');
    const errorHolder = $('#registration-error-holder');

    form.on('submit', (e) => {
        e.preventDefault();
        errorHolder.empty();

        const name = nameInput.val().trim();
        const surname = surnameInput.val().trim();
        const phone = phoneInput.val().trim();
        const address = addressInput.val().trim();

        const errors = [];

        if (name.length < 2) {
            errors.push('Ім’я повинно містити щонайменше 2 символи.');
        }

        if (surname.length < 2) {
            errors.push('Прізвище повинно містити щонайменше 2 символи.');
        }

        const phoneRegex = /^380\d{9}$/;
        if (!phoneRegex.test(phone)) {
            errors.push('Телефон повинен починатися з "380" і містити 12 цифр.');
        }

        if (address.length < 5) {
            errors.push('Адреса повинна містити щонайменше 5 символів.');
        }

        if (errors.length > 0) {
            errorHolder.html(errors.join('<br>'));
            errorHolder.show();
            return;
        }

        const requestBody = {
            email: email,
            name: name,
            surname: surname,
            phone: phone,
            address: address,
        };

        $.ajax({
            url: `${BASE_ENDPOINT}/auth/complete-registration`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestBody),
            success: (response) => {
                const token = response.token;
                if (token) {
                    localStorage.setItem('authToken', token);
                    window.location.href = `${window.location.origin}/`
                } else {
                    errorHolder.html('Не вдалося пітдвердити реєстрацію');
                    errorHolder.show();
                }
            },
            error: (err) => {
                let errorMessage = err.message === 'User with this email already exists' ? 'Користувач вже існує з таким email' : 'Не вдалося зареєструвати. Спробуйте пізніше.';

                errorHolder.html(errorMessage);
                errorHolder.show();
            },
        });
    });
});
