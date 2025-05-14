from dotenv import load_dotenv
import os
from extensions import cache

from datetime import datetime
from flask import Flask, request, jsonify
from flask_login import login_user, LoginManager
from flask_restful import Api
from flask_cors import CORS
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from flask_wtf.csrf import CSRFProtect

from data.__all_models import User
from data import user_resources, tournament_resources, category_resources, round_resources, game_resources, pgn_resources
from forms.login import LoginForm
from forms.user import RegisterForm
from data import db_session


load_dotenv()

app = Flask(__name__)
api = Api(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

password = os.getenv("DB_PASSWORD")
jwt_secret = os.getenv("JWT_SECRET_KEY")
app.config['SECRET_KEY'] = 'yandexlyceum_secret_key'
app.config["JWT_SECRET_KEY"] = jwt_secret
if not password or not jwt_secret:
    raise ValueError("Отсутствуют обязательные переменные окружения DB_PASSWORD или JWT_SECRET_KEY")
app.config['WTF_CSRF_ENABLED'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://root:{password}@localhost/hse_chess_results'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

cache.init_app(app, config={
    'CACHE_TYPE': 'FileSystemCache',
    'CACHE_DIR': os.path.join(BASE_DIR, 'cache'),
    'CACHE_DEFAULT_TIMEOUT': 3600
})
jwt = JWTManager(app)
csrf = CSRFProtect()
csrf.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)

CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}}, always_send=True)


@app.before_request
def handle_options_request():
    if request.method == 'OPTIONS':
        response = app.make_response('')
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response


@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.scoped_session_factory.remove()


@login_manager.user_loader
def load_user(user_id):
    db_sess = db_session.create_session()
    return db_sess.query(User).filter(User.id == user_id).first()


@app.route("/api/user", methods=["GET"])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()

    db_sess = db_session.create_session()
    user = db_sess.query(User).get(int(user_id))
    if user:
        return jsonify({"fio": user.fio, "is_admin": user.is_admin, "id": user_id}), 200
    return jsonify({"error": "Пользователь не найден"}), 404



@app.route('/api/register', methods=['POST'])
def register():
    form = RegisterForm(data=request.json)
    if form.validate():
        if form.password.data != form.password_again.data:
            return jsonify({"errors": {"password": "Пароли не совпадают"}}), 400
        db_sess = db_session.create_session()
        if db_sess.query(User).filter(User.email == form.email.data).first():
            return jsonify({"errors": {"email": "Этот email уже зарегистрирован"}}), 400
        if form.gender.data == 'М':
            form.gender.data = ""
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
        if not user:
            return jsonify({"errors": {"email": "Пользователь не зарегистрирован"}}), 400
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
        exit(1)
    db_sess = db_session.create_session()
    if not db_sess.query(User).all():
        user = User()
        user.id = 1
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
    api.add_resource(tournament_resources.TournamentListResource, '/api/tournaments')
    api.add_resource(category_resources.CategoryListResource, '/api/categories')
    api.add_resource(round_resources.RoundListResource, '/api/rounds')
    api.add_resource(game_resources.GameListResource, '/api/games')
    api.add_resource(pgn_resources.PGNUploadResource, '/api/pgn_upload')

    # для одного объекта
    api.add_resource(user_resources.UserResource, "/api/users/<int:user_id>")
    api.add_resource(tournament_resources.TournamentResource, "/api/tournaments/<int:tournament_id>")
    api.add_resource(category_resources.CategoryResource, '/api/categories/<int:category_id>')
    api.add_resource(round_resources.RoundResource, '/api/rounds/<int:round_id>')
    api.add_resource(game_resources.GameResource, '/api/games/<int:game_id>')

    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == '__main__':
    main()