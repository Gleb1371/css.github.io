document.addEventListener('DOMContentLoaded', function() {
    const teachersList = document.getElementById('teachersList');

    // Функция для получения списка преподавателей
    function fetchTeachers() {
        fetch('/users')
            .then(response => response.json())
            .then(data => {
                console.log('Received data:', data); // Проверка данных, полученных с сервера
                const filteredTeachers = data.users.filter(user => user.role === 'teacher');
                
                renderTeachers(filteredTeachers);
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    }
    
    fetchTeachers();
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Функция для подтверждения удаления преподавателя
    window.confirmDelete = function(login) {
        console.log(`Подтверждение удаления преподавателя с логином: ${login}`);
        $('#confirmDeleteModal').modal('show');
        document.getElementById('confirmDeleteModal').dataset.login = login;
    };
    
    // Функция для удаления преподавателя
    window.deleteTeacher = function() {
        const login = document.getElementById('confirmDeleteModal').dataset.login;
        console.log(login);
        fetch(`/users/${login}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(() => {
            fetchTeachers();
            $('#confirmDeleteModal').modal('hide');
            alert('Преподаватель успешно удален!');
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при удалении преподавателя.');
        });
    };
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Функция для отображения списка преподавателей
function renderTeachers(teachers) {
    const teachersList = document.getElementById('teachersList');
    teachersList.innerHTML = '';
    teachers.forEach(function(teacher) {
        console.log('Rendering teacher:', teacher); // Проверка данных преподавателя перед отображением
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${teacher.login || 'N/A'}</td>
            <td>${teacher.password || 'N/A'}</td>
            <td>${teacher.first_name || 'N/A'}</td>
            <td>${teacher.phone_number || 'N/A'}</td>
            <td><button class="btn btn-primary" data-toggle="modal" data-target="#editTeacherModal" onclick="openEditTeacherModal('${teacher.login}')">Редактировать</button></td>
            <td><button class="btn btn-danger" onclick="confirmDelete('${teacher.login}')">Удалить</button></td>
        `;
        teachersList.appendChild(row);
    });
}

// Функция для получения списка преподавателей
function fetchTeachers() {
    fetch('/users')
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data); // Проверка данных, полученных с сервера
            const filteredTeachers = data.users.filter(user => user.role === 'teacher');
            
            renderTeachers(filteredTeachers); // Вызов функции renderTeachers()
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Добавляем обработчик события клика на кнопку добавления преподавателя
const addTeacherButton = document.querySelector('.btn.btn-primary');
addTeacherButton.addEventListener('click', openAddTeacherModal);

function openAddTeacherModal() {
    $('#addTeacherModal').modal('show');
}

const addTeacherForm = document.getElementById('addTeacherForm');
addTeacherForm.addEventListener('submit', function(event) {
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

    const newTeacher = {
        login: enteredUsername,
        password: enteredPassword,
        first_name: enteredFullname,
        phone_number: enteredPhone,
        role: 'teacher'
    };

    fetch('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTeacher),
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
        fetchTeachers(); // Обновляем список преподавателей после добавления нового
        alert('Преподаватель успешно добавлен!');
        $('#addTeacherModal').modal('hide');
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

window.openEditTeacherModal = function(login) {
    fetch(`/users/${login}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('editUsername').value = data.login;
            document.getElementById('editPassword').value = data.password;
            document.getElementById('editFullname').value = data.first_name;
            document.getElementById('editPhone').value = data.phone_number;
            $('#editTeacherModal').modal('show');

            // Добавляем обработчик события на отправку формы
            document.getElementById('editTeacherForm').onsubmit = function(event) {
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

                const updatedTeacher = {
                    login: enteredUsername,
                    password: enteredPassword,
                    first_name: enteredFullname,
                    phone_number: enteredPhone,
                    role: 'teacher'
                };

                fetch(`/users/${login}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedTeacher),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка при обновлении информации о преподавателе');
                    }
                    return response.json();
                })
                .then(() => {
                    fetchTeachers(); // Обновляем список преподавателей после редактирования
                    alert('Преподаватель успешно отредактирован!');
                    $('#editTeacherModal').modal('hide');
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    alert('Произошла ошибка при обновлении информации о преподавателе.');
                });
            };
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при получении данных преподавателя.');
        });
};