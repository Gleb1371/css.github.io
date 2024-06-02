document.addEventListener('DOMContentLoaded', function() {
    const tripsList = document.getElementById('tripsList');

    // Функция для получения списка клиентов
    function fetchClients() {
        fetch('/clients')
            .then(response => response.json())
            .then(data => {
                console.log('Received data:', data); // Проверка данных, полученных с сервера
                const filteredClients = data.clients.filter(client => client.role === 'trips');
                
                renderClients(filteredClients);
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    }

    // Функция для отображения списка клиентов
    function renderClients(clients) {
        tripsList.innerHTML = '';
        clients.forEach(function(client) {
            console.log('Rendering client:', client); // Проверка данных клиента перед отображением
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${client.first_name || 'N/A'}</td>
                <td>${client.phone_number || 'N/A'}</td>
                <td><button class="btn btn-primary" data-toggle="modal" data-target="#editTripModal" onclick="openEditClientModal(${client.phone_number})">Редактировать</button></td>
                <td><button class="btn btn-danger" onclick="confirmDelete(${client.phone_number})">Удалить</button></td>
            `;
            tripsList.appendChild(row);
        });
    }
    
    fetchClients();
    
    // Функция для подтверждения удаления клиента
    window.confirmDelete = function(clientId) {
        console.log(`Подтверждение удаления клиента с ID: ${clientId}`);
        $('#confirmDeleteModal').modal('show');
        document.getElementById('confirmDeleteModal').dataset.clientId = clientId;
    };
    
    // Функция для удаления клиента
    window.deleteTrips = function() {
        const clientId = document.getElementById('confirmDeleteModal').dataset.clientId;
        console.log(clientId);
        fetch(`/clients/${clientId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(() => {
            fetchClients();
            $('#confirmDeleteModal').modal('hide');
            alert('Клиент успешно удален!');
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при удалении клиента.');
        });
    };

    // Функция для открытия модального окна редактирования клиента
    window.openEditClientModal = function(clientId) {
        fetch(`/clients/${clientId}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('editUsername').value = data.first_name;
                document.getElementById('editNumber').value = data.phone_number;
                document.getElementById('editTripForm').onsubmit = function(event) {
                    event.preventDefault();
                    const usernameInput = document.getElementById('editUsername');
                
                    const numberInput = document.getElementById('editNumber');
                    const enteredUsername = usernameInput.value.trim();
                    const enteredNumber = numberInput.value.trim();
                    if (!enteredUsername || !enteredNumber) {
                        alert('Пожалуйста, заполните все поля!');
                        return;
                    }
                    // Проверяем длину номера телефона
                    if (enteredNumber.length !== 11) {
                        alert('Пожалуйста, введите корректный номер телефона!');
                        return;
                    }
                    const updatedClient = { first_name: enteredUsername, phone_number: enteredNumber, role: 'trips' };
                    fetch(`/clients/${clientId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedClient)
                    })
                    .then(response => response.json())
                    .then(() => {
                        fetchClients();
                        alert('Клиент успешно отредактирован!');
                        $('#editTripModal').modal('hide');
                    })
                    .catch(error => {
                        console.error('Ошибка:', error);
                        alert('Произошла ошибка при редактировании клиента.');
                    });
                };
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при получении данных клиента.');
            });
    };

    // Обработчик события отправки формы для добавления клиента
    const addTripForm = document.getElementById('addTripForm');
    addTripForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const usernameInput = document.getElementById('username');
        const numberInput = document.getElementById('number');
        const enteredUsername = usernameInput.value.trim();
        const enteredNumber = numberInput.value.trim();
        if (!enteredUsername || !enteredNumber) {
            alert('Пожалуйста, заполните все поля!');
            return;
        }
        // Проверяем длину номера телефона
        if (enteredNumber.length !== 11) {
            alert('Пожалуйста, введите корректный номер телефона!');
            return;
        }
        const newClient = { first_name: enteredUsername, phone_number: enteredNumber, role: 'trips' };
        fetch('/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newClient)
        })
        .then(response => response.json())
        .then(() => {
            fetchClients();
            alert('Клиент успешно добавлен!');
            $('#addTripModal').modal('hide');
            usernameInput.value = '';
            numberInput.value = '';
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при добавлении клиента.');
        });
    });

    // Запрет ввода символов, кроме цифр, в полях ввода номера телефона
    // Получаем все элементы input с типом "tel"
    const phoneInputs = document.querySelectorAll('input[type="tel"]');

    // Добавляем обработчик события для каждого input
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Заменяем все символы, кроме цифр, на пустую строку
            this.value = this.value.replace(/\D/g, '');
        });
    });

});
