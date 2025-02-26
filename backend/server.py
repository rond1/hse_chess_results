from dotenv import load_dotenv
import os

from flask import Flask, request, jsonify
from flask_login import login_user, LoginManager

from data import user_resources
from forms.login import LoginForm
from forms.user import RegisterForm
from flask_restful import Api
from flask_cors import CORS
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from flask_wtf.csrf import CSRFProtect
from flask_sqlalchemy import SQLAlchemy
from data import db_session
from data.users import User


load_dotenv()

app = Flask(__name__)
api = Api(app)

password = os.getenv("DB_PASSWORD")
jwt_secret = os.getenv("JWT_SECRET_KEY")
app.config['SECRET_KEY'] = 'yandexlyceum_secret_key'
app.config["JWT_SECRET_KEY"] = jwt_secret
if not password or not jwt_secret:
    raise ValueError("Отсутствуют обязательные переменные окружения DB_PASSWORD или JWT_SECRET_KEY")
app.config['WTF_CSRF_ENABLED'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://root:{password}@localhost/hse_chess_results'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

jwt = JWTManager(app)
csrf = CSRFProtect()
csrf.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)

CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})


@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@login_manager.user_loader
def load_user(user_id):
    db_sess = db_session.create_session()
    return db_sess.query(User).filter(User.id == user_id).first()


@app.route("/api/user", methods=["GET"])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    print(f"User ID из токена: {user_id}")

    db_sess = db_session.create_session()
    user = db_sess.query(User).get(int(user_id))
    if user:
        print(f"Найден пользователь: {user.fio}")
        return jsonify({"fio": user.fio, "is_admin": user.is_admin}), 200
    print("Пользователь не найден")
    return jsonify({"error": "User not found"}), 404



@app.route('/api/register', methods=['POST'])
def register():
    print("Полученные данные:", request.json)
    form = RegisterForm(data=request.json)

    if form.validate():
        print("Форма прошла валидацию")
    else:
        print("Ошибки валидации:", form.errors)
    if form.validate():
        if form.password.data != form.password_again.data:
            return jsonify({"errors": {"password": "Пароли не совпадают"}}), 400
        db_sess = db_session.create_session()
        if db_sess.query(User).filter(User.email == form.email.data).first():
            return jsonify({"errors": {"email": "Этот email уже зарегистрирован"}}), 400
        user = User(
            fio=form.fio.data,
            email=form.email.data,
            is_female=bool(form.gender.data),
            faculty=form.faculty.data,
            degree=form.degree.data
        )
        user.set_password(form.password.data)
        db_sess.add(user)
        db_sess.commit()
        return jsonify({"message": "Пользователь зарегистрирован"}), 201
    return jsonify({"errors": form.errors}), 400


@app.route('/api/login', methods=['POST'])
def login():
    form = LoginForm(data=request.json)
    if form.validate():
        db_sess = db_session.create_session()
        user = db_sess.query(User).filter(User.email == form.email.data).first()
        if user and user.check_password(form.password.data):
            if not user.is_activated and not user.is_admin:
                return jsonify({"errors": {"email": "Пользователь не активирован"}}), 400

            login_user(user, remember=form.remember_me.data)
            access_token = create_access_token(identity=str(user.id))

            return jsonify({
                "message": "Вы успешно вошли",
                "token": access_token
            }), 200
    return jsonify({"errors": form.errors}), 400


def main():
    try:
        db_session.global_init(username="root", password=password, host="localhost", port=3306, db_name="hse_chess_results")
    except Exception as e:
        print(f"Ошибка подключения к базе данных: {e}")
        exit(1)
    db_sess = db_session.create_session()
    if not db_sess.query(User).all():
        user = User()
        user.is_activated = True
        user.is_admin = True
        user.fio = 'Админ'
        user.email = "admin@admin.ru"
        user.set_password('admin')
        user.faculty = 'cs'
        user.degree = '15'
        db_sess.add(user)
        db_sess.commit()

    # для списка
    api.add_resource(user_resources.UserListResource, '/api/users')

    # для одного объекта
    api.add_resource(user_resources.UserResource, "/api/user/<int:user_id>")

    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == '__main__':
    main()