document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const enteredUsername = usernameInput.value.trim();
        const enteredPassword = passwordInput.value.trim();

        if (enteredUsername !== '' && enteredPassword !== '') {
            const userData = {
                login: enteredUsername,
                password: enteredPassword
            };

            fetch('/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.access_token) {
                    if (data.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else if (data.role === 'mainAdmin') {
                        window.location.href = '/mainAdmin.html';
                    } else {
                        window.location.href = '/static/LKMB.html';
                    }
                } else {
                    errorMessage.textContent = 'Неверные данные!';
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                errorMessage.textContent = 'Произошла ошибка. Попробуйте снова.';
            });
        } else {
            errorMessage.textContent = 'Введите данные!';
        }
    });
});
