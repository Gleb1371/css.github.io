function clientpost(event) {
    var phone = document.getElementById("phone").value;
    var first_name = document.getElementById("name").value;
    var zapros = new XMLHttpRequest();
    zapros.open("POST", "/clients", true);
    zapros.setRequestHeader("Content-Type", "application/json");
    if (phone.length == 11 && first_name > '') {
        zapros.onload = function () {
            if (zapros.status === 200) {
                showSuccess("Спасибо, мы вам перезвоним!");
            }
            else {
                // Обработка ошибок
                try {
                    var errorResponse = JSON.parse(zapros.responseText);
                    if (errorResponse.error) {
                        alert("Ошибка: " + errorResponse.error);
                    } else {
                        showError("Такие данные уже существуют.");
                    }
                }
                catch (error) {
                    showError("Произошла ошибка. Пожалуйста, попробуйте еще раз.");
                }
            }
        };
        zapros.send(JSON.stringify({
            phone_number: phone,
            first_name: first_name,
            role: 'classes'
        }));
    }
    else {
        if (first_name > '' && phone.length > 0) {
            showError("Некорректный номер телефона!");
        }
        else if (first_name > '' && phone.length == "") {
            showError("Пожалуйста, введите номер телефона!");
        }

        else if (phone.length == 11 && first_name == 0) {
            showError("Пожалуйста, введите имя!");
        }
        else {
            showError("Пожалуйста, заполните поля!");

        }
    }
}



function post1() {
    var zapros = new XMLHttpRequest();
    var modalBtn = document.getElementById("modalBtn");
    var modal = document.getElementById("myModal");
    var closeBtn = document.querySelector(".modal-content .close");
    var nameInput = document.getElementById('nameModal');
    var phoneInput = document.getElementById('phoneModal');
    var submitBtn = document.getElementById('submitBtn');

    modalBtn.addEventListener("click", function () {
        modal.style.display = "block";
    });

    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });


    submitBtn.addEventListener("click", function (event) {
        event.preventDefault();
        var first_name = nameInput.value.trim();
        var phone = phoneInput.value.trim();
        var errorAlert1 = document.getElementById('errorAlert1');
        var successAlert1 = document.getElementById('successAlert1');
        zapros.open("POST", "/clients", true);
        zapros.setRequestHeader("Content-Type", "application/json");
        if (phone.length == 11 && first_name > '') {
            zapros.onload = function () {
                if (zapros.status === 200) {
                    showSuccess("Спасибо,мы вам перезвоним!");
                } else {
                    try {
                        var errorResponse = JSON.parse(zapros.responseText);
                        if (errorResponse.error) {
                            alert("Ошибка: " + errorResponse.error);
                        } else {
                            showError("Такие данные уже существуют.");
                        }
                    } catch (error) {
                        showError("Произошла ошибка. Пожалуйста, попробуйте еще раз.");
                    }
                }
            };
            zapros.send(JSON.stringify({
                phone_number: phone,
                first_name: first_name,
                role: 'trips'
            }));
        }
        else {
            if (first_name > '' && phone.length > 0) {
                showError("Некорректный номер телефона!");
            }
            else if (first_name > '' && phone.length == "") {
                showError("Пожалуйста, введите номер телефона!");
            }

            else if (phone.length == 11 && first_name == 0) {
                showError("Пожалуйста, введите имя!");
            }
            else {
                showError("Пожалуйста, заполните поля!");

            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    post1(); // Вызываем функцию для инициализации обработчиков событий
});



function showError(message) {
    errorAlert.textContent = message;
    errorAlert.classList.add('active');
    successAlert.textContent = "";
    successAlert.classList.remove('active');
}

function showSuccess(message) {
    successAlert.textContent = message;
    successAlert.classList.add('active');
    errorAlert.textContent = "";
    errorAlert.classList.remove('active');
}
function showError(message) {
    errorAlert1.textContent = message;
    errorAlert1.classList.add('active');
    successAlert1.textContent = "";
    successAlert1.classList.remove('active');
}

function showSuccess(message) {
    successAlert1.textContent = message;
    successAlert1.classList.add('active');
    errorAlert1.textContent = "";
    errorAlert1.classList.remove('active');
}