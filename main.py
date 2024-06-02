from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
import jwt
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional
SECRET_KEY = "praktika2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 90
from typing import List, Optional

app = FastAPI()

# Устанавливаем соединение с базой данных PostgreSQL через pgAdmin 4
connection = psycopg2.connect(
        host="localhost",
        port=5432,
        database= "hainan",
        user="postgres",
        password="password123"
    )
app.mount("/static", StaticFiles(directory="static"), name="static")
@app.get("/") 
def main(): 
    return FileResponse("index.html")
@app.get("/index.html") 
def main1(): 
    return FileResponse("index.html")
@app.get("/admin.html") 
def main2(): 
    return FileResponse("admin.html")
@app.get("/classes.html") 
def main3(): 
    return FileResponse("classes.html")
@app.get("/entarnal.html") 
def main4(): 
    return FileResponse("entarnal.html")
@app.get("/Certif.html") 
def main5(): 
    return FileResponse("Certif.html")
@app.get("/LKB.html") 
def main6(): 
    return FileResponse("LKB.html")
@app.get("/LKBM.html") 
def main7(): 
    return FileResponse("LKBM.html")
@app.get("/MoreB.html") 
def main8(): 
    return FileResponse("MoreB.html")
@app.get("/SOO1.html") 
def SOO1(): 
    return FileResponse("SOO1.html")
@app.get("/SMI.html") 
def SMI(): 
    return FileResponse("SMI.html")
@app.get("/par.html") 
def par(): 
    return FileResponse("par.html")
@app.get("/sadmin.html") 
def sadmin(): 
    return FileResponse("sadmin.html")
@app.get("/steach.html") 
def steach(): 
    return FileResponse("steach.html")
@app.get("/trips.html") 
def trips(): 
    return FileResponse("trips.html")
@app.get("/vac.html") 
def vac(): 
    return FileResponse("vac.html")
@app.get("/mainAdmin.html") 
def vac(): 
    return FileResponse("mainAdmin.html")

class User(BaseModel):
    login: Optional[str]
    password: Optional[str]
    first_name: Optional[str]
    phone_number: Optional[str]
    role: Optional[str]

@app.get("/users") 
def get_users(): 
    cursor = connection.cursor() 
    
    sql = "SELECT login, password, first_name, phone_number, role FROM users"
    cursor.execute(sql)
    spisok = cursor.fetchall()

    teachers = []
    for row in spisok:
        teacher = {
            "login": row[0],
            "password": row[1],
            "first_name": row[2],
            "phone_number": row[3],
            "role": row[4]
        }
        teachers.append(teacher)

    return {"users": teachers}
  
@app.get("/users/{login}") 
def get_user_by_id(login: str): 
    cursor = connection.cursor() 
    cursor.execute(f"SELECT * FROM users WHERE login = %s", (login,)) 
    data = cursor.fetchone()
    cursor.close()

    if not data:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    teacher_data = {
        "login": data[0],
        "password": data[1],
        "first_name": data[2],
        "phone_number": data[3]
    } 
    return teacher_data
  
@app.delete("/users/{login}") 
def delete_user_by_id(login: str): 
    cursor = connection.cursor() 
    cursor.execute(f"SELECT * FROM users WHERE login = %s", (login,)) 
    result = cursor.fetchone() 
    if not result: 
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    cursor.execute(f"DELETE FROM users WHERE login = %s", (login,)) 
    connection.commit() 
    cursor.close() 
    return {"message": f"Пользователь с логином {login} удалён"}  

@app.post("/users")
def user(user: User):
    cursor = connection.cursor()
    user_look = "SELECT * FROM users WHERE login = %s"
    cursor.execute(user_look, (user.login,))
    existing_user = cursor.fetchone()

    if not (user.login and user.first_name and user.phone_number and user.password and user.role):
        raise HTTPException(status_code=400, detail="Не заполнены обязательные поля")

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким логином уже существует"
        )

    sql = "INSERT INTO users (login, password, first_name, phone_number, role) VALUES (%s, %s, %s, %s, %s)"
    val = (user.login, user.password, user.first_name, user.phone_number, user.role)
    cursor.execute(sql, val)
    connection.commit()
    print("Пользователь добавлен")
    return {"message": "Пользователь добавлен"}

@app.put("/users/{login}")
def update_user(login: str, user_update: User):
    cursor = connection.cursor()
    
    # Проверяем, существует ли пользователь с данным логином
    cursor.execute("SELECT * FROM users WHERE login = %s", (login,))
    existing_user = cursor.fetchone()
    
    if not existing_user:
        cursor.close()
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    update_query = "UPDATE users SET"
    update_values = []
    
    if user_update.login:
        update_query += " login=%s, "
        update_values.append(user_update.login)
    if user_update.password:
        update_query += " password=%s, "
        update_values.append(user_update.password)
    if user_update.first_name:
        update_query += " first_name=%s, "
        update_values.append(user_update.first_name)
    if user_update.phone_number:
        update_query += " phone_number=%s, "
        update_values.append(user_update.phone_number)
        
    # Удаляем последнюю запятую и пробел
    update_query = update_query.rstrip(', ')
    update_query += " WHERE login = %s"
    update_values.append(login)
    
    try:
        cursor.execute(update_query, tuple(update_values))
        connection.commit()
    except Exception as e:
        connection.rollback()
        cursor.close()
        raise HTTPException(status_code=500, detail="Ошибка базы данных")
    
    cursor.close()
    
    return {
        "status": "success",
        "message": f"Пользователь с логином {login} успешно обновил информацию о себе",
    }

###############################################################################################################
class UserLogin(BaseModel):
    login: str
    password: str

@app.post("/users/login")
def login(user: UserLogin):
    cursor = connection.cursor()
    user_look = "SELECT login, password, role FROM users WHERE login = %s"
    cursor.execute(user_look, (user.login,))
    existing_user = cursor.fetchone()

    if not existing_user or existing_user[1] != user.password:
        raise HTTPException(status_code=400, detail="Неверные данные")

    return {"access_token": "fake_token", "role": existing_user[2]}
###############################################################################################################

class Client(BaseModel):
    first_name: Optional[str]
    phone_number: Optional[str]
    role: Optional[str]

@app.get("/clients")
def get_clients():
    cursor = connection.cursor()

    sql = "SELECT first_name, phone_number, role FROM clients"
    cursor.execute(sql)
    spisok = cursor.fetchall()

    client_classes = []
    for row in spisok:
        client = {
            "first_name": row[0],
            "phone_number": row[1],
            "role": row[2]
        }
        client_classes.append(client)

    return {"clients": client_classes}

@app.get("/clients/{phone_number}")
def get_client_by_id(phone_number: str):
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM clients WHERE phone_number = %s", (phone_number,))
    data = cursor.fetchone()
    
    cursor.close()
    if not data:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    
    # Создаем словарь с данными
    client_data = {
        "first_name": data[1],
        "phone_number": data[2]
    }
    return client_data

@app.delete("/clients/{phone_number}")
def delete_client_by_phone(phone_number: str):
    cursor = connection.cursor()
    # Используем параметризованный запрос для защиты от SQL-инъекций
    cursor.execute("SELECT * FROM clients WHERE phone_number = %s", (phone_number,))
    result = cursor.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    cursor.execute("DELETE FROM clients WHERE phone_number = %s", (phone_number,))
    connection.commit()
    cursor.close()
    return {"message": f"Клиент с номером телефона {phone_number} удален"}

@app.post("/clients")
def client(user_data: Client):
    cursor = connection.cursor()
    # есть ли такой пользователь?
    user_look = "SELECT * FROM clients WHERE phone_number = %s"
    user_data_ch = (user_data.phone_number,)
    cursor.execute(user_look, user_data_ch)
    answer = cursor.fetchone()
    if not user_data.phone_number and user_data.first_name:
        raise HTTPException(status_code=400, detail="Не заполнены обязательные поля")
    if answer:
        raise HTTPException(
            status_code=400,
            detail="Клиент таким номером телефона уже существует)",
        )   

    # иначе новый пользователь
    sql = "INSERT INTO clients (phone_number, first_name,role) VALUES (%s, %s,%s)"
    val = (user_data.phone_number, user_data.first_name,user_data.role)
    cursor.execute(sql, val)
    connection.commit()
    print("Клиент добавлен")
    return {"message": "Клиент добавлен"}

@app.put("/clients/{phone_number}")
def update_client(phone_number: str, client_update: Client):
    cursor = connection.cursor()                    
    update_query="UPDATE clients SET"
    update_values = []
    if client_update.first_name:
        update_query += " first_name= %s, "
        update_values.append(client_update.first_name)
    if client_update.phone_number:
        update_query += " phone_number = %s, "
        update_values.append(client_update.phone_number)
    update_query = update_query[:-2]
    update_query += " WHERE phone_number = %s"
    update_values.append(phone_number)

    cursor.execute(update_query, tuple(update_values))

    connection.commit()
    return {
        "status": "success",
        "message": f"Пользователь с id:{phone_number} успешно обновил информацию о себе",
    }
