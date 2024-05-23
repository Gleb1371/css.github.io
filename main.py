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

app = FastAPI()

# Устанавливаем соединение с базой данных PostgreSQL через pgAdmin 4
connection = psycopg2.connect(
        host="dpg-coqfvgn79t8c738glb60-a",
        port=5432,
        database= "hainan_v1i3",
        user="hainan_v1i3_user",
        password="lwftcEojXOLYdS8GeUoixNhGSB9OtZyJ"
    )
app.mount("/static", StaticFiles(directory="static"), name="static")
@app.get("/") 
def main(): 
    return FileResponse("index.html")

class User(BaseModel): 
    login: str
    password: str
    first_name: str
    phone_number: str  
    role: str

class Client(BaseModel):
    first_name: Optional[str]
    phone_number: Optional[str]
    role: Optional[str]

@app.get("/users") 
def get_users(): 
        cursor = connection.cursor() 
        cursor.execute("SELECT * FROM users") 
        result = cursor.fetchall()
        cursor.close() 
        return {"users": result} 
  
@app.get("/users/{id}") 
def get_user_by_id(id: int): 
    cursor = connection.cursor() 
    cursor.execute(f"SELECT * FROM users WHERE id = {id}") 
    result = cursor.fetchone()
    cursor.close()
    if not result:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return {"User": result} 
  
@app.delete("/users/{id}") 
def delete_user_by_id(id: int): 
    cursor = connection.cursor() 
    cursor.execute(f"SELECT * FROM users WHERE id = {id}") 
    result = cursor.fetchone() 
    if not result: 
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    cursor.execute(f"DELETE FROM users WHERE id = {id}") 
    connection.commit() 
    cursor.close() 
    return {"message": "Пользователь удалён"}  

@app.post("/users")
def create_user(user: User):
    cursor = connection.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE login = %s",
        (user.login,)
    )
    existing_user = cursor.fetchone()
    if existing_user:
        cursor.close()
        raise HTTPException(status_code=400, detail="Пользователь с таким логином уже существует")

    cursor.execute(
        "INSERT INTO users (login, password, first_name, phone_number, role) VALUES (%s, %s, %s, %s, %s)",
        (user.login, user.password, user.first_name, user.phone_number, user.role)
    )
    connection.commit()
    cursor.close()
    return {"message": "Пользователь успешно создан"}

@app.put("/users/{id}")
def update_user(id: int, user_update: User):
    cursor = connection.cursor()
    cursor.execute(f"SELECT * FROM users WHERE id = {id}")
    existing_user = cursor.fetchone()

    if not existing_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    cursor.execute(
        "UPDATE users SET login = %s, password = %s, first_name = %s, phone_number = %s, role = %s WHERE id = %s",
        (user_update.login, user_update.password, user_update.first_name, user_update.phone_number, user_update.role, id)
    )
    connection.commit()
    cursor.close()

    return {"message": "Пользователь успешно обновлен"}

@app.post("/users/login")
def login_user(user_data: User):
    cursor = connection.cursor()
    sql = "SELECT id FROM users WHERE login = %s AND password = %s"
    val = (user_data.login, user_data.password)
    cursor.execute(sql, val)
    id = cursor.fetchone()

    if not id:
        raise HTTPException(
            status_code=400, detail="Неверный логин или пароль"
        )

    access_token = generate_access_token(id)

    return {"access_token": access_token, "token_type": "Bearer", "message": "Вход выполнен успешно"}

def generate_access_token(id: int):
    expiration_time = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(id), "exp": expiration_time}
    access_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return access_token

@app.get("/clients")
def get_clients():
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM clients")
    result = cursor.fetchall()
    cursor.close()
    return {"clients": result}

@app.get("/clients/{id}")
def get_client_by_id(id: int):
    cursor = connection.cursor()
    cursor.execute(f"SELECT * FROM clients WHERE id = {id}")
    result = cursor.fetchone()
    cursor.close()
    if not result:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    return result

@app.delete("/clients/{id}")
def delete_client_by_id(id: int):
    cursor = connection.cursor()
    cursor.execute(f"SELECT * FROM clients WHERE id = {id}")
    result = cursor.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    cursor.execute(f"DELETE FROM clients WHERE id = {id}")
    connection.commit()
    cursor.close()
    return {"message": f"Клиент с ID {id} удален"}

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
            detail="чел с таким номером телефона уже существует)",
        )
         

    # иначе новый пользователь
    sql = "INSERT INTO clients (phone_number, first_name,role) VALUES (%s, %s,%s)"
    val = (user_data.phone_number, user_data.first_name,user_data.role)
    cursor.execute(sql, val)
    connection.commit()
    print("чел добавлен")
    return {"message": "чел добавлен"}


@app.put("/clients/{id}")
def update_client(id: int, client_update: Client):
    cursor = connection.cursor()
    cursor.execute(f"SELECT * FROM clients WHERE id = {id}")
    existing_client = cursor.fetchone()

    if not existing_client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    cursor.execute(
        "UPDATE clients SET first_name = %s, phone_number = %s, role = %s WHERE id = %s",
        (client_update.first_name, client_update.phone_number, client_update.role, id)
    )
    connection.commit()
    cursor.close()

    return {"message": "Клиент успешно обновлен"}
