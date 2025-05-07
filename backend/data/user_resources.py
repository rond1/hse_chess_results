from flask import jsonify, request
from flask_restful import abort, Resource
from data import db_session
from data.users import User
from werkzeug.security import generate_password_hash

from forms.user_put import UserPutForm

from data.tournaments import Tournament


def abort_if_user_not_found(user_id):
    session = db_session.create_session()
    user = session.query(User).get(user_id)
    if not user:
        abort(404, message=f"Пользователь {user_id} не найден")


class UserListResource(Resource):
    def get(self):
        session = db_session.create_session()
        users = session.query(User).filter(User.is_admin == False).order_by(User.is_activated).all()
        return jsonify([user.to_dict(only=('id', 'fio', 'email', 'is_activated')) for user in users])


class UserResource(Resource):
    def get(self, user_id):
        abort_if_user_not_found(user_id)
        session = db_session.create_session()
        user = session.query(User).filter_by(id=user_id).first()
        return jsonify(user.to_dict(only=('id', 'fio', 'email', 'is_activated', 'faculty', 'degree', 'is_female')))


    def put(self, user_id):
        abort_if_user_not_found(user_id)
        session = db_session.create_session()
        user = session.query(User).get(user_id)
        data = request.json
        if "is_activated" in data and len(data) == 1:
            user.is_activated = data["is_activated"]
        else:
            form = UserPutForm(data=request.json)
            if not form.validate():
                return jsonify({"error": "Некорректные данные", "messages": form.errors}), 400

            user.email = form.email.data
            user.fio = form.fio.data
            user.gender = form.gender.data
            user.faculty = form.faculty.data
            user.degree = form.degree.data

            if form.password.data:
                user.password = generate_password_hash(form.password.data)
        session.commit()
        return jsonify({'success': 'Пользователь обновлён'})


    def delete(self, user_id):
        abort_if_user_not_found(user_id)
        session = db_session.create_session()
        user = session.query(User).get(user_id)
        tournaments = session.query(Tournament).filter_by(creator_id=user_id).all()
        for tournament in tournaments:
            tournament.creator_id = 1
        session.commit()
        session.delete(user)
        session.commit()
        return jsonify({'success': 'Пользователь удалён'})
