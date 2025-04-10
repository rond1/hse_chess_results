# HSE Chess Results

## Требования к приложению

1. Приложение должно устанавливаться и запускаться по инструкции из README 
2. При запуске приложение должно разворачивать http сервер на 5000 порту 
3. Должны осуществляться регистрация и аутентификация пользователей
4. Только для активированных пользователей доступны создание, редактирование и удаление турнира
5. Удобный просмотр турнирных таблиц

## Как установить

1. `python -m venv venv`
1. unix: `source venv/bin/activate` / windows: `.\venv\Scripts\activate`
1. `pip install -r requirements.txt`

## Как запустить

1. создать `.env` файл

```
DB_PASSWORD=your_database_password
JWT_SECRET_KEY=your_jwt_secret_key

```


2. `python server.py`
3. `npm start`
