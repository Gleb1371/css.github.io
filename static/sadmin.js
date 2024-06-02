document.addEventListener('DOMContentLoaded', function() {
    const adminsList = document.getElementById('adminsList');

    // Функция для получения списка Администраторов
    function fetchAdmins() {
        fetch('/users')
            .then(response => response.json())
            .then(data => {
                console.log('Received data:', data); // Проверка данных, полученных с сервера
                const filteredAdmins = data.users.filter(user => user.role === 'admin');
                
                renderAdmins(filteredAdmins);
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    }
    
    fetchAdmins();
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Функция для подтверждения удаления Администратора
    window.confirmDelete = function(login) {
        console.log(`Подтверждение удаления администратора с логином: ${login}`);
        $('#confirmDeleteModal').modal('show');
        document.getElementById('confirmDeleteModal').dataset.login = login;
    };
    
    // Функция для удаления Администратора
    window.deleteAdmin = function() {
        const login = document.getElementById('confirmDeleteModal').dataset.login;
        console.log(login);
        fetch(`/users/${login}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(() => {
            fetchAdmins();
            $('#confirmDeleteModal').modal('hide');
            alert('Администратор успешно удален!');
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при удалении администратора.');
        });
    };
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Функция для отображения списка Администраторов
function renderAdmins(admins) {
    const adminsList = document.getElementById('adminsList');
    adminsList.innerHTML = '';
    admins.forEach(function(admin) {
        console.log('Rendering admin:', admin); // Проверка данных Администратора перед отображением
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${admin.login || 'N/A'}</td>
            <td>${admin.password || 'N/A'}</td>
            <td>${admin.first_name || 'N/A'}</td>
            <td>${admin.phone_number || 'N/A'}</td>
            <td><button class="btn btn-primary" data-toggle="modal" data-target="#editAdminModal" onclick="openEditAdminModal('${admin.login}')">Редактировать</button></td>
            <td><button class="btn btn-danger" onclick="confirmDelete('${admin.login}')">Удалить</button></td>
        `;
        adminsList.appendChild(row);
    });
}

// Функция для получения списка Администраторов
function fetchAdmins() {
    fetch('/users')
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data); // Проверка данных, полученных с сервера
            const filteredAdmins = data.users.filter(user => user.role === 'admin');
            
            renderAdmins(filteredAdmins); // Вызов функции renderAdmins()
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Добавляем обработчик события клика на кнопку добавления Администратора
const addAdminButton = document.querySelector('.btn.btn-primary');
addAdminButton.addEventListener('click', openAddAdminModal);

function openAddAdminModal() {
    $('#addAdminModal').modal('show');
}

const addAdminForm = document.getElementById('addAdminForm');
addAdminForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const fullnameInput = document.getElementById('fullname');
    const phoneInput = document.getElementById('phone');

    const enteredUsername = usernameInput.value.trim();
    const enteredPassword = passwordInput.value.trim();
    const enteredFullname = fullnameInput.value.trim();
    const enteredPhone = phoneInput.value.trim();

    if (!enteredUsername || !enteredPassword || !enteredFullname || !enteredPhone) {
        alert('Пожалуйста, заполните все поля!');
        return;
    }

    if (!isValidPhoneNumber(enteredPhone)) {
        alert('Пожалуйста, введите корректный номер телефона!');
        return;
    }

    const newAdmin = {
        login: enteredUsername,
        password: enteredPassword,
        first_name: enteredFullname,
        phone_number: enteredPhone,
        role: 'admin'
    };

    fetch('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdmin),
    })
    .then(response => {
        if (response.status === 400) {
            return response.json().then(data => {
                throw new Error(data.detail || 'Ошибка сервера: ' + response.status);
            });
        }
        if (!response.ok) {
            throw new Error('Ошибка сервера: ' + response.status);
        }
        return response.json();
    })
    .then(() => {
        fetchAdmins(); // Обновляем список Администраторов после добавления нового
        alert('Администратор успешно добавлен!');
        $('#addAdminModal').modal('hide');
        usernameInput.value = '';
        passwordInput.value = '';
        fullnameInput.value = '';
        phoneInput.value = '';
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Пользователь с таким логином уже существует!');
    });
});

function isValidPhoneNumber(phoneNumber) {
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
    return cleanedPhoneNumber.length === 11 && /^\d+$/.test(cleanedPhoneNumber);
}

document.addEventListener('input', function(event) {
    const target = event.target;
    if (target.tagName === 'INPUT' && target.getAttribute('name') === 'phone') {
        target.value = target.value.replace(/\D/g, '');
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.openEditAdminModal = function(login) {
    fetch(`/users/${login}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('editUsername').value = data.login;
            document.getElementById('editPassword').value = data.password;
            document.getElementById('editFullname').value = data.first_name;
            document.getElementById('editPhone').value = data.phone_number;
            $('#editAdminModal').modal('show');

            // Добавляем обработчик события на отправку формы
            document.getElementById('editAdminForm').onsubmit = function(event) {
                event.preventDefault();

                const usernameInput = document.getElementById('editUsername');
                const passwordInput = document.getElementById('editPassword');
                const fullnameInput = document.getElementById('editFullname');
                const phoneInput = document.getElementById('editPhone');

                const enteredUsername = usernameInput.value.trim();
                const enteredPassword = passwordInput.value.trim();
                const enteredFullname = fullnameInput.value.trim();
                const enteredPhone = phoneInput.value.trim();

                if (!enteredUsername || !enteredPassword || !enteredFullname || !enteredPhone) {
                    alert('Пожалуйста, заполните все поля!');
                    return;
                }

                if (enteredPhone.length !== 11) {
                    alert('Пожалуйста, введите корректный номер телефона!');
                    return;
                }

                const updatedAdmin = {
                    login: enteredUsername,
                    password: enteredPassword,
                    first_name: enteredFullname,
                    phone_number: enteredPhone,
                    role: 'admin'
                };

                fetch(`/users/${login}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedAdmin),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка при обновлении информации о администраторе');
                    }
                    return response.json();
                })
                .then(() => {
                    fetchAdmins(); // Обновляем список Администраторов после редактирования
                    alert('Администратор успешно отредактирован!');
                    $('#editAdminModal').modal('hide');
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    alert('Произошла ошибка при обновлении информации об администраторе.');
                });
            };
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при получении данных администратора.');
        });
};